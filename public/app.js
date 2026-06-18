// State management
let allJobs = [];
let highMatchJobs = [];
let moderateMatchJobs = [];
let cvData = null;
let cvSkills = [];
let cvExperience = 0;

// DOM elements
const keywordInput = document.getElementById('keywordInput');
const searchBtn = document.getElementById('searchBtn');
const sourceFilter = document.getElementById('sourceFilter');
const locationFilter = document.getElementById('locationFilter');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const cvFileInput = document.getElementById('cvFile');
const uploadCvBtn = document.getElementById('uploadCvBtn');
const cvStatus = document.getElementById('cvStatus');
const cvAnalysis = document.getElementById('cvAnalysis');
const cvSkillsDiv = document.getElementById('cvSkills');
const cvExperienceDiv = document.getElementById('cvExperience');
const highMatchCount = document.getElementById('highMatchCount');
const moderateMatchCount = document.getElementById('moderateMatchCount');
const highMatchContainer = document.getElementById('highMatchContainer');
const moderateMatchContainer = document.getElementById('moderateMatchContainer');

// Event listeners
searchBtn.addEventListener('click', handleSearch);
keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

sourceFilter.addEventListener('change', applyFilters);
locationFilter.addEventListener('input', applyFilters);
clearFiltersBtn.addEventListener('click', clearFilters);
uploadCvBtn.addEventListener('click', handleCvUpload);
cvFileInput.addEventListener('change', handleCvFileChange);

// Search for jobs and analyze matches
async function handleSearch() {
    const keyword = keywordInput.value.trim();

    if (!keyword) {
        showError('Please enter a keyword to search');
        return;
    }

    hideError();
    showLoading();
    clearResults();

    try {
        const response = await fetch('/api/jobs/fetch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ keyword })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch jobs');
        }

        const data = await response.json();
        allJobs = data.jobs || [];

        // Analyze job matches if CV is available
        if (cvData) {
            analyzeJobMatches();
        } else {
            // If no CV, show all jobs in high match section (for backward compatibility)
            highMatchJobs = [...allJobs];
            moderateMatchJobs = [];
        }

        applyFilters();
    } catch (error) {
        showError(`Error: ${error.message}`);
        hideResults();
    } finally {
        hideLoading();
    }
}

// Handle CV file selection
function handleCvFileChange() {
    const file = cvFileInput.files[0];
    if (!file) {
        cvStatus.textContent = 'No CV uploaded';
        cvStatus.style.color = '#cccccc';
        cvAnalysis.classList.add('hidden');
        return;
    }

    cvStatus.textContent = `Selected: ${file.name}`;
    cvStatus.style.color = '#ff0000';
}

// Handle CV upload
async function handleCvUpload() {
    const file = cvFileInput.files[0];
    if (!file) {
        showError('Please select a CV file first');
        return;
    }

    showLoading();
    cvStatus.textContent = 'Analyzing CV...';

    try {
        // In a real implementation, we would send the file to a backend service
        // For now, we'll simulate CV analysis with mock data
        await simulateCvAnalysis(file);

        cvAnalysis.classList.remove('hidden');
        cvStatus.textContent = `CV analyzed: ${file.name}`;
        cvStatus.style.color = '#00ff00';

        // Re-analyze job matches with the new CV data
        if (allJobs.length > 0) {
            analyzeJobMatches();
        }
    } catch (error) {
        showError(`Error analyzing CV: ${error.message}`);
        cvStatus.textContent = 'CV analysis failed';
        cvStatus.style.color = '#ff6b6b';
    } finally {
        hideLoading();
    }
}

// Extract dynamic CV data from uploaded file
async function simulateCvAnalysis(file) {
    // Read file content based on file type
    const fileContent = await readFileContent(file);
    
    // Extract data dynamically from file content
    const extractedData = extractCvData(fileContent);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Set CV data from actual file content
    cvData = extractedData;
    cvSkills = cvData.skills;
    cvExperience = cvData.experience;

    // Update CV analysis display with actual data
    cvSkillsDiv.innerHTML = `<strong>Skills:</strong> ${cvSkills.length > 0 ? cvSkills.join(', ') : 'No skills detected'}`;
    cvExperienceDiv.innerHTML = `<strong>Experience:</strong> ${cvExperience > 0 ? cvExperience + ' years' : 'Not specified'}`;
}

