/**
 * Normalizes job data from different sources into a common schema
 * @param {Object} rawJob - Raw job data from source
 * @param {string} source - Source name (e.g., 'wellfound', 'hirist')
 * @returns {Object} Normalized job object
 */
function normalizeJob(rawJob, source) {
  return {
    title: rawJob.title || '',
    company: rawJob.company || '',
    location: rawJob.location || '',
    experience: rawJob.experience || '',
    source: source,
    url: rawJob.url || '',
    postedDate: rawJob.postedDate || '',
    description: rawJob.description || '',
    salary: rawJob.salary || '',
    // Keep original data for reference
    raw: rawJob
  };
}

module.exports = {
  normalizeJob
};

