// Configuration
// NOTE: Backend is running locally. For production, deploy backend separately.
const API_URL = 'http://localhost:5001';
const DASHBOARD_URL = 'https://tech-sprint-code-forge2026.vercel.app';

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('RecallBin extension installed');
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'saveToRecallBin',
    title: 'Save to RecallBin',
    contexts: ['page', 'selection', 'link']
  });

  // Set up weekly reminder alarm (every 7 days)
  chrome.alarms.create('weeklyReminder', {
    periodInMinutes: 10080 // 7 days = 10080 minutes
  });

  // Also set a daily check alarm
  chrome.alarms.create('dailyCheck', {
    periodInMinutes: 1440 // 24 hours
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'saveToRecallBin') {
    const url = info.linkUrl || tab.url;
    const title = info.selectionText || tab.title;
    
    try {
      const token = await getAuthToken();
      
      if (!token) {
        // Open dashboard for login
        chrome.tabs.create({ url: DASHBOARD_URL });
        return;
      }

      const response = await fetch(`${API_URL}/api/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url,
          title,
          content_text: info.selectionText || '',
          platform: 'chrome-extension'
        })
      });

      if (response.ok) {
        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          title: 'RecallBin',
          message: 'Saved successfully! ✓'
        });
        
        // Update badge
        updateBadge();
      } else if (response.status === 409) {
        chrome.notifications.create({
          type: 'basic',
          title: 'RecallBin',
          message: 'URL already saved!'
        });
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Error saving from context menu:', error);
      chrome.notifications.create({
        type: 'basic',
        title: 'RecallBin Error',
        message: 'Failed to save. Please try again.'
      });
    }
  }
});

// Alarm handler for reminders
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'weeklyReminder' || alarm.name === 'dailyCheck') {
    await checkReminders();
  }
});

// Check for items needing review
async function checkReminders() {
  try {
    const token = await getAuthToken();
    if (!token) return;

    const response = await fetch(`${API_URL}/api/reminders/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return;

    const data = await response.json();
    
    if (data.unreadCount > 0) {
      chrome.notifications.create({
        type: 'basic',
        title: '🔔 Time to Review!',
        message: `You have ${data.unreadCount} items saved a week ago. Click to review!`,
        requireInteraction: true
      });

      // Update badge with count
      chrome.action.setBadgeText({ text: String(data.unreadCount) });
      chrome.action.setBadgeBackgroundColor({ color: '#8b5cf6' });
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

// Notification click handler
chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: DASHBOARD_URL });
});

// Update badge with quota or count
async function updateBadge() {
  try {
    const token = await getAuthToken();
    if (!token) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    const response = await fetch(`${API_URL}/api/quota`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const quota = await response.json();
      
      if (quota.remaining < 5) {
        chrome.action.setBadgeText({ text: String(quota.remaining) });
        chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Get auth token from storage
function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'itemSaved') {
    updateBadge();
  } else if (message.action === 'saveAuthToken') {
    // Save auth token from content script
    chrome.storage.local.set({ authToken: message.token }, () => {
      console.log('Auth token saved from web app');
      updateBadge();
    });
  }
});

// Periodic check for reminders (every hour when browser is active)
setInterval(() => {
  checkReminders();
}, 3600000); // 1 hour

// Initial badge update
updateBadge();
