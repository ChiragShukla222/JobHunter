// State management
let allJobs = [];
let filteredJobs = [];

// DOM elements
const keywordInput = document.getElementById('keywordInput');
const searchBtn = document.getElementById('searchBtn');
const sourceFilter = document.getElementById('sourceFilter');
const locationFilter = document.getElementById('locationFilter');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const resultsTitle = document.getElementById('resultsTitle');
const resultsCount = document.getElementById('resultsCount');
const jobsContainer = document.getElementById('jobsContainer');

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

// Search for jobs
async function handleSearch() {
    const keyword = keywordInput.value.trim();
    
    if (!keyword) {
        showError('Please enter a keyword to search');
        return;
    }

    hideError();
    showLoading();
    hideResults();

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
        
        applyFilters();
        showResults();
    } catch (error) {
        showError(`Error: ${error.message}`);
        hideResults();
    } finally {
        hideLoading();
    }
}

// Apply filters
function applyFilters() {
    filteredJobs = [...allJobs];

    // Filter by source
    const selectedSource = sourceFilter.value;
    if (selectedSource !== 'all') {
        filteredJobs = filteredJobs.filter(job => job.source === selectedSource);
    }

    // Filter by location
    const locationQuery = locationFilter.value.trim().toLowerCase();
    if (locationQuery) {
        filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes(locationQuery)
        );
    }

    displayJobs(filteredJobs);
}

// Clear all filters
function clearFilters() {
    sourceFilter.value = 'all';
    locationFilter.value = '';
    applyFilters();
}

// Display jobs grouped by source
function displayJobs(jobs) {
    if (jobs.length === 0) {
        jobsContainer.innerHTML = '<div class="no-jobs">No jobs found matching your criteria.</div>';
        resultsCount.textContent = '0 jobs found';
        return;
    }

    // Group jobs by source
    const jobsBySource = {};
    jobs.forEach(job => {
        if (!jobsBySource[job.source]) {
            jobsBySource[job.source] = [];
        }
        jobsBySource[job.source].push(job);
    });

    // Render jobs grouped by source
    jobsContainer.innerHTML = '';
    
    Object.keys(jobsBySource).sort().forEach(source => {
        const sourceGroup = createSourceGroup(source, jobsBySource[source]);
        jobsContainer.appendChild(sourceGroup);
    });

    resultsCount.textContent = `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`;
}

// Create a source group element
function createSourceGroup(source, jobs) {
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
        const jobCard = createJobCard(job);
        jobsList.appendChild(jobCard);
    });

    groupDiv.appendChild(header);
    groupDiv.appendChild(jobsList);

    return groupDiv;
}

// Create a job card element
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';

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

function showResults() {
    resultsSection.classList.remove('hidden');
}

function hideResults() {
    resultsSection.classList.add('hidden');
}

