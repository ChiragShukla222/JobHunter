const axios = require('axios');
const { normalizeJob } = require('../normalizer');

/**
 * Fetches jobs from Wellfound (AngelList) for a given keyword
 * Note: This is a mock implementation. Replace with actual API calls when available.
 * @param {string} keyword - The job search keyword
 * @returns {Promise<Array>} Array of normalized job objects
 */
async function fetch(keyword) {
  // Mock implementation - replace with actual Wellfound API calls
  // For now, return sample data based on keyword
  
  const mockJobs = [
    {
      title: `Senior ${keyword} Developer`,
      company: 'Tech Startup Inc',
      location: 'San Francisco, CA',
      experience: '3-5 years',
      url: 'https://wellfound.com/job/1',
      postedDate: new Date().toISOString(),
      description: `Looking for an experienced ${keyword} developer to join our team.`,
      salary: '$120k - $150k'
    },
    {
      title: `${keyword} Engineer`,
      company: 'Innovation Labs',
      location: 'Remote',
      experience: '2-4 years',
      url: 'https://wellfound.com/job/2',
      postedDate: new Date(Date.now() - 86400000).toISOString(),
      description: `We are seeking a talented ${keyword} engineer.`,
      salary: '$100k - $130k'
    },
    {
      title: `Full Stack ${keyword} Developer`,
      company: 'Digital Solutions',
      location: 'New York, NY',
      experience: '4-6 years',
      url: 'https://wellfound.com/job/3',
      postedDate: new Date(Date.now() - 172800000).toISOString(),
      description: `Join our team as a Full Stack ${keyword} Developer.`,
      salary: '$140k - $170k'
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return mockJobs.map(job => normalizeJob(job, 'wellfound'));
}

module.exports = {
  fetch
};

