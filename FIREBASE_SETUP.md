# Firebase Setup Guide for RecallBin

To use RecallBin, you need a Firebase project with **Authentication** and **Firestore** enabled.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"**.
3. Name it `Search-Recall-Bin` (or anything you like).
4. Disable Google Analytics (not needed for this MVP).
5. Click **"Create project"**.

## 2. Enable Authentication
1. In the left sidebar, click **Build > Authentication**.
2. Click **"Get started"**.
3. Select **"Email/Password"** from the Sign-in method list.
4. Enable **Email/Password** and click **Save**.
5. (Optional) To add Google Sign-In, click **"Add new provider"** > **Google** -> Enable -> Save.

## 3. Enable Firestore Database
1. In the left sidebar, click **Build > Firestore Database**.
2. Click **"Create database"**.
3. Choose a location (e.g., `us-central1` or one close to you).
4. Start in **Test mode** (Security rules will be updated later, but Test mode is easiest for initial dev).
5. Click **Create**.

## 4. Get Backend Credentials (Service Account)
*This is required for the Node.js backend to verify tokens.*

1. Click the **Gear icon** (Project settings) next to "Project Overview".
2. Go to the **Service accounts** tab.
3. Click **"Generate new private key"**.
4. Save the file.
5. **Rename** the file to `serviceAccountKey.json`.
6. **Move** this file to `/recall-bin/backend/config/serviceAccountKey.json` (Create the `config` folder if it doesn't exist).

## 5. Get Frontend Credentials (Firebase Config)
*This is required for the React app to connect to Firebase.*

1. In Project settings, scroll down to **"Your apps"**.
2. Click the **Web** icon (`</>`).
3. Register the app (e.g., `RecallBin Web`).
4. Copy the `firebaseConfig` object (keys like `apiKey`, `authDomain`, etc.).
5. You will use these in the frontend `.env` file later.

## 6. Update Firestore Rules
In the Firestore tab > Rules, paste this basic rule set to allow authenticated users to read/write their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
Click **Publish**.
