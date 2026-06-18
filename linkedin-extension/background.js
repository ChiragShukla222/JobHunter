/**
 * Background Service Worker for JobHunt LinkedIn Extension
 * 
 * This service worker:
 * - Receives extracted job data from the content script
 * - Stores the data for popup access
 * - Manages communication between content script and popup
 * - Handles any background tasks (API calls, storage, etc.)
 */

// Store the most recently extracted job data
let currentJobData = null;

/**
 * Listen for messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[JobHunt Service Worker] Message received:', request.action);

  if (request.action === 'LINKEDIN_JOB_EXTRACTED') {
    // Store the extracted job data
    currentJobData = request.data;
    
    console.log('[JobHunt Service Worker] Job data stored:', currentJobData);

    // Save to chrome.storage for persistence across extension sessions
    chrome.storage.local.set(
      {
        lastExtractedJob: currentJobData,
        lastExtractionTime: new Date().toISOString()
      },
      () => {
        console.log('[JobHunt Service Worker] Job data saved to storage');
      }
    );

    // Send confirmation back to content script
    sendResponse({
      status: 'success',
      message: 'Job data received and stored',
      data: currentJobData
    });
  }

  // Handle requests from popup for current job data
  else if (request.action === 'GET_CURRENT_JOB') {
    if (currentJobData) {
      sendResponse({
        status: 'success',
        data: currentJobData
      });
    } else {
      // Try to retrieve from storage if not in memory
      chrome.storage.local.get('lastExtractedJob', (result) => {
        sendResponse({
          status: 'success',
          data: result.lastExtractedJob || null
        });
      });
      return true; // Will respond asynchronously
    }
  }

  // Handle clearing stored data
  else if (request.action === 'CLEAR_STORED_DATA') {
    currentJobData = null;
    chrome.storage.local.remove('lastExtractedJob', () => {
      console.log('[JobHunt Service Worker] Data cleared');
      sendResponse({ status: 'success', message: 'Data cleared' });
    });
  }

  // Keep alive: respond to keep-alive pings (service workers can be suspended)
  else if (request.action === 'PING') {
    sendResponse({ status: 'pong' });
  }
});

/**
 * Handle extension installation/update
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[JobHunt] Extension installed');
    // Optionally open a welcome page
    // chrome.tabs.create({ url: 'welcome.html' });
  } else if (details.reason === 'update') {
    console.log('[JobHunt] Extension updated');
  }
});

console.log('[JobHunt] Background Service Worker loaded');
