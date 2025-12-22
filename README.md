# JobHunt - Job Aggregation Web Application

A simple job aggregation web application that fetches and displays job listings from multiple platforms in one place.

## Features

- **Multi-source aggregation**: Fetches jobs from Wellfound and Hirist
- **Keyword-based search**: Search jobs by keywords (e.g., "react dev", "node js")
- **Source grouping**: Jobs are displayed grouped by their source platform
- **Basic filtering**: Filter jobs by source and location
- **Normalized data**: All jobs are normalized into a common schema regardless of source

## Architecture

### Backend
- **Node.js/Express** server
- Source-specific fetch functions in `src/services/sources/`
- Data normalization in `src/services/normalizer.js`
- Simple JSON file storage in `data/jobs.json`
- RESTful API endpoints

### Frontend
- Single-page HTML/CSS/JavaScript application
- Responsive design
- Real-time filtering

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
2. Click "Search Jobs" or press Enter
3. View aggregated jobs grouped by source
4. Use filters to narrow down results by source or location

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

