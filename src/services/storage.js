// In-memory storage for serverless compatibility (Vercel, etc.)
// Note: Data will be lost on serverless function restart
// For production, consider using Vercel KV, Postgres, or another database
let jobsData = {};

/**
 * Load all jobs from storage
 */
function loadJobs() {
  return jobsData;
}

/**
 * Save all jobs to storage
 */
function saveAllJobs(data) {
  jobsData = data;
}

/**
 * Save jobs for a specific keyword
 * @param {string} keywordId - The keyword identifier
 * @param {Array} jobs - Array of normalized job objects
 */
function saveJobs(keywordId, jobs) {
  const allJobs = loadJobs();
  
  if (!allJobs[keywordId]) {
    allJobs[keywordId] = [];
  }

  // Add new jobs (accept duplicates for now)
  allJobs[keywordId].push(...jobs);
  
  saveAllJobs(allJobs);
}

/**
 * Get jobs for a specific keyword
 * @param {string} keywordId - The keyword identifier
 * @returns {Array} Array of normalized job objects
 */
function getJobsByKeyword(keywordId) {
  const allJobs = loadJobs();
  return allJobs[keywordId] || [];
}

/**
 * Get all keywords
 * @returns {Array} Array of keyword IDs
 */
function getAllKeywords() {
  const allJobs = loadJobs();
  return Object.keys(allJobs);
}

module.exports = {
  saveJobs,
  getJobsByKeyword,
  getAllKeywords
};

