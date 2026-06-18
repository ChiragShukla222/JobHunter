# JobHunt - Intelligent Job Matching System

An advanced job aggregation web application that fetches job listings from multiple platforms and uses AI-powered matching to connect candidates with relevant opportunities.

## Features

- **Multi-source aggregation**: Fetches jobs from Wellfound, Hirist, LinkedIn, and more
- **Intelligent job matching**: Analyzes your CV to find highly relevant job matches
- **Two-panel layout**: See high match jobs (≥50%) and moderate match jobs (0-50%) side by side
- **CV upload and analysis**: Upload your resume/CV for personalized job recommendations
- **Modern black and red UI**: Sleek, professional interface optimized for usability
- **Keyword-based search**: Search jobs by keywords (e.g., "react dev", "node js")
- **Source filtering**: Filter jobs by source platform (Wellfound, Hirist, LinkedIn, etc.)
- **Location filtering**: Filter jobs by geographic location
- **Normalized data**: All jobs are normalized into a common schema regardless of source
- **Real job data**: Enhanced mock data that simulates real job listings with realistic details
- **Vercel ready**: Configured for seamless deployment to Vercel platform

## Architecture

### Backend
- **Node.js/Express** server
- Source-specific fetch functions in `src/services/sources/` (Wellfound, Hirist, LinkedIn)
- Data normalization in `src/services/normalizer.js`
- In-memory storage for Vercel compatibility (with production storage options documented)
- RESTful API endpoints for job fetching, storage, and retrieval
- Job matching algorithms for CV-to-job relevance scoring

### Frontend
- Single-page HTML/CSS/JavaScript application
- Modern black and red color scheme with professional styling
- Two-panel layout for job match visualization
- CV upload and analysis interface
- Responsive design for mobile and desktop
- Real-time filtering and sorting

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Enter a job keyword in the search box (e.g., "react dev", "node js")
2. Optionally upload your CV/resume for personalized job matching
3. Click "Search Jobs" or press Enter
4. Use the filters to narrow down results by source and location
5. View highly relevant jobs (≥50% match) in the left panel
6. View moderate match jobs (0-50% match) in the right panel
7. Click on job listings to view details and apply via the original source
8. See your match score (%) on each job card to gauge relevance

## Project Structure

```
JobHunt/
├── server.js                 # Express server entry point
├── package.json              # Dependencies and scripts
├── public/                   # Frontend files
│   ├── index.html           # Main HTML page
│   ├── styles.css           # Stylesheet
│   └── app.js               # Frontend JavaScript
├── src/
│   └── services/
│       ├── jobFetcher.js    # Main job fetching orchestrator
│       ├── normalizer.js    # Data normalization
│       ├── storage.js       # Data persistence
│       └── sources/         # Source-specific fetchers
│           ├── wellfound.js
│           └── hirist.js
└── data/                    # Storage directory (auto-created)
    └── jobs.json           # Stored job data
```

## API Endpoints

### POST `/api/jobs/fetch`
Fetch jobs from all sources for a keyword.

**Request:**
```json
{
  "keyword": "react dev"
}
```

**Response:**
```json
{
  "keyword": "react dev",
  "keywordId": "react dev",
  "jobs": [...],
  "count": 6
}
```

### GET `/api/jobs/:keywordId`
Get stored jobs for a keyword.

**Response:**
```json
{
  "keywordId": "react dev",
  "jobs": [...],
  "count": 6
}
```

### GET `/api/keywords`
Get all stored keywords.

**Response:**
```json
{
  "keywords": ["react dev", "node js"]
}
```

## Job Schema

All jobs are normalized into the following schema:

```javascript
{
  title: string,
  company: string,
  location: string,
  experience: string,
  source: string,        // 'wellfound' or 'hirist'
  url: string,
  postedDate: string,    // ISO date string
  description: string,
  salary: string,
  raw: object            // Original data from source
}
```

## Notes

- Currently uses mock data for demonstration. Replace the fetch functions in `src/services/sources/` with actual API implementations.
- Duplicate jobs are accepted for now (no deduplication).
- Data is stored in a simple JSON file. Consider migrating to a database for production use.

## Future Enhancements

- Deduplication of jobs across sources
- Job ranking and recommendations
- Analytics and insights
- Authentication and user profiles
- More job sources
- Advanced filtering and sorting

