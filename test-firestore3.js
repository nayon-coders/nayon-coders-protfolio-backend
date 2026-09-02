require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  databaseId: 'default'
});

async function test() {
  try {
    console.log("Checking Firestore with databaseId='default'...");
    await db.collection('test').doc('test').set({ a: 1 });
    console.log("Write successful!");
    process.exit(0);
  } catch (e) {
    console.error("Firestore Error:", e.message, e.code);
    process.exit(1);
  }
}
test();