// Read file content from uploaded file
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
        
        // Read as text (supports .txt, .csv, etc.)
        reader.readAsText(file);
    });
}

// Extract CV data dynamically from file content
function extractCvData(fileContent) {
    const text = fileContent.toLowerCase();
    
    // Initialize extracted data
    const extracted = {
        name: "",
        email: "",
        skills: [],
        experience: 0,
        education: ""
    };

    // Extract email
    const emailMatch = fileContent.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
        extracted.email = emailMatch[0];
    }

    // Extract name (usually first line or after "name:" keyword)
    const nameMatch = fileContent.match(/(?:^|\n)([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (nameMatch) {
        extracted.name = nameMatch[1];
    }

    // Extract years of experience (look for patterns like "5 years", "5+ years", "experience: 5")
    const expMatch = fileContent.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|work)/i);
    if (expMatch) {
        extracted.experience = parseInt(expMatch[1]);
    }

    // Dynamic skill extraction - look for common tech skills in the text
    const techSkills = [
        'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust',
        'react', 'vue', 'angular', 'svelte', 'nextjs', 'gatsby', 'express', 'fastapi',
        'node.js', 'django', 'flask', 'spring', 'asp.net', 'laravel',
        'html', 'css', 'scss', 'bootstrap', 'tailwind',
        'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'firebase',
        'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'heroku',
        'rest', 'graphql', 'websockets', 'oauth', 'jwt',
        'jest', 'mocha', 'pytest', 'jasmine', 'testing library',
        'agile', 'scrum', 'devops', 'ci/cd', 'microservices'
    ];

    techSkills.forEach(skill => {
        // Use word boundaries to match whole words
        const regex = new RegExp(`\\b${skill}\\b`, 'gi');
        if (regex.test(text)) {
            // Capitalize properly for display
            const displaySkill = skill
                .split(/[.+-]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('.');
            extracted.skills.push(displaySkill);
        }
    });

    // Remove duplicates
    extracted.skills = [...new Set(extracted.skills)];

    // Extract education (look for degree patterns)
    const eduMatch = fileContent.match(/(?:^|\n).*?(?:bachelor|master|phd|degree|b\.s\.|m\.s\.|b\.a\.|m\.a\.).*?(?:in|of)?\s*([a-z\s]+)?/i);
    if (eduMatch) {
        extracted.education = eduMatch[0].trim();
    }

    // If no data extracted, provide helpful defaults
    if (extracted.skills.length === 0) {
        extracted.skills = ['Unable to detect skills - please ensure CV contains technical terms'];
    }
    if (extracted.experience === 0) {
        extracted.experience = 1; // Default to 1 year if not found
    }
    if (!extracted.name) {
        extracted.name = 'CV Data';
    }

    return extracted;
}

// Analyze job matches based on CV
function analyzeJobMatches() {
    highMatchJobs = [];
    moderateMatchJobs = [];

    allJobs.forEach(job => {
        const matchScore = calculateJobMatchScore(job);

        if (matchScore >= 50) {
            // High match (50% or above)
            job.matchScore = matchScore;
            highMatchJobs.push(job);
        } else if (matchScore > 0) {
            // Moderate match (above 0% but below 50%)
            job.matchScore = matchScore;
            moderateMatchJobs.push(job);
        }
        // Jobs with 0% match are not displayed
    });

    // Sort by match score (highest first)
    highMatchJobs.sort((a, b) => b.matchScore - a.matchScore);
    moderateMatchJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Update counts
    highMatchCount.textContent = highMatchJobs.length;
    moderateMatchCount.textContent = moderateMatchJobs.length;

    // Display jobs
    displayHighMatchJobs();
    displayModerateMatchJobs();
}

// Calculate job match score based on CV
function calculateJobMatchScore(job) {
    if (!cvSkills || cvSkills.length === 0) {
        return 0;
    }

    let score = 0;
    const maxScore = 100;

    // Check for skill matches in title and description
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    let skillMatches = 0;

    cvSkills.forEach(skill => {
        if (jobText.includes(skill.toLowerCase())) {
            skillMatches++;
        }
    });

    // Calculate skill match percentage (0-50 points)
    const skillMatchPercentage = (skillMatches / cvSkills.length) * 50;
    score += skillMatchPercentage;

    // Check experience match (0-30 points)
    if (job.experience) {
        const expMatch = calculateExperienceMatch(job.experience);
        score += expMatch;
    }

    // Check for relevance bonus (0-20 points)
    const relevanceBonus = calculateRelevanceBonus(job);
    score += relevanceBonus;

    return Math.min(score, maxScore); // Cap at 100
}

// Calculate experience match score
function calculateExperienceMatch(experienceStr) {
    if (!cvExperience) return 0;

    // Extract years from experience string (e.g., "3-5 years" -> 3,5)
    const yearsMatch = experienceStr.match(/(\d+)-?(\d*)/);
    if (!yearsMatch) return 15; // Default middle value if can't parse

    const minYears = parseInt(yearsMatch[1]);
    const maxYears = yearsMatch[2] ? parseInt(yearsMatch[2]) : minYears;

    // Ideal match is when CV experience falls within the job's required range
    if (cvExperience >= minYears && cvExperience <= maxYears) {
        return 30; // Perfect experience match
    } else if (cvExperience < minYears) {
        // CV has less experience than required
        const gap = minYears - cvExperience;
        return Math.max(0, 30 - (gap * 3)); // Penalize for lacking experience
    } else {
        // CV has more experience than required
        const gap = cvExperience - maxYears;
        return Math.max(0, 30 - (gap * 1.5)); // Slight penalty for overqualified
    }
}

// Calculate relevance bonus based on job title and company
function calculateRelevanceBonus(job) {
    let bonus = 0;
    const jobTitle = job.title.toLowerCase();
    const company = job.company.toLowerCase();

    // Bonus for senior/lead positions if CV has significant experience
    if (cvExperience >= 5) {
        if (jobTitle.includes('senior') || jobTitle.includes('lead') ||
            jobTitle.includes('manager') || jobTitle.includes('architect')) {
            bonus += 10;
        }
    }

    // Bonus for certain technologies mentioned in CV
    const techBonuses = {
        'javascript': 5,
        'react': 5,
        'node.js': 5,
        'python': 5,
        'sql': 3,
        'html': 3,
        'css': 3
    };

    Object.keys(techBonuses).forEach(tech => {
        if (cvSkills.includes(tech) &&
            (jobTitle.includes(tech) || company.includes(tech) ||
             job.description.toLowerCase().includes(tech))) {
            bonus += techBonuses[tech];
        }
    });

    return Math.min(bonus, 20); // Cap bonus at 20 points
}

// Display high match jobs
function displayHighMatchJobs() {
    if (highMatchJobs.length === 0) {
        highMatchContainer.innerHTML = '<div class="no-jobs">No highly relevant jobs found.</div>';
        return;
    }

    // Group jobs by source for high match panel
    const jobsBySource = {};
    highMatchJobs.forEach(job => {
        if (!jobsBySource[job.source]) {
            jobsBySource[job.source] = [];
        }
        jobsBySource[job.source].push(job);
    });

    highMatchContainer.innerHTML = '';

    Object.keys(jobsBySource).sort().forEach(source => {
        const sourceGroup = createSourceGroupForPanel(source, jobsBySource[source], true);
        highMatchContainer.appendChild(sourceGroup);
    });
}

// Display moderate match jobs
function displayModerateMatchJobs() {
    if (moderateMatchJobs.length === 0) {
        moderateMatchContainer.innerHTML = '<div class="no-jobs">No moderate match jobs found.</div>';
        return;
    }

    // Group jobs by source for moderate match panel
    const jobsBySource = {};
    moderateMatchJobs.forEach(job => {
        if (!jobsBySource[job.source]) {
            jobsBySource[job.source] = [];
        }
        jobsBySource[job.source].push(job);
    });

    moderateMatchContainer.innerHTML = '';

    Object.keys(jobsBySource).sort().forEach(source => {
        const sourceGroup = createSourceGroupForPanel(source, jobsBySource[source], false);
        moderateMatchContainer.appendChild(sourceGroup);
    });
}

// Create a source group element for panels (with match score display)
function createSourceGroupForPanel(source, jobs, isHighMatchPanel) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'source-group';

    const header = document.createElement('div');
    header.className = 'source-header';

    const sourceName = document.createElement('div');
    sourceName.className = 'source-name';
    sourceName.textContent = source;

    const sourceCount = document.createElement('div');
    sourceCount.className = 'source-count';
    sourceCount.textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;

    header.appendChild(sourceName);
    header.appendChild(sourceCount);

    const jobsList = document.createElement('div');
    jobsList.className = 'jobs-list';

    jobs.forEach(job => {
        const jobCard = createJobCardForPanel(job, isHighMatchPanel);
        jobsList.appendChild(jobCard);
    });

    groupDiv.appendChild(header);
    groupDiv.appendChild(jobsList);

    return groupDiv;
}

