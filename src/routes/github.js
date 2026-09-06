const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Helper to get GitHub username from profile
const getGithubUsername = async () => {
  const profileDoc = await db.collection('profile').doc('main').get();
  if (!profileDoc.exists) return 'nayon-coders';
  
  const data = profileDoc.data();
  // Extract username from githubUrl (e.g. https://github.com/nayon-coders)
  let username = 'nayon-coders';
  if (data.links) {
    const ghLink = data.links.find(l => l.url.includes('github.com'));
    if (ghLink) {
      const parts = ghLink.url.split('github.com/');
      if (parts.length > 1) {
        username = parts[1].split('/')[0];
      }
    }
  }
  return username;
};

const getGithubHeaders = () => {
  const headers = { 'Accept': 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

// GET all public repositories for the user
router.get('/repos', async (req, res) => {
  try {
    const username = await getGithubUsername();
    
    // Fetch repos from GitHub
    const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: getGithubHeaders()
    });

    // Fetch synced projects from db
    const projectsSnapshot = await db.collection('projects').where('source', '==', 'github').get();
    const syncedSlugs = new Set();
    projectsSnapshot.forEach(doc => {
      syncedSlugs.add(doc.data().slug);
    });

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at,
      isSynced: syncedSlugs.has(repo.name)
    }));

    res.json({ success: true, data: repos, username });
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Error fetching github repos:', errorMessage);
    res.status(500).json({ success: false, message: `Failed to fetch repositories: ${errorMessage}` });
  }
});

// POST sync a repository to projects collection
router.post('/sync', async (req, res) => {
  try {
    const { repoName } = req.body;
    if (!repoName) return res.status(400).json({ success: false, message: 'repoName is required' });

    const username = await getGithubUsername();

    // 1. Fetch repo details
    const repoRes = await axios.get(`https://api.github.com/repos/${username}/${repoName}`, {
      headers: getGithubHeaders()
    });
    const repo = repoRes.data;

    // 2. Fetch repo commits
    let timeline = [];
    try {
      const commitsRes = await axios.get(`https://api.github.com/repos/${username}/${repoName}/commits?per_page=15`, {
        headers: getGithubHeaders()
      });
      
      // Map commits to timeline format (newest first, we can reverse it if we want chronological)
      // timeline format: { id, date, title, description, status, order }
      timeline = commitsRes.data.map((c, index) => ({
        id: uuidv4(),
        date: new Date(c.commit.author.date).toISOString().split('T')[0],
        title: `Commit: ${c.commit.message.split('\n')[0]}`, // first line of commit message
        description: `Author: ${c.commit.author.name}\nSHA: ${c.sha.substring(0, 7)}`,
        status: 'completed',
        order: commitsRes.data.length - index
      })).reverse(); // Reverse so older commits are first in the timeline

    } catch (commitErr) {
      console.error(`Failed to fetch commits for ${repoName}:`, commitErr.message);
      // It's ok, we just have an empty timeline
    }

    // 3. Create or update the project
    // Check if a project with this GitHub URL already exists
    const existingQuery = await db.collection('projects').where('slug', '==', repoName).get();
    
    let projectId = uuidv4();
    let isUpdate = false;
    
    if (!existingQuery.empty) {
      projectId = existingQuery.docs[0].id;
      isUpdate = true;
    }

    const projectData = {
      name: repo.name.replace(/-/g, ' '),
      slug: repo.name,
      shortDescription: repo.description || 'Synced from GitHub',
      description: repo.description || 'Synced from GitHub',
      category: repo.language ? `Application` : 'Open Source',
      status: 'published',
      showOnHomepage: true,
      showInPortfolio: true,
      featured: repo.stargazers_count > 0,
      links: [
        { type: 'github', label: 'GitHub Repository', url: repo.html_url, enabled: true }
      ],
      technologies: [],
      development: {
        startDate: repo.created_at ? repo.created_at.split('T')[0] : '',
        endDate: repo.updated_at ? repo.updated_at.split('T')[0] : '',
      },
      details: {
        features: [],
      },
      timeline: timeline,
      source: 'github',
      updatedAt: new Date().toISOString()
    };

    if (!isUpdate) {
      projectData.createdAt = new Date().toISOString();
      await db.collection('projects').doc(projectId).set(projectData);
    } else {
      // If updating, maybe we don't overwrite user's custom images/descriptions
      const existingData = existingQuery.docs[0].data();
      await db.collection('projects').doc(projectId).update({
        timeline: timeline, // Refresh commits
        updatedAt: new Date().toISOString(),
        // Add the github link if it doesn't exist
        links: existingData.links?.some(l => l.url === repo.html_url) 
                ? existingData.links 
                : [...(existingData.links || []), { type: 'github', label: 'GitHub Repository', url: repo.html_url, enabled: true }]
      });
    }

    res.json({ success: true, message: `Project ${repoName} synced successfully`, projectId });
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`Error syncing github repo ${req.body?.repoName}:`, errorMessage);
    res.status(500).json({ success: false, message: `Failed to sync repository: ${errorMessage}` });
  }
});

// DELETE unsync a repository
router.delete('/sync/:repoName', async (req, res) => {
  try {
    const { repoName } = req.params;
    if (!repoName) return res.status(400).json({ success: false, message: 'repoName is required' });

    const existingQuery = await db.collection('projects').where('slug', '==', repoName).get();
    
    if (existingQuery.empty) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await db.collection('projects').doc(existingQuery.docs[0].id).delete();
    
    res.json({ success: true, message: `Project ${repoName} unsynced and removed successfully` });
  } catch (error) {
    console.error(`Error unsyncing github repo ${req.params?.repoName}:`, error.message);
    res.status(500).json({ success: false, message: 'Failed to unsync repository' });
  }
});

module.exports = router;
