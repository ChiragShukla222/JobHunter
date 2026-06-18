/**
 * API Integration Guide
 * 
 * This file shows how to integrate the LinkedIn extension with your JobHunt backend
 * 
 * There are two approaches:
 * 1. Direct API calls from the content script
 * 2. Relay through the background service worker
 * 
 * We recommend approach #2 for better security and reliability
 */

// ============================================
// APPROACH 1: Direct API Call from Content Script
// ============================================

/**
 * Modified sendJobDataToBackground in linkedin-extractor.js
 * 
 * Instead of just sending to background, also call your API:
 */

/*
function sendJobDataToBackend(jobData) {
  // First, send to background (for popup/storage)
  chrome.runtime.sendMessage(
    {
      action: 'LINKEDIN_JOB_EXTRACTED',
      data: jobData
    }
  );

  // Also send directly to your backend
  fetch('http://localhost:3000/api/linkedin/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData)
  })
  .then(response => response.json())
  .then(result => {
    console.log('[JobHunt] Backend response:', result);
  })
  .catch(error => {
    console.error('[JobHunt] Error sending to backend:', error);
  });
}
*/

// ============================================
// APPROACH 2: Relay Through Background Service Worker (RECOMMENDED)
// ============================================

/**
 * Step 1: Update linkedin-extractor.js
 * 
 * Keep the existing sendJobDataToBackground() as-is:
 */

/*
function sendJobDataToBackground(jobData) {
  if (!jobData) {
    console.warn('[JobHunt] No job data to send');
    return;
  }

  chrome.runtime.sendMessage(
    {
      action: 'LINKEDIN_JOB_EXTRACTED',
      data: jobData
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('[JobHunt] Error sending message:', chrome.runtime.lastError);
      } else {
        console.log('[JobHunt] Message sent successfully:', response);
      }
    }
  );
}
*/

/**
 * Step 2: Update background.js to relay to your API
 * 
 * Modify the 'LINKEDIN_JOB_EXTRACTED' handler:
 */

/*
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[JobHunt Service Worker] Message received:', request.action);

  if (request.action === 'LINKEDIN_JOB_EXTRACTED') {
    currentJobData = request.data;
    
    console.log('[JobHunt Service Worker] Job data stored:', currentJobData);

    // Save to chrome.storage
    chrome.storage.local.set(
      {
        lastExtractedJob: currentJobData,
        lastExtractionTime: new Date().toISOString()
      },
      () => {
        console.log('[JobHunt Service Worker] Job data saved to storage');
      }
    );

    // NEW: Send to your JobHunt backend
    sendToBackendAPI(currentJobData)
      .then(result => {
        console.log('[JobHunt] Backend confirmed:', result);
        sendResponse({
          status: 'success',
          message: 'Job data processed by backend',
          data: currentJobData
        });
      })
      .catch(error => {
        console.error('[JobHunt] Backend error:', error);
        sendResponse({
          status: 'warning',
          message: 'Stored locally but backend error: ' + error.message,
          data: currentJobData
        });
      });

    return true; // Will respond asynchronously
  }
});

/**
 * Helper function to send data to backend
 */
