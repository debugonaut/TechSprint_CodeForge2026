# Environment Variables for Vercel

After pushing this code, add these environment variables in Vercel Dashboard:

## Go to: https://vercel.com/your-username/tech-sprint-code-forge2026/settings/environment-variables

Add the following:

### 1. GEMINI_API_KEY
- **Value**: Your Gemini API key
- **Scope**: Production, Preview, Development

### 2. FIREBASE_PROJECT_ID
- **Value**: Your Firebase project ID (from Firebase Console)
- **Scope**: Production, Preview, Development

### 3. FIREBASE_PRIVATE_KEY
- **Value**: Your Firebase private key (from service account JSON)
- **Important**: Copy the ENTIRE private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- **Scope**: Production, Preview, Development

### 4. FIREBASE_CLIENT_EMAIL  
- **Value**: Your Firebase client email (from service account JSON)
- **Scope**: Production, Preview, Development

### 5. NODE_ENV
- **Value**: production
- **Scope**: Production

## How to Find Firebase Credentials:

Open: `backend/config/serviceAccountKey.json`

Copy these values:
- `project_id` → FIREBASE_PROJECT_ID
- `private_key` → FIREBASE_PRIVATE_KEY (ENTIRE value with newlines)
- `client_email` → FIREBASE_CLIENT_EMAIL

## After Adding Variables:

1. Go to Vercel Dashboard → Deployments
2. Click "..." menu on latest deployment
3. Click "Redeploy"
4. Wait ~2 minutes for deployment

Your backend will then be live at:
`https://tech-sprint-code-forge2026.vercel.app/api`
