// Content script to inject auth token from web app to extension
(function() {
  // Listen for auth events from the RecallBin web app
  window.addEventListener('message', (event) => {
    // Verify origin for security
    const allowedOrigins = [
      'http://localhost:5173',
      'https://tech-sprint-code-forge2026.vercel.app'
    ];
    
    if (!allowedOrigins.includes(event.origin)) {
      return;
    }

    // Check if this is an auth token message
    if (event.data.type === 'RECALLBIN_AUTH_TOKEN') {
      // Send to background script to store
      chrome.runtime.sendMessage({
        action: 'saveAuthToken',
        token: event.data.token
      });

      // Also send to popup if it's open
      chrome.runtime.sendMessage({
        action: 'authTokenUpdated',
        token: event.data.token
      });

      console.log('RecallBin: Auth token received and stored');
    }
  });

  // Request auth token from page if it exists
  window.postMessage({ type: 'RECALLBIN_REQUEST_AUTH' }, '*');
})();
