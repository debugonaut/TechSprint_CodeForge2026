const admin = require('firebase-admin');

// On Vercel, we can't read a file easily. We will pass the JSON string as an ENV variable.
let serviceAccount;
try {
  serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
    : require('./serviceAccountKey.json'); 
} catch (error) {
  console.error("Firebase Service Account missing or invalid. Search and save will fail.");
}

if (!admin.apps.length) {
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
