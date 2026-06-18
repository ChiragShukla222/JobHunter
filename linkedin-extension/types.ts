/**
 * Type definitions for LinkedIn Extension
 */

/**
 * Extracted job data structure
 */
export interface LinkedInJobData {
  source: 'LinkedIn';
  jobTitle: string | null;
  company: string | null;
  description: string | null;
  extractedAt: string;
  url: string;
}

/**
 * Message structure from content script to background
 */
export interface ExtractedJobMessage {
  action: 'LINKEDIN_JOB_EXTRACTED';
  data: LinkedInJobData;
}

/**
 * Message structure for popup requests
 */
export interface PopupRequestMessage {
  action: 'GET_CURRENT_JOB' | 'CLEAR_STORED_DATA' | 'PING';
}

/**
 * Response structure from background service worker
 */
export interface BackgroundResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

/**
 * Storage structure for chrome.storage
 */
export interface StoredJobData {
  lastExtractedJob: LinkedInJobData | null;
  lastExtractionTime: string;
}

/**
 * LinkedIn DOM selector configuration
 */
export interface LinkedInSelectors {
  jobTitle: string[];
  company: string[];
  description: string[];
  descriptionContainer: string[];
}
