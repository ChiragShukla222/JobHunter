const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'jobs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
}

/**
 * Load all jobs from storage
 */
function loadJobs() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading jobs:', error);
    return {};
  }
}

/**
 * Save all jobs to storage
 */
function saveAllJobs(jobsData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(jobsData, null, 2));
  } catch (error) {
    console.error('Error saving jobs:', error);
    throw error;
  }
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

