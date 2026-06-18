const axios = require('axios');
const { normalizeJob } = require('../normalizer');

/**
 * Fetches jobs from LinkedIn for a given keyword
 * Note: LinkedIn API access is restricted; this uses enhanced mock data
 * In a real implementation, you would use LinkedIn's official API with proper authentication
 * @param {string} keyword - The job search keyword
 * @returns {Promise<Array>} Array of normalized job objects
 */
async function fetch(keyword) {
  try {
    // Try to fetch from LinkedIn API (if available with proper authentication)
    // Note: LinkedIn's Job Search API requires partnership and approval
    // For demonstration, we'll use enhanced mock data

    // In a real implementation, you would:
    // 1. Use LinkedIn's Job Search API with proper OAuth authentication
    // 2. Or use alternative methods respecting LinkedIn's terms of service
    // 3. Or use third-party services that aggregate LinkedIn jobs

    // For now, we'll use enhanced mock data that simulates real LinkedIn job listings
    const enhancedMockJobs = generateEnhancedMockJobs(keyword, 'linkedin');

    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    return enhancedMockJobs.map(job => normalizeJob(job, 'linkedin'));
  } catch (error) {
    console.error('Error fetching from LinkedIn:', error);
    // Fallback to basic mock data
    return getBasicMockJobs(keyword, 'linkedin').map(job => normalizeJob(job, 'linkedin'));
  }
}

/**
 * Generates enhanced mock job data that mimics real LinkedIn job listings
 * @param {string} keyword - The job search keyword
 * @param {string} source - The source name
 * @returns {Array} Array of job objects
 */
function generateEnhancedMockJobs(keyword, source) {
  const companies = [
    'Google',
    'Microsoft',
    'Apple',
    'Amazon',
    'Meta',
    'Netflix',
    'Adobe',
    'Salesforce',
    'Oracle',
    'Intel',
    'IBM',
    'Cisco',
    'Uber',
    'Airbnb',
    'Twitter',
    'LinkedIn',
    'Shopify',
    'Spotify',
    'PayPal',
    'Stripe'
  ];

  const locations = [
    'San Francisco, CA',
    'New York, NY',
    'Seattle, WA',
    'Austin, TX',
    'Boston, MA',
    'Remote',
    'Los Angeles, CA',
    'Chicago, IL',
    'Denver, CO',
    'Atlanta, GA',
    'Washington, DC',
    'Philadelphia, PA',
    'Phoenix, AZ',
    'Charlotte, NC',
    'Dallas, TX'
  ];

  const experienceLevels = [
    '0-1 years',
    '1-2 years',
    '2-4 years',
    '3-5 years',
    '4-6 years',
    '5-8 years',
    '8-12 years',
    '12+ years'
  ];

  const salaryRanges = [
    '$70k - $90k',
    '$80k - $110k',
    '$90k - $120k',
    '$100k - $140k',
    '$120k - $160k',
    '$140k - $180k',
    '$160k - $200k+',
    '$180k - $250k+',
    '$200k - $250k',
    '$250k+'
  ];

  const jobTitles = [
    `${keyword} Engineer`,
    `Senior ${keyword} Developer`,
    `Staff ${keyword} Engineer`,
    `Senior ${keyword} Engineer`,
    `Lead ${keyword} Developer`,
    `Principal ${keyword} Engineer`,
    `Distinguished ${keyword} Engineer`,
    `Engineering Manager - ${keyword}`,
    `Director of ${keyword} Engineering`,
    `VP of Engineering`,
    `Head of ${keyword}`,
    `Chief Technology Officer`,
    `Senior Technical Lead`,
    `Architect - ${keyword}`,
    `Solutions Engineer`
  ];

  const descriptions = [
    `Join one of the world's most innovative companies as a ${keyword} professional. Work on products that impact billions of users globally.`,
    `We're looking for a passionate ${keyword} developer to help us build the next generation of technology solutions.`,
    `As a ${keyword} engineer at our company, you'll tackle complex technical challenges and mentor junior team members.`,
    `Help us scale our infrastructure to serve millions of users while maintaining high availability and performance.`,
    `Work on cutting-edge AI/ML projects that leverage your ${keyword} expertise to solve real-world problems.`,
    `We need a skilled ${keyword} professional to develop and maintain our core platforms and services.`,
    `Join our team building developer tools and platforms used by engineers worldwide.`,
    `As a ${keyword} specialist, you'll work on optimizing systems for performance, reliability, and scalability.`,
    `We're looking for a creative ${keyword} problem-solver to architect solutions for our most challenging technical problems.`,
    `Help us drive innovation in the ${keyword} space with your expertise and leadership skills.`,
    `Join a collaborative team of engineers passionate about technology and its potential to improve lives.`,
    `Work on products that integrate hardware, software, and services to create seamless user experiences.`,
    `We need a ${keyword} expert to help us navigate technical challenges and make sound architectural decisions.`,
    `As a ${keyword} engineer, you'll have the opportunity to work on diverse projects across our product portfolio.`,
    `Help us build inclusive technology solutions that work for people of all abilities and backgrounds.`
  ];

  const jobs = [];
  const numJobs = 4 + Math.floor(Math.random() * 4); // 4-7 jobs

  for (let i = 0; i < numJobs; i++) {
    const companyIndex = Math.floor(Math.random() * companies.length);
    const locationIndex = Math.floor(Math.random() * locations.length);
    const experienceIndex = Math.floor(Math.random() * experienceLevels.length);
    const salaryIndex = Math.floor(Math.random() * salaryRanges.length);
    const titleIndex = Math.floor(Math.random() * jobTitles.length);
    const descIndex = Math.floor(Math.random() * descriptions.length);

    // Generate a somewhat realistic date (within last 15 days for LinkedIn)
    const daysAgo = Math.floor(Math.random() * 15);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    jobs.push({
      title: jobTitles[titleIndex],
      company: companies[companyIndex],
      location: locations[locationIndex],
      experience: experienceLevels[experienceIndex],
      url: `https://linkedin.com/jobs/view/${Math.floor(Math.random() * 1000000000)}`,
      postedDate: date.toISOString(),
      description: descriptions[descIndex],
      salary: salaryRanges[salaryIndex]
    });
  }

  return jobs;
}

/**
 * Generates basic mock job data as fallback
 * @param {string} keyword - The job search keyword
 * @param {string} source - The source name
 * @returns {Array} Array of job objects
 */
function getBasicMockJobs(keyword, source) {
  return [
    {
      title: `Senior ${keyword} Developer`,
      company: 'Tech Innovations Inc',
      location: 'San Francisco, CA',
      experience: '3-5 years',
      url: 'https://linkedin.com/jobs/view/123456789',
      postedDate: new Date().toISOString(),
      description: `Looking for an experienced ${keyword} developer to join our team.`,
      salary: '$120k - $150k'
    },
    {
      title: `${keyword} Engineer`,
      company: 'Innovation Labs',
      location: 'Remote',
      experience: '2-4 years',
      url: 'https://linkedin.com/jobs/view/987654321',
      postedDate: new Date(Date.now() - 86400000).toISOString(),
      description: `We are seeking a talented ${keyword} engineer.`,
      salary: '$100k - $130k'
    }
  ];
}

module.exports = {
  fetch
};

