# RecallBin Chrome Extension

A powerful Chrome extension for RecallBin that lets you save web content with one click and get weekly reminders to review saved items.

## Features

✅ **One-Click Save** - Save the current page directly from the browser toolbar
✅ **Quick Popup** - See your recent saves and collections
✅ **Context Menu** - Right-click to save any page or link
✅ **Smart Reminders** - Get notifications for items saved 7 days ago
✅ **Quota Display** - See your remaining daily saves
✅ **Collection Support** - Save directly to collections

## Installation

### For Development/Testing

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load Extension**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
   - The RecallBin icon should appear in your toolbar

3. **First Time Setup**
   - Click the extension icon
   - Click "sign in to RecallBin"
   - Log in to the web app at `http://localhost:5173`
   - The extension will auto-detect your login

### For Production

1. Update URLs in `popup.js` and `background.js`:
   ```javascript
   const API_URL = 'https://your-api.vercel.app';
   const DASHBOARD_URL = 'https://your-app.vercel.app';
   ```

2. Update `manifest.json` host permissions:
   ```json
   "host_permissions": [
     "https://your-api.vercel.app/*"
   ]
   ```

3. Add icons (see `icons/README.md`)

4. **Package for Chrome Web Store** (optional):
   ```bash
   zip -r recallbin-extension.zip . -x "*.git*" "icons/README.md" "README.md"
   ```

## Usage

### Save Current Page
1. Click the extension icon
2. (Optional) Select a collection
3. Click "Save to RecallBin"

### Save via Context Menu
1. Right-click on any page
2. Select "Save to RecallBin"

### View Recent Saves
- Click the extension icon to see your 5 most recent saves
- Click any item to open it

### Review Reminders
- Notification appears when you have items saved 7 days ago
- Badge shows count on extension icon
- Click notification to open dashboard

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Popup UI
- `popup.js` - Popup logic
- `background.js` - Background service worker (context menu, notifications, reminders)
- `content.js` - Content script for auth sync
- `icons/` - Extension icons

## Authentication

The extension uses the same Firebase auth as the web app. When you log in to the web dashboard, the extension automatically receives your auth token via a content script.

**Security Note**: The auth token is stored securely in `chrome.storage.local` and never exposed to web pages.

## Permissions Explained

- `activeTab` - Access current tab info for saving
- `storage` - Store auth token and preferences
- `alarms` - Schedule reminder checks
- `notifications` - Show reminder notifications
- `contextMenus` - Add right-click menu item
- `host_permissions` - Communicate with RecallBin API

## Development

### Testing Locally

1. Start the backend: `cd backend && node server.js`
2. Start the frontend: `cd frontend && npm run dev`
3. Load extension in Chrome
4. Test all features

### Debugging

- Right-click extension icon → "Inspect popup" for popup console
- Visit `chrome://extensions/` → Click "background page" link for service worker console

## Troubleshooting

**Extension says "Not Logged In"**
- Make sure you're logged in to the web app first
- Refresh the extension popup

**Save button doesn't work**
- Check backend is running on port 5001
- Check CORS is enabled in backend
- Check browser console for errors

**No reminders appearing**
- Extension must be loaded for at least 24 hours
- Check if you have items saved 7+ days ago
- Check Chrome notifications are enabled

## Future Enhancements

- [ ] Offline support with sync when online
- [ ] Keyboard shortcuts (e.g., Ctrl+Shift+S to save)
- [ ] Save selected text only
- [ ] Tag suggestions based on page content
- [ ] Firefox & Edge versions

## License

Part of the RecallBin project for TechSprint CodeForge 2026.
