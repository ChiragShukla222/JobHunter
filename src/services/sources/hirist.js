const axios = require('axios');
const { normalizeJob } = require('../normalizer');

/**
 * Fetches jobs from Hirist for a given keyword
 * Note: This is a mock implementation. Replace with actual API calls when available.
 * @param {string} keyword - The job search keyword
 * @returns {Promise<Array>} Array of normalized job objects
 */
async function fetch(keyword) {
  // Mock implementation - replace with actual Hirist API calls
  // For now, return sample data based on keyword
  
  const mockJobs = [
    {
      title: `${keyword} Developer`,
      company: 'Indian Tech Corp',
      location: 'Bangalore, India',
      experience: '2-5 years',
      url: 'https://hirist.com/job/1',
      postedDate: new Date().toISOString(),
      description: `We are hiring ${keyword} developers for our growing team.`,
      salary: '₹8L - ₹15L'
    },
    {
      title: `Lead ${keyword} Engineer`,
      company: 'StartupHub',
      location: 'Mumbai, India',
      experience: '5-8 years',
      url: 'https://hirist.com/job/2',
      postedDate: new Date(Date.now() - 86400000).toISOString(),
      description: `Lead role for ${keyword} engineering team.`,
      salary: '₹20L - ₹30L'
    },
    {
      title: `${keyword} Software Engineer`,
      company: 'TechMasters',
      location: 'Hyderabad, India',
      experience: '1-3 years',
      url: 'https://hirist.com/job/3',
      postedDate: new Date(Date.now() - 259200000).toISOString(),
      description: `Entry to mid-level ${keyword} software engineer position.`,
      salary: '₹5L - ₹10L'
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return mockJobs.map(job => normalizeJob(job, 'hirist'));
}

module.exports = {
  fetch
};

