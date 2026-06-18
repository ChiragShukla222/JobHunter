const express = require('express');
const cors = require('cors');
const path = require('path');
const { fetchJobsByKeyword } = require('../src/services/jobFetcher');
const { saveJobs, getJobsByKeyword, getAllKeywords } = require('../src/services/storage');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Explicitly serve CSS and JS files
app.get('/styles.css', (req, res) => {
  res.type('text/css').sendFile(path.join(__dirname, '../public', 'styles.css'));
});

app.get('/app.js', (req, res) => {
  res.type('application/javascript').sendFile(path.join(__dirname, '../public', 'app.js'));
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// API endpoint to fetch and store jobs by keyword
app.post('/api/jobs/fetch', async (req, res) => {
  try {
    const { keyword } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const keywordId = keyword.toLowerCase().trim();
    const jobs = await fetchJobsByKeyword(keyword);
    
    if (jobs.length > 0) {
      saveJobs(keywordId, jobs);
    }

    res.json({ keyword, keywordId, jobs, count: jobs.length });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', message: error.message });
  }
});

// API endpoint to get stored jobs by keyword
app.get('/api/jobs/:keywordId', (req, res) => {
  try {
    const { keywordId } = req.params;
    const jobs = getJobsByKeyword(keywordId);
    
    res.json({ keywordId, jobs, count: jobs.length });
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ error: 'Failed to get jobs', message: error.message });
  }
});

// API endpoint to get all keywords
app.get('/api/keywords', (req, res) => {
  try {
    const keywords = getAllKeywords();
    res.json({ keywords });
  } catch (error) {
    console.error('Error getting keywords:', error);
    res.status(500).json({ error: 'Failed to get keywords', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback: Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;
