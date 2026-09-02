const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');
const { env } = require('./env');

let db, auth, storage;
let admin = {};

try {
  // Initialize Firebase Admin SDK
  // Ensure that .env variables are properly loaded and formatted
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      const app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com` // Default storage bucket pattern
    });

    db = getFirestore(app, 'default');
    auth = getAuth(app);
    storage = getStorage(app);
    
    // For backward compatibility in our app
    admin = { firestore: () => db, auth: () => auth, storage: () => storage };
    
    console.log('Firebase Admin Initialized Successfully');
  } else {
    console.warn('Firebase Admin Config is missing. Check your environment variables.');
  }
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error);
}

module.exports = {
  admin,
  db,
  auth,
  storage
};
