/**
 * LinkedIn Job Extractor Content Script
 * 
 * This script runs on LinkedIn job pages and automatically extracts:
 * - Job Title
 * - Company Name
 * - Job Description
 * 
 * It handles LinkedIn's dynamic content loading using MutationObserver
 * and sends extracted data to the background service worker
 */

// Configuration for LinkedIn DOM selectors
const LINKEDIN_SELECTORS = {
  jobTitle: [
    '[data-job-title]',
    '.jobs-details-top-card__job-title',
    'h2[class*="title"]',
    '[class*="job-title"]'
  ],
  company: [
    '[data-company-name]',
    '.jobs-details-top-card__company-name',
    'a[class*="company-name"]',
    '[class*="company"]'
  ],
  description: [
    '.jobs-details__main-content',
    '[class*="job-description"]',
    '.show-more-less-html__markup',
    '[id*="description"]'
  ],
  descriptionContainer: [
    '.show-more-less-html__markup',
    '.jobs-details__main-content',
    'article[class*="description"]'
  ]
};

/**
 * Extracts job details from the LinkedIn DOM
 * @returns {Object|null} - Extracted job data or null if incomplete
 */
function extractJobDetails() {
  try {
    const jobData = {
      source: 'LinkedIn',
      jobTitle: null,
      company: null,
      description: null,
      extractedAt: new Date().toISOString(),
      url: window.location.href
    };

    // Extract Job Title
    jobData.jobTitle = extractTextBySelectors(LINKEDIN_SELECTORS.jobTitle, '.jobs-details-top-card__job-title');
    
    // Extract Company Name
    jobData.company = extractTextBySelectors(LINKEDIN_SELECTORS.company, '.jobs-details-top-card__company-name');
    
    // Extract Job Description - handle complex nested structure
    jobData.description = extractJobDescription();

    // Validate that we have at least the essential fields
    if (!jobData.jobTitle || !jobData.company) {
      console.warn('[JobHunt] Incomplete job data extraction:', jobData);
      return null;
    }

    console.log('[JobHunt] Successfully extracted job details:', jobData);
    return jobData;
  } catch (error) {
    console.error('[JobHunt] Error extracting job details:', error);
    return null;
  }
}

/**
 * Attempts to extract text using multiple selector fallbacks
 * @param {Array} selectors - Array of CSS selectors to try
 * @param {String} preferredSelector - Preferred selector to try first
 * @returns {String|null} - Extracted text or null
 */
function extractTextBySelectors(selectors, preferredSelector) {
  // Try the preferred selector first
  if (preferredSelector) {
    const element = document.querySelector(preferredSelector);
    if (element) {
      const text = element.innerText?.trim() || element.textContent?.trim();
      if (text) return text;
    }
  }

  // Fall back to other selectors
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.innerText?.trim() || element.textContent?.trim();
        if (text && text.length > 0) {
          return text;
        }
      }
    } catch (e) {
      // Selector might be invalid, continue to next
      continue;
    }
  }

  return null;
}

/**
 * Extracts the full job description text
 * Handles LinkedIn's complex nested structure and "Show more" functionality
 * @returns {String|null} - Full job description or null
 */
function extractJobDescription() {
  try {
    let description = null;

    // Strategy 1: Try to find the main description container
    const mainContentElement = document.querySelector('.jobs-details__main-content');
    if (mainContentElement) {
      // Try to get the expanded description (after "Show more" is clicked)
      const showMoreMarkup = mainContentElement.querySelector('.show-more-less-html__markup');
      if (showMoreMarkup) {
        description = showMoreMarkup.innerText?.trim() || showMoreMarkup.textContent?.trim();
      } else {
        // Fallback to entire main content
        description = mainContentElement.innerText?.trim() || mainContentElement.textContent?.trim();
      }
    }

    // Strategy 2: Search for show-more-less markup (common in LinkedIn)
    if (!description) {
      const showMoreElements = document.querySelectorAll('.show-more-less-html__markup');
      for (const element of showMoreElements) {
        const text = element.innerText?.trim() || element.textContent?.trim();
        if (text && text.length > 50) { // Ensure it's substantial text
          description = text;
          break;
        }
      }
    }

    // Strategy 3: Look for article or description sections
    if (!description) {
      const article = document.querySelector('article[class*="description"]');
      if (article) {
        description = article.innerText?.trim() || article.textContent?.trim();
      }
    }

    // Clean up the description: remove excessive whitespace
    if (description) {
      description = description.replace(/\s+/g, ' ').trim();
    }

    return description || null;
  } catch (error) {
    console.error('[JobHunt] Error extracting job description:', error);
    return null;
  }
}

/**
 * Sends extracted job data to the background service worker
 * @param {Object} jobData - The job data to send
 */
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

/**
 * Watches for DOM changes when job details load/change
 * Uses MutationObserver to detect when LinkedIn renders job details
 */
function initializeMutationObserver() {
  // Target the main job details container
  const targetNode = document.querySelector('.jobs-details') || document.body;

  const observerConfig = {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'data-job-title']
  };

  let extractionTimeout;

  const observer = new MutationObserver((mutations) => {
    // Debounce extraction to avoid multiple calls during rapid DOM updates
    clearTimeout(extractionTimeout);
    
    extractionTimeout = setTimeout(() => {
      const jobData = extractJobDetails();
      
      if (jobData && jobData.description) {
        // Only send if we successfully extracted data
        sendJobDataToBackground(jobData);
        console.log('[JobHunt] Extraction triggered by DOM change');
      }
    }, 500); // Wait 500ms for DOM to settle
  });

  try {
    observer.observe(targetNode, observerConfig);
    console.log('[JobHunt] MutationObserver initialized');
  } catch (error) {
    console.error('[JobHunt] Error initializing MutationObserver:', error);
  }

  return observer;
}

/**
 * Initial extraction when the script loads
 * LinkedIn may have already rendered the job details
 */
function performInitialExtraction() {
  console.log('[JobHunt] Performing initial extraction on page load');
  
  // Wait a bit for LinkedIn to fully render the job details
  setTimeout(() => {
    const jobData = extractJobDetails();
    if (jobData) {
      sendJobDataToBackground(jobData);
    }
  }, 1000);
}

/**
 * Listener for URL changes (when user navigates between jobs)
 * LinkedIn uses History API, so we use the popstate event
 */
function watchForNavigationChanges() {
  // Listen for history changes
  window.addEventListener('popstate', () => {
    console.log('[JobHunt] Navigation detected, re-extracting job details');
    performInitialExtraction();
  });

  // LinkedIn also updates the URL programmatically, so watch for that
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      console.log('[JobHunt] URL changed, re-extracting job details');
      performInitialExtraction();
    }
  }, 500);
}

/**
 * Main initialization function
 */
function init() {
  console.log('[JobHunt] LinkedIn Extractor Content Script Loaded');
  console.log('[JobHunt] Current URL:', window.location.href);

  // Only initialize if we're on a LinkedIn job page
  if (!window.location.href.includes('linkedin.com/jobs')) {
    console.warn('[JobHunt] Not on a LinkedIn job page, script inactive');
    return;
  }

  // Perform initial extraction when page loads
  performInitialExtraction();

  // Initialize MutationObserver to watch for dynamic content
  initializeMutationObserver();

  // Watch for navigation changes (when switching between jobs)
  watchForNavigationChanges();

  console.log('[JobHunt] LinkedIn Extractor fully initialized');
}

// Start the script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already loaded
  init();
}
