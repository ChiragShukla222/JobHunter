# Vercel Deployment Guide

## Changes Made for Vercel Compatibility

### 1. Storage System
- **Changed**: Replaced file system storage with in-memory storage
- **Reason**: Vercel serverless functions don't have persistent file system access
- **Impact**: Data will be lost when serverless functions restart (each function instance is stateless)
- **Future**: Consider using Vercel KV (Redis), Vercel Postgres, or another database for persistent storage

### 2. Server Export
- **Changed**: Updated `server.js` to export the Express app for Vercel
- **Reason**: Vercel needs the app exported as a module, not just started with `app.listen()`

### 3. Static Files
- **Changed**: Made static file serving conditional (only in local development)
- **Reason**: Vercel automatically serves files from the `public` directory

### 4. Vercel Configuration
- **Added**: `vercel.json` configuration file
- **Purpose**: Routes API requests to the serverless function and serves static files

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Or connect your GitHub repository to Vercel for automatic deployments.

3. **Environment Variables** (if needed):
   - Add any required environment variables in the Vercel dashboard
   - Currently, no environment variables are required

## Important Notes

### Data Persistence
- **Current**: Jobs are stored in-memory and will be lost on function restart
- **For Production**: Consider implementing one of these:
  - **Vercel KV** (Redis) - Fast key-value storage
  - **Vercel Postgres** - SQL database
  - **MongoDB Atlas** - NoSQL database
  - **Supabase** - PostgreSQL with real-time features

### Function Timeout
- Vercel serverless functions have execution time limits
- Free tier: 10 seconds
- Pro tier: 60 seconds
- If job fetching takes longer, consider:
  - Using background jobs (Vercel Cron Jobs)
  - Implementing caching
  - Optimizing fetch functions

### Testing Locally
- The app still works locally with `npm start`
- Local development uses in-memory storage (same as Vercel)
- To test with persistent storage locally, modify `src/services/storage.js`

## Troubleshooting

### If deployment still fails:
1. Check Vercel logs in the dashboard
2. Ensure all dependencies are in `package.json`
3. Verify `vercel.json` syntax is correct
4. Check that `server.js` exports the app correctly

### Common Issues:
- **Module not found**: Ensure all dependencies are listed in `package.json`
- **Timeout errors**: Optimize fetch functions or increase timeout limits
- **Routing issues**: Verify `vercel.json` routes are correct

