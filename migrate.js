require('dotenv').config();
const { db } = require('./src/config/firebase');

const OLD_URL_PREFIX = 'http://localhost:5000';
const NEW_URL_PREFIX = 'https://nayon-coders-protfolio-backend.onrender.com';

async function updateDb() {
    console.log('Updating database URL references from localhost to base URL...');
    
    const updateUrl = (url) => {
        if (!url || typeof url !== 'string') return url;
        if (url.startsWith(OLD_URL_PREFIX)) {
            return url.replace(OLD_URL_PREFIX, NEW_URL_PREFIX);
        }
        return url;
    };

    // Profile
    const profileDoc = await db.collection('profile').doc('main').get();
    if (profileDoc.exists) {
        const data = profileDoc.data();
        if (data.profileImage && data.profileImage.startsWith(OLD_URL_PREFIX)) {
            await db.collection('profile').doc('main').update({
                profileImage: updateUrl(data.profileImage)
            });
            console.log('Updated profile document');
        }
    }

    // Projects
    const projectsSnapshot = await db.collection('projects').get();
    for (const doc of projectsSnapshot.docs) {
        const data = doc.data();
        let needsUpdate = false;
        let updateData = {};
        
        if (data.thumbnail && data.thumbnail.startsWith(OLD_URL_PREFIX)) {
            updateData.thumbnail = updateUrl(data.thumbnail);
            needsUpdate = true;
        }
        
        if (data.gallery && Array.isArray(data.gallery)) {
            const newGallery = data.gallery.map(img => {
                if (img.url && img.url.startsWith(OLD_URL_PREFIX)) {
                    needsUpdate = true;
                    return { ...img, url: updateUrl(img.url) };
                }
                return img;
            });
            if (needsUpdate) updateData.gallery = newGallery;
        }
        
        if (needsUpdate) {
            await doc.ref.update(updateData);
            console.log(`Updated project ${doc.id}`);
        }
    }
    
    // Settings
    const settingsDoc = await db.collection('settings').doc('main').get();
    if (settingsDoc.exists) {
        const data = settingsDoc.data();
        let needsUpdate = false;
        let updateData = {};
        
        if (data.logo && data.logo.startsWith(OLD_URL_PREFIX)) {
            updateData.logo = updateUrl(data.logo);
            needsUpdate = true;
        }
        if (data.favicon && data.favicon.startsWith(OLD_URL_PREFIX)) {
            updateData.favicon = updateUrl(data.favicon);
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            await db.collection('settings').doc('main').update(updateData);
            console.log('Updated settings document');
        }
    }

    console.log('Database URLs updated successfully!');
}

updateDb().catch(console.error);
