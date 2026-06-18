/**
 * LinkedIn Job Extractor Content Script (TypeScript Version)
 * 
 * This is a TypeScript alternative to linkedin-extractor.js
 * Use this if you prefer TypeScript and have a build process (webpack, esbuild, etc.)
 * 
 * To use this file:
 * 1. Build it: tsc linkedin-extractor.ts --target es6 --module es6 --outDir ./
 * 2. Update manifest.json to reference the compiled JS file
 */

import { LinkedInJobData, LinkedInSelectors } from './types';

// Configuration for LinkedIn DOM selectors
const LINKEDIN_SELECTORS: LinkedInSelectors = {
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
 */
function extractJobDetails(): LinkedInJobData | null {
  try {
    const jobData: LinkedInJobData = {
      source: 'LinkedIn',
      jobTitle: null,
      company: null,
      description: null,
      extractedAt: new Date().toISOString(),
      url: window.location.href
    };

    // Extract Job Title
    jobData.jobTitle = extractTextBySelectors(
      LINKEDIN_SELECTORS.jobTitle,
      '.jobs-details-top-card__job-title'
    );

    // Extract Company Name
    jobData.company = extractTextBySelectors(
      LINKEDIN_SELECTORS.company,
      '.jobs-details-top-card__company-name'
    );

    // Extract Job Description
    jobData.description = extractJobDescription();

    // Validate that we have essential fields
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
 */
function extractTextBySelectors(selectors: string[], preferredSelector: string): string | null {
  // Try the preferred selector first
  if (preferredSelector) {
    const element = document.querySelector(preferredSelector) as HTMLElement | null;
    if (element) {
      const text = element.innerText?.trim() || element.textContent?.trim();
      if (text) return text;
    }
  }

  // Fall back to other selectors
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (element) {
        const text = element.innerText?.trim() || element.textContent?.trim();
        if (text && text.length > 0) {
          return text;
        }
      }
    } catch (e) {
      continue;
    }
  }

  return null;
}

/**
 * Extracts the full job description text
 */
function extractJobDescription(): string | null {
  try {
    let description: string | null = null;

    // Strategy 1: Main content element
    const mainContent = document.querySelector(
      '.jobs-details__main-content'
    ) as HTMLElement | null;
    
    if (mainContent) {
      const showMore = mainContent.querySelector(
        '.show-more-less-html__markup'
      ) as HTMLElement | null;
      
      if (showMore) {
        description = showMore.innerText?.trim() || showMore.textContent?.trim() || null;
      } else {
        description = mainContent.innerText?.trim() || mainContent.textContent?.trim() || null;
      }
    }

    // Strategy 2: Show more markup
    if (!description) {
      const showMoreElements = document.querySelectorAll(
        '.show-more-less-html__markup'
      ) as NodeListOf<HTMLElement>;
      
      for (const element of showMoreElements) {
        const text = element.innerText?.trim() || element.textContent?.trim();
        if (text && text.length > 50) {
          description = text;
          break;
        }
      }
    }

    // Strategy 3: Article section
    if (!description) {
      const article = document.querySelector(
        'article[class*="description"]'
      ) as HTMLElement | null;
      
      if (article) {
        description = article.innerText?.trim() || article.textContent?.trim() || null;
      }
    }

    // Clean up whitespace
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
 */
function sendJobDataToBackground(jobData: LinkedInJobData | null): void {
  if (!jobData) {
    console.warn('[JobHunt] No job data to send');
    return;
  }

  chrome.runtime.sendMessage(
    {
      action: 'LINKEDIN_JOB_EXTRACTED',
      data: jobData
    },
    (response: any) => {
      if (chrome.runtime.lastError) {
        console.error('[JobHunt] Error sending message:', chrome.runtime.lastError);
      } else {
        console.log('[JobHunt] Message sent successfully:', response);
      }
    }
  );
}

/**
 * Initializes mutation observer for dynamic content
 */
function initializeMutationObserver(): MutationObserver {
  const targetNode = document.querySelector('.jobs-details') || document.body;

  const observerConfig: MutationObserverInit = {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'data-job-title']
  };

  let extractionTimeout: NodeJS.Timeout;

  const observer = new MutationObserver(() => {
    clearTimeout(extractionTimeout);

    extractionTimeout = setTimeout(() => {
      const jobData = extractJobDetails();

      if (jobData && jobData.description) {
        sendJobDataToBackground(jobData);
        console.log('[JobHunt] Extraction triggered by DOM change');
      }
    }, 500);
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
 * Performs initial extraction when the script loads
 */
function performInitialExtraction(): void {
  console.log('[JobHunt] Performing initial extraction on page load');

  setTimeout(() => {
    const jobData = extractJobDetails();
    if (jobData) {
      sendJobDataToBackground(jobData);
    }
  }, 1000);
}

/**
 * Watches for URL changes
 */
function watchForNavigationChanges(): void {
  window.addEventListener('popstate', () => {
    console.log('[JobHunt] Navigation detected, re-extracting job details');
    performInitialExtraction();
  });

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
function init(): void {
  console.log('[JobHunt] LinkedIn Extractor Content Script Loaded');
  console.log('[JobHunt] Current URL:', window.location.href);

  if (!window.location.href.includes('linkedin.com/jobs')) {
    console.warn('[JobHunt] Not on a LinkedIn job page, script inactive');
    return;
  }

  performInitialExtraction();
  initializeMutationObserver();
  watchForNavigationChanges();

  console.log('[JobHunt] LinkedIn Extractor fully initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
