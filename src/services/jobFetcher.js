const wellfoundFetcher = require('./sources/wellfound');
const hiristFetcher = require('./sources/hirist');
const linkedinFetcher = require('./sources/linkedin');

/**
 * Fetches jobs from all sources for a given keyword
 * @param {string} keyword - The job search keyword
 * @returns {Promise<Array>} Array of normalized job objects
 */
async function fetchJobsByKeyword(keyword) {
  const allJobs = [];

  try {
    // Fetch from Wellfound
    const wellfoundJobs = await wellfoundFetcher.fetch(keyword);
    allJobs.push(...wellfoundJobs);
  } catch (error) {
    console.error('Error fetching from Wellfound:', error);
  }

  try {
    const hiristJobs = await hiristFetcher.fetch(keyword);
    allJobs.push(...hiristJobs);
  } catch (error) {
    console.error('Error fetching from Hirist:', error);
  }

  try {
    const linkedinJobs = await linkedinFetcher.fetch(keyword);
    allJobs.push(...linkedinJobs);
  } catch (error) {
    console.error('Error fetching from LinkedIn:', error);
  }

  return allJobs;
}

module.exports = {
  fetchJobsByKeyword
};