async function sendToBackendAPI(jobData) {
  const response = await fetch('http://localhost:3000/api/linkedin/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData)
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  return await response.json();
}
*/

// ============================================
// BACKEND ENDPOINTS (server.js)
// ============================================

/**
 * Add these endpoints to your JobHunt backend:
 */

/*
// POST /api/linkedin/extract
// Receives extracted LinkedIn job data
app.post('/api/linkedin/extract', (req, res) => {
  try {
    const jobData = req.body;
    
    console.log('[API] Received LinkedIn job data:', {
      title: jobData.jobTitle,
      company: jobData.company,
      source: jobData.source
    });

    // Normalize the job data using your normalizer
    const normalizedJob = normalizeLinkedInJob(jobData);

    // Store in your database
    // await saveJobToDatabase(normalizedJob);

    // Return success response
    res.json({
      status: 'success',
      message: 'Job data received and processed',
      jobData: normalizedJob
    });
  } catch (error) {
    console.error('[API] Error processing LinkedIn job:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process job data',
      error: error.message
    });
  }
});

// Helper function to normalize LinkedIn data to your format
function normalizeLinkedInJob(linkedInData) {
  return {
    source: 'LinkedIn',
    title: linkedInData.jobTitle,
    company: linkedInData.company,
    description: linkedInData.description,
    extractedAt: linkedInData.extractedAt,
    url: linkedInData.url,
    // Add more fields as needed
    salary: null,
    location: null,
    jobType: null
  };
}

// GET /api/linkedin/status
// Check extension status
app.get('/api/linkedin/status', (req, res) => {
  res.json({
    extensionActive: true,
    version: '1.0.0'
  });
});
*/

// ============================================
// CONFIGURATION
// ============================================

/**
 * Environment-based API URL
 */

const API_CONFIG = {
  development: 'http://localhost:3000',
  production: 'https://jobhunt.example.com'
};

const API_ENDPOINTS = {
  EXTRACT: '/api/linkedin/extract',
  STATUS: '/api/linkedin/status',
  ANALYZE: '/api/jobs/analyze'
};

// ============================================
// ENHANCED FLOW WITH ERROR HANDLING
// ============================================

/**
 * Robust backend integration with retry logic
 */

/*
async function sendToBackendAPIWithRetry(jobData, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[JobHunt] Sending to backend (attempt ${attempt}/${maxRetries})`);
      
      const response = await fetch('http://localhost:3000/api/linkedin/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
        timeout: 10000 // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[JobHunt] Successfully sent to backend:', result);
      return result;

    } catch (error) {
      lastError = error;
      console.warn(`[JobHunt] Attempt ${attempt} failed:`, error.message);
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  console.error('[JobHunt] Failed after', maxRetries, 'attempts:', lastError);
  throw lastError;
}
*/

// ============================================
// TESTING THE INTEGRATION
// ============================================

/**
 * Manual test in DevTools console:
 */

/*
// 1. Get current job data
chrome.runtime.sendMessage({ action: 'GET_CURRENT_JOB' }, (response) => {
  console.log('Current job:', response.data);
  
  // 2. Send to backend
  fetch('http://localhost:3000/api/linkedin/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response.data)
  })
  .then(r => r.json())
  .then(result => console.log('Backend response:', result));
});
*/

// ============================================
// MONITORING & LOGGING
// ============================================

/**
 * Add logging to your backend to monitor extraction:
 */

/*
// In server.js
const extractionLog = [];

app.post('/api/linkedin/extract', (req, res) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    company: req.body.company,
    jobTitle: req.body.jobTitle,
    url: req.body.url
  };
  
  extractionLog.push(logEntry);
  
  // Keep only last 100 extractions
  if (extractionLog.length > 100) {
    extractionLog.shift();
  }
  
  res.json({ status: 'success' });
});

// Endpoint to view extraction history
app.get('/api/linkedin/history', (req, res) => {
  res.json(extractionLog);
});
*/

// ============================================
// CORS CONFIGURATION
// ============================================

/**
 * If your backend is on a different port/domain, configure CORS:
 */

/*
// In server.js
const cors = require('cors');

app.use(cors({
  origin: 'chrome-extension://*', // Allow all Chrome extensions
  credentials: true
}));

// Or be more specific:
app.use(cors({
  origin: ['http://localhost:3000', 'chrome-extension://extension-id'],
  credentials: true
}));
*/

// ============================================
// NEXT STEPS
// ============================================

/**
 * 1. Choose integration approach (1 or 2)
 * 2. Update your backend with the new endpoint
 * 3. Configure CORS if needed
 * 4. Test the flow end-to-end
 * 5. Add error handling and logging
 * 6. Monitor extraction success rates
 * 7. Plan for LinkedIn DOM changes (selectors may need updates)
 */

console.log('[JobHunt] API Integration Guide loaded');
