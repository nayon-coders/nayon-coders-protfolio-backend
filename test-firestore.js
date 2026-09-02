require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

async function test() {
  try {
    console.log("Checking Firestore...");
    await db.collection('test').doc('test').set({ a: 1 });
    console.log("Write successful!");
    process.exit(0);
  } catch (e) {
    console.error("Firestore Error:", e.message, e.code);
    process.exit(1);
  }
}
test();
