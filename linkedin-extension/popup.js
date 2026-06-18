/**
 * Popup Script
 * 
 * Communicates with the background service worker to retrieve
 * and display extracted job data
 */

const ELEMENTS = {
  loading: document.getElementById('loading'),
  jobData: document.getElementById('jobData'),
  noData: document.getElementById('noData'),
  error: document.getElementById('error'),
  jobTitle: document.getElementById('jobTitle'),
  company: document.getElementById('company'),
  description: document.getElementById('description'),
  extractedAt: document.getElementById('extractedAt'),
  errorMessage: document.getElementById('errorMessage'),
  sendToAnalysis: document.getElementById('sendToAnalysis'),
  clearData: document.getElementById('clearData')
};

/**
 * Hide all state containers
 */
function hideAllStates() {
  ELEMENTS.loading.classList.add('hidden');
  ELEMENTS.jobData.classList.add('hidden');
  ELEMENTS.noData.classList.add('hidden');
  ELEMENTS.error.classList.add('hidden');
}

/**
 * Show the loading state
 */
function showLoading() {
  hideAllStates();
  ELEMENTS.loading.classList.remove('hidden');
}

/**
 * Show the no data state
 */
function showNoData() {
  hideAllStates();
  ELEMENTS.noData.classList.remove('hidden');
}

/**
 * Show an error message
 */
function showError(message) {
  hideAllStates();
  ELEMENTS.errorMessage.textContent = message;
  ELEMENTS.error.classList.remove('hidden');
}

/**
 * Display the extracted job data
 */
function displayJobData(jobData) {
  if (!jobData) {
    showNoData();
    return;
  }

  // Populate the fields
  ELEMENTS.jobTitle.textContent = jobData.jobTitle || 'N/A';
  ELEMENTS.company.textContent = jobData.company || 'N/A';
  ELEMENTS.description.textContent = jobData.description || 'No description available';
  
  // Format the timestamp
  if (jobData.extractedAt) {
    const date = new Date(jobData.extractedAt);
    ELEMENTS.extractedAt.textContent = `Extracted: ${date.toLocaleString()}`;
  }

  hideAllStates();
  ELEMENTS.jobData.classList.remove('hidden');
}

/**
 * Request current job data from the background service worker
 */
function loadJobData() {
  showLoading();

  chrome.runtime.sendMessage(
    { action: 'GET_CURRENT_JOB' },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting job data:', chrome.runtime.lastError);
        showError('Failed to retrieve job data');
        return;
      }

      if (response && response.data) {
        displayJobData(response.data);
      } else {
        showNoData();
      }
    }
  );
}

/**
 * Clear stored data
 */
function clearStoredData() {
  chrome.runtime.sendMessage(
    { action: 'CLEAR_STORED_DATA' },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error clearing data:', chrome.runtime.lastError);
        return;
      }
      showNoData();
    }
  );
}

/**
 * Send job data for analysis (placeholder for future integration)
 */
function sendToAnalysis() {
  const currentText = ELEMENTS.description.textContent;
  
  if (!currentText) {
    showError('No job data to analyze');
    return;
  }

  // Send to your backend or main application
  chrome.runtime.sendMessage(
    {
      action: 'SEND_FOR_ANALYSIS',
      data: {
        jobTitle: ELEMENTS.jobTitle.textContent,
        company: ELEMENTS.company.textContent,
        description: currentText
      }
    },
    (response) => {
      if (response) {
        alert('Job sent for analysis!');
      }
    }
  );
}

/**
 * Initialize popup event listeners
 */
function init() {
  ELEMENTS.clearData.addEventListener('click', clearStoredData);
  ELEMENTS.sendToAnalysis.addEventListener('click', sendToAnalysis);

  // Load job data when popup opens
  loadJobData();

  // Refresh data every 3 seconds to catch new extractions
  setInterval(loadJobData, 3000);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
