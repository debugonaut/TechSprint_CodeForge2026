const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables or local file
let serviceAccount;

if (process.env.FIREBASE_PROJECT_ID) {
  // Vercel/Production: Use environment variables
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
  // Local development: Use service account file
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (error) {
    console.error("Firebase Service Account file not found. Make sure serviceAccountKey.json exists.");
  }
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized.');
  } catch (error) {
    console.error('Firebase Admin Error:', error);
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };
