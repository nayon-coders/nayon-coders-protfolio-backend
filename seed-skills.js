const { db } = require('./src/config/firebase');
const { v4: uuidv4 } = require('uuid');

const getDevicon = (name) => `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-original.svg`;

const skills = [
  // MOBILE
  {
    name: 'Flutter', category: 'Mobile', description: 'Cross-platform mobile development',
    icon: getDevicon('flutter'), skillLevel: 'Advanced', experienceYears: 3, featured: true
  },
  {
    name: 'Dart', category: 'Mobile', description: 'Programming language for Flutter',
    icon: getDevicon('dart'), skillLevel: 'Advanced', experienceYears: 3, featured: true
  },
  {
    name: 'Android', category: 'Mobile', description: 'Native Android development',
    icon: getDevicon('android'), skillLevel: 'Intermediate', experienceYears: 2, featured: false
  },
  {
    name: 'iOS', category: 'Mobile', description: 'Native iOS development concepts',
    icon: getDevicon('apple'), skillLevel: 'Beginner', experienceYears: 1, featured: false
  },

  // FRONTEND
  {
    name: 'React.js', category: 'Frontend', description: 'UI component library',
    icon: getDevicon('react'), skillLevel: 'Advanced', experienceYears: 3, featured: true
  },
  {
    name: 'JavaScript', category: 'Frontend', description: 'Core web programming',
    icon: getDevicon('javascript'), skillLevel: 'Advanced', experienceYears: 4, featured: false
  },
  {
    name: 'HTML', category: 'Frontend', description: 'Web structuring',
    icon: getDevicon('html5'), skillLevel: 'Expert', experienceYears: 5, featured: false
  },
  {
    name: 'CSS', category: 'Frontend', description: 'Web styling',
    icon: getDevicon('css3'), skillLevel: 'Advanced', experienceYears: 5, featured: false
  },
  {
    name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework',
    icon: getDevicon('tailwindcss'), skillLevel: 'Advanced', experienceYears: 2, featured: false
  },

  // BACKEND
  {
    name: 'Node.js', category: 'Backend', description: 'JavaScript runtime environment',
    icon: getDevicon('nodejs'), skillLevel: 'Intermediate', experienceYears: 2, featured: true
  },
  {
    name: 'Express.js', category: 'Backend', description: 'Node.js web application framework',
    icon: getDevicon('express'), skillLevel: 'Intermediate', experienceYears: 2, featured: true
  },
  {
    name: 'REST API', category: 'Backend', description: 'API architecture design',
    icon: 'https://cdn-icons-png.flaticon.com/512/8181/8181467.png', skillLevel: 'Advanced', experienceYears: 3, featured: true
  },
  {
    name: 'Laravel', category: 'Backend', description: 'PHP web framework',
    icon: getDevicon('laravel'), skillLevel: 'Intermediate', experienceYears: 2, featured: false
  },
  {
    name: 'PHP', category: 'Backend', description: 'Server-side scripting language',
    icon: getDevicon('php'), skillLevel: 'Intermediate', experienceYears: 3, featured: false
  },

  // DATABASE
  {
    name: 'Firebase', category: 'Database', description: 'Backend-as-a-Service platform',
    icon: getDevicon('firebase'), skillLevel: 'Advanced', experienceYears: 3, featured: true
  },
  {
    name: 'Firestore', category: 'Database', description: 'NoSQL cloud database',
    icon: getDevicon('firebase'), skillLevel: 'Advanced', experienceYears: 3, featured: true
  },
  {
    name: 'MySQL', category: 'Database', description: 'Relational database management',
    icon: getDevicon('mysql'), skillLevel: 'Intermediate', experienceYears: 2, featured: true
  },
  {
    name: 'PostgreSQL', category: 'Database', description: 'Advanced open source RDBMS',
    icon: getDevicon('postgresql'), skillLevel: 'Intermediate', experienceYears: 1, featured: false
  },
  {
    name: 'Supabase', category: 'Database', description: 'Open source Firebase alternative',
    icon: getDevicon('supabase'), skillLevel: 'Beginner', experienceYears: 1, featured: false
  },

  // AI
  {
    name: 'OpenAI API', category: 'AI', description: 'Integration of LLMs into apps',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', skillLevel: 'Intermediate', experienceYears: 1, featured: true
  },
  {
    name: 'Gemini API', category: 'AI', description: 'Google AI model integration',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', skillLevel: 'Intermediate', experienceYears: 1, featured: false
  },
  {
    name: 'AI Integration', category: 'AI', description: 'Building AI-powered features',
    icon: 'https://cdn-icons-png.flaticon.com/512/2103/2103328.png', skillLevel: 'Intermediate', experienceYears: 1, featured: false
  },
  {
    name: 'RAG', category: 'AI', description: 'Retrieval-Augmented Generation',
    icon: 'https://cdn-icons-png.flaticon.com/512/8636/8636952.png', skillLevel: 'Beginner', experienceYears: 0.5, featured: false
  },

  // DevOps / Hosting
  {
    name: 'Git', category: 'DevOps', description: 'Version control system',
    icon: getDevicon('git'), skillLevel: 'Advanced', experienceYears: 3, featured: false
  },
  {
    name: 'GitHub', category: 'DevOps', description: 'Code hosting platform',
    icon: getDevicon('github'), skillLevel: 'Advanced', experienceYears: 3, featured: false
  },
  {
    name: 'Nginx', category: 'DevOps', description: 'Web server & reverse proxy',
    icon: getDevicon('nginx'), skillLevel: 'Beginner', experienceYears: 1, featured: false
  },
  {
    name: 'PM2', category: 'DevOps', description: 'Node.js process manager',
    icon: 'https://cdn-icons-png.flaticon.com/512/10103/10103001.png', skillLevel: 'Intermediate', experienceYears: 1, featured: false
  },
  {
    name: 'Firebase Hosting', category: 'DevOps', description: 'Fast and secure web hosting',
    icon: getDevicon('firebase'), skillLevel: 'Advanced', experienceYears: 2, featured: false
  },

  // APIs & Services
  {
    name: 'Google Maps API', category: 'APIs', description: 'Location and map services',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg', skillLevel: 'Advanced', experienceYears: 2, featured: true
  },
  {
    name: 'Payment Gateway Integration', category: 'APIs', description: 'Stripe, PayPal, etc.',
    icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png', skillLevel: 'Intermediate', experienceYears: 2, featured: false
  },
  {
    name: 'Third-party API Integration', category: 'APIs', description: 'Connecting various services',
    icon: 'https://cdn-icons-png.flaticon.com/512/8181/8181467.png', skillLevel: 'Advanced', experienceYears: 3, featured: false
  }
];

const seedSkills = async () => {
  try {
    const batch = db.batch();
    
    // First, clear existing skills to avoid duplicates
    const snapshot = await db.collection('skills').get();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    console.log(`Deleted ${snapshot.size} existing skills.`);

    // Add new skills
    skills.forEach((skill, index) => {
      const docRef = db.collection('skills').doc(uuidv4());
      const slug = skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      batch.set(docRef, {
        ...skill,
        slug,
        active: true,
        displayOrder: index,
        createdAt: new Date().toISOString()
      });
    });

    await batch.commit();
    console.log(`Successfully added ${skills.length} skills!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding skills:', error);
    process.exit(1);
  }
};

seedSkills();
