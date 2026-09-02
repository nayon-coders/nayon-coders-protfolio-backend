require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

let app;

// Ensure that .env variables are properly loaded and formatted
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle escaped newlines in the private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID, // Explicitly pass projectId here
  });
} else {
  console.error("Missing Firebase configuration in .env");
  process.exit(1);
}

const db = getFirestore(app, 'default');
const auth = getAuth(app);

const createAdmin = async (email, password, name) => {
  try {
    console.log(`Creating user in Firebase Auth: ${email}`);
    let userRecord;
    try {
      // Check if user already exists
      userRecord = await auth.getUserByEmail(email);
      console.log('User already exists in Auth. Updating password...');
      userRecord = await auth.updateUser(userRecord.uid, { password });
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: name,
        });
      } else {
        throw err;
      }
    }

    console.log(`User created/updated with UID: ${userRecord.uid}`);
    console.log('Adding user to Firestore admins collection...');

    await db.collection('admins').doc(userRecord.uid).set({
      email: email,
      name: name,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log('✅ Admin user successfully created and activated!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

const args = process.argv.slice(2);
const email = args[0] || 'admin@nayon.com';
const password = args[1] || 'Admin@123456';
const name = args[2] || 'Nayon';

createAdmin(email, password, name);
