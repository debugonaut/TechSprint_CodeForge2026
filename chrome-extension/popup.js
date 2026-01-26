// Configuration
const API_URL = 'http://localhost:5001'; // Change to your deployed URL later
const DASHBOARD_URL = 'http://localhost:5173'; // Change to your deployed URL later

// DOM Elements
let saveBtn, collectionSelect, pageTitle, recentItems;
let loginStatus, loginPrompt, mainContent, errorMsg, successMsg, quotaDisplay, quotaText;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  saveBtn = document.getElementById('saveBtn');
  collectionSelect = document.getElementById('collectionSelect');
  pageTitle = document.getElementById('pageTitle');
  recentItems = document.getElementById('recentItems');
  loginStatus = document.getElementById('loginStatus');
  loginPrompt = document.getElementById('loginPrompt');
  mainContent = document.getElementById('mainContent');
  errorMsg = document.getElementById('errorMsg');
  successMsg = document.getElementById('successMsg');
  quotaDisplay = document.getElementById('quotaDisplay');
  quotaText = document.getElementById('quotaText');

  // Setup event listeners
  saveBtn.addEventListener('click', handleSave);
  document.getElementById('dashboardLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: DASHBOARD_URL });
  });
  document.getElementById('openDashboard')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: DASHBOARD_URL });
  });

  // Check authentication
  const authToken = await getAuthToken();
  
  if (!authToken) {
    showLoginPrompt();
    return;
  }

  // Show main content
  loginPrompt.style.display = 'none';
  mainContent.style.display = 'block';
  loginStatus.textContent = 'Logged In';
  loginStatus.style.background = 'rgba(34, 197, 94, 0.2)';
  loginStatus.style.color = '#86efac';

  // Load data
  await loadCurrentPage();
  await loadCollections();
  await loadRecentItems();
  await loadQuota();
});

// Get authentication token from storage
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

// Save authentication token
async function saveAuthToken(token) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ authToken: token }, resolve);
  });
}

// Show login prompt
function showLoginPrompt() {
  loginPrompt.style.display = 'block';
  mainContent.style.display = 'none';
  loginStatus.textContent = 'Not Logged In';
  loginStatus.style.background = 'rgba(239, 68, 68, 0.2)';
  loginStatus.style.color = '#fca5a5';
}

// Load current page info
async function loadCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    pageTitle.textContent = tab.title || 'Untitled Page';
    
    // Store current tab info for saving
    window.currentTab = {
      url: tab.url,
      title: tab.title
    };
  } catch (error) {
    console.error('Error loading current page:', error);
    pageTitle.textContent = 'Error loading page';
  }
}

// Load collections
async function loadCollections() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/api/collections`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load collections');

    const collections = await response.json();
    
    // Populate dropdown
    collectionSelect.innerHTML = '<option value="">No Collection</option>';
    collections.forEach(col => {
      const option = document.createElement('option');
      option.value = col.id;
      option.textContent = col.name;
      collectionSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading collections:', error);
  }
}

// Load recent items
async function loadRecentItems() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/api/search?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load recent items');

    const data = await response.json();
    const items = data.items || data;
    
    if (items.length === 0) {
      recentItems.innerHTML = '<p style="text-align: center; color: #71717a; font-size: 12px; padding: 20px;">No saved items yet</p>';
      return;
    }

    recentItems.innerHTML = items.slice(0, 5).map(item => `
      <div class="recent-item" data-url="${item.url}">
        <div class="recent-title">${item.ai_output?.title || item.raw_input?.title || 'Untitled'}</div>
        <div class="recent-meta">${new Date(item.created_at).toLocaleDateString()}</div>
      </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.recent-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-url');
        if (url) chrome.tabs.create({ url });
      });
    });
  } catch (error) {
    console.error('Error loading recent items:', error);
    recentItems.innerHTML = '<p style="text-align: center; color: #ef4444; font-size: 12px; padding: 20px;">Error loading items</p>';
  }
}

// Load quota
async function loadQuota() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/api/quota`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load quota');

    const quota = await response.json();
    quotaText.textContent = `${quota.remaining}/${quota.limit}`;
    
    if (quota.remaining < 5) {
      quotaText.classList.add('quota-warning');
    }
  } catch (error) {
    console.error('Error loading quota:', error);
  }
}

// Handle save
async function handleSave() {
  if (!window.currentTab) {
    showError('No page to save');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = '💾 Saving...';
  hideMessages();

  try {
    const token = await getAuthToken();
    const collectionId = collectionSelect.value || null;

    const response = await fetch(`${API_URL}/api/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url: window.currentTab.url,
        title: window.currentTab.title,
        content_text: '',
        platform: 'chrome-extension',
        collectionId
      })
    });

    if (response.status === 409) {
      showError('This URL is already saved!');
      return;
    }

    if (response.status === 429) {
      showError('Daily quota exceeded! Try again tomorrow.');
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to save');
    }

    showSuccess('Saved successfully! ✓');
    
    // Reload data
    await loadRecentItems();
    await loadQuota();

    // Notify background script to update badge
    chrome.runtime.sendMessage({ action: 'itemSaved' });

  } catch (error) {
    console.error('Error saving:', error);
    showError('Failed to save. Please try again.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Save to RecallBin';
  }
}

// Show error message
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
  setTimeout(() => {
    errorMsg.style.display = 'none';
  }, 5000);
}

// Show success message
function showSuccess(message) {
  successMsg.textContent = message;
  successMsg.style.display = 'block';
  setTimeout(() => {
    successMsg.style.display = 'none';
  }, 3000);
}

// Hide messages
function hideMessages() {
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';
}

// Listen for auth token updates from dashboard
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'authTokenUpdated') {
    saveAuthToken(message.token).then(() => {
      location.reload(); // Reload popup
    });
  }
});

// Also listen for storage changes (when token is saved from web app)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.authToken) {
    // Auth token was updated, reload the popup
    console.log('Auth token detected, reloading popup...');
    setTimeout(() => location.reload(), 500);
  }
});
