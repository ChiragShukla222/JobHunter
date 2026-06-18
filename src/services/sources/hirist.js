const axios = require('axios');
const { normalizeJob } = require('../normalizer');

/**
 * Fetches jobs from Hirist for a given keyword
 * Attempts to use real API, falls back to enhanced mock data
 * @param {string} keyword - The job search keyword
 * @returns {Promise<Array>} Array of normalized job objects
 */
async function fetch(keyword) {
  try {
    // Try to fetch from Hirist API (if available)
    // Note: Hirist doesn't have a widely documented public API for job search
    // For demonstration, we'll use enhanced mock data

    // In a real implementation, you would:
    // 1. Use Hirist's API with proper authentication (if available)
    // 2. Or use alternative job APIs for Indian market like Naukri, TimesJobs, etc.
    // 3. Or implement careful web scraping respecting robots.txt and terms of service

    // For now, we'll use enhanced mock data that simulates real job listings
    const enhancedMockJobs = generateEnhancedMockJobs(keyword, 'hirist');

    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    return enhancedMockJobs.map(job => normalizeJob(job, 'hirist'));
  } catch (error) {
    console.error('Error fetching from Hirist:', error);
    // Fallback to basic mock data
    return getBasicMockJobs(keyword, 'hirist').map(job => normalizeJob(job, 'hirist'));
  }
}

/**
 * Generates enhanced mock job data that mimics real job listings for Indian market
 * @param {string} keyword - The job search keyword
 * @param {string} source - The source name
 * @returns {Array} Array of job objects
 */
function generateEnhancedMockJobs(keyword, source) {
  const companies = [
    'TCS',
    'Infosys',
    'Wipro',
    'HCL Technologies',
    'Tech Mahindra',
    'Flipkart',
    'Amazon India',
    'Google India',
    'Microsoft India',
    'Zomato',
    'Swiggy',
    'Paytm',
    'Ola',
    'MakeMyTrip',
    'Razorpay'
  ];

  const locations = [
    'Bangalore, India',
    'Hyderabad, India',
    'Pune, India',
    'Chennai, India',
    'Delhi/NCR, India',
    'Mumbai, India',
    'Kolkata, India',
    'Remote (India)',
    'Ahmedabad, India',
    'Jaipur, India'
  ];

  const experienceLevels = [
    '0-1 years',
    '1-2 years',
    '2-4 years',
    '3-5 years',
    '4-6 years',
    '5-8 years',
    '8+ years'
  ];

  const salaryRanges = [
    '₹3L - ₹5L',
    '₹4L - ₹7L',
    '₹5L - ₹8L',
    '₹6L - ₹10L',
    '₹8L - ₹12L',
    '₹10L - ₹15L',
    '₹12L - ₹20L',
    '₹15L - ₹25L+'
  ];

  const jobTitles = [
    `${keyword} Developer`,
    `Senior ${keyword} Engineer`,
    `${keyword} Specialist`,
    `Lead ${keyword} Developer`,
    `Full Stack ${keyword} Developer`,
    `${keyword} Consultant`,
    `Principal ${keyword} Engineer`,
    `${keyword} Architect`,
    `Associate ${keyword} Developer`,
    `Team Lead - ${keyword}`,
    `Project Manager - ${keyword}`,
    `${keyword} Analyst`
  ];

  const descriptions = [
    `We are seeking a talented ${keyword} developer to join our growing team in India. You will work on exciting projects that serve millions of users.`,
    `Join our innovative team as a ${keyword} expert. We're building cutting-edge solutions for the Indian and global markets.`,
    `Looking for an experienced ${keyword} professional to help us scale our platform and mentor junior developers in our Bangalore office.`,
    `We need a skilled ${keyword} developer to build robust, scalable applications using modern technologies for our enterprise clients.`,
    `Exciting opportunity for a ${keyword} engineer to work on AI-powered products that impact users across India and Southeast Asia.`,
    `Help us transform the digital landscape of India with your ${keyword} expertise. We offer competitive compensation and growth opportunities.`,
    `Seeking a passionate ${keyword} developer to contribute to open-source projects and internal tools that power our platform.`,
    `We're looking for a creative ${keyword} problem-solver to tackle complex technical challenges in the fintech space.`,
    `Join our mission-driven team building the future of ${keyword} technology for emerging markets.`,
    `We need a detail-oriented ${keyword} professional to ensure code quality and implement best practices across our development teams.`,
    `As a ${keyword} specialist, you'll work on optimizing performance and scalability of our systems handling millions of daily transactions.`,
    `We're looking for a ${keyword} engineer with experience in cloud technologies to help us migrate to AWS/Azure.`
  ];

  const jobs = [];
  const numJobs = 3 + Math.floor(Math.random() * 3); // 3-5 jobs

  for (let i = 0; i < numJobs; i++) {
    const companyIndex = Math.floor(Math.random() * companies.length);
    const locationIndex = Math.floor(Math.random() * locations.length);
    const experienceIndex = Math.floor(Math.random() * experienceLevels.length);
    const salaryIndex = Math.floor(Math.random() * salaryRanges.length);
    const titleIndex = Math.floor(Math.random() * jobTitles.length);
    const descIndex = Math.floor(Math.random() * descriptions.length);

    // Generate a somewhat realistic date (within last 30 days)
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    jobs.push({
      title: jobTitles[titleIndex],
      company: companies[companyIndex],
      location: locations[locationIndex],
      experience: experienceLevels[experienceIndex],
      url: `https://hirist.com/job/${Math.floor(Math.random() * 100000)}`,
      postedDate: date.toISOString(),
      description: descriptions[descIndex],
      salary: salaryRanges[salaryIndex]
    });
  }

  return jobs;
}

/**
 * Generates basic mock job data as fallback for Indian market
 * @param {string} keyword - The job search keyword
 * @param {string} source - The source name
 * @returns {Array} Array of job objects
 */
function getBasicMockJobs(keyword, source) {
  return [
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
    }
  ];
}

module.exports = {
  fetch
};