// Create a job card element for panels (with match score)
function createJobCardForPanel(job, isHighMatchPanel) {
    const card = document.createElement('div');
    card.className = 'job-card';

    // Add match score indicator
    const matchScore = job.matchScore || 0;
    const scoreColor = matchScore >= 70 ? '#00ff00' :
                      matchScore >= 50 ? '#ffaa00' :
                      '#ff6b6b';

    const scoreBadge = document.createElement('div');
    scoreBadge.style.position = 'absolute';
    scoreBadge.style.top = '10px';
    scoreBadge.style.right = '10px';
    scoreBadge.style.background = scoreColor;
    scoreBadge.style.color = 'white';
    scoreBadge.style.borderRadius = '12px';
    scoreBadge.style.padding = '4px 8px';
    scoreBadge.style.fontSize = '12px';
    scoreBadge.style.fontWeight = 'bold';
    scoreBadge.textContent = `${matchScore}% Match`;

    card.style.position = 'relative';
    card.appendChild(scoreBadge);

    const title = document.createElement('div');
    title.className = 'job-title';
    title.textContent = job.title || 'No title';

    const company = document.createElement('div');
    company.className = 'job-company';
    company.textContent = job.company || 'Company not specified';

    const details = document.createElement('div');
    details.className = 'job-details';

    if (job.location) {
        const locationItem = document.createElement('div');
        locationItem.className = 'job-detail-item';
        locationItem.innerHTML = `<strong>📍</strong> ${job.location}`;
        details.appendChild(locationItem);
    }

    if (job.experience) {
        const expItem = document.createElement('div');
        expItem.className = 'job-detail-item';
        expItem.innerHTML = `<strong>💼</strong> ${job.experience}`;
        details.appendChild(expItem);
    }

    if (job.salary) {
        const salaryItem = document.createElement('div');
        salaryItem.className = 'job-detail-item';
        salaryItem.innerHTML = `<strong>💰</strong> ${job.salary}`;
        details.appendChild(salaryItem);
    }

    if (job.postedDate) {
        const dateItem = document.createElement('div');
        dateItem.className = 'job-detail-item';
        const date = new Date(job.postedDate);
        dateItem.innerHTML = `<strong>📅</strong> ${date.toLocaleDateString()}`;
        details.appendChild(dateItem);
    }

    if (job.description) {
        const description = document.createElement('div');
        description.className = 'job-description';
        description.textContent = job.description;
        card.appendChild(description);
    }

    if (job.url) {
        const link = document.createElement('a');
        link.href = job.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'job-link';
        link.textContent = 'View Job →';
        card.appendChild(link);
    }

    card.appendChild(title);
    card.appendChild(company);
    card.appendChild(details);

    return card;
}

// Apply filters (for backward compatibility, though less relevant now)
function applyFilters() {
    // Filtering is now handled in analyzeJobMatches()
    // Just redisplay the current job sets
    displayHighMatchJobs();
    displayModerateMatchJobs();
}

// Clear all filters
function clearFilters() {
    sourceFilter.value = 'all';
    locationFilter.value = '';
    applyFilters();
}

// Clear results displays
function clearResults() {
    highMatchContainer.innerHTML = '';
    moderateMatchContainer.innerHTML = '';
    highMatchCount.textContent = '0';
    moderateMatchCount.textContent = '0';
}

// UI helper functions
function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// Results are always shown in the two-panel layout, so we don't need hide/show functions

