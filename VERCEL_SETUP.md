# Vercel Environment Variables Setup

After deployment, you need to add these environment variables in Vercel Dashboard:

## Go to: https://vercel.com/your-project/settings/environment-variables

### Required Variables:

1. **GEMINI_API_KEY**
   - Value: (Your Gemini API key)
   - Scope: Production, Preview, Development

2. **FIREBASE_CONFIG** 
   - Value: (Your Firebase service account JSON - entire file as one line)
   - Scope: Production, Preview, Development

### How to Add:
1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable
4. Redeploy after adding variables

### Production URLs:
After deployment, update extension files with:
- API_URL: https://your-project.vercel.app/api
- DASHBOARD_URL: https://your-project.vercel.app

### Firebase Setup:
Don't forget to add your Vercel domain to Firebase:
- Firebase Console → Authentication → Settings → Authorized domains
- Add: your-project.vercel.app
