# JobHunt LinkedIn Extension (MV3)

A Chrome Extension (Manifest V3) that automatically extracts job details from LinkedIn job postings.

## 📋 Features

- **Automatic Extraction**: Automatically extracts job title, company name, and description from LinkedIn job pages
- **Dynamic Content Handling**: Uses MutationObserver to handle LinkedIn's dynamic content loading
- **Real-time Updates**: Detects when users navigate between job postings and re-extracts data
- **Persistent Storage**: Stores extracted data using Chrome Storage API
- **Clean UI Popup**: Beautiful red and black themed popup to display extracted data
- **Background Service Worker**: Secure data handling and communication

## 📁 File Structure

```
linkedin-extension/
├── manifest.json              # MV3 manifest configuration
├── linkedin-extractor.js      # Content script for DOM extraction
├── background.js              # Service worker for data handling
├── popup.html                 # Popup UI template
├── popup.js                   # Popup UI logic
├── popup.css                  # Popup styling (red/black theme)
└── README.md                  # This file
```

## 🚀 Installation

### For Development:

1. **Clone or copy the extension folder** to your local machine
2. **Open Chrome Extensions Page**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top-right corner)
3. **Load the extension**:
   - Click "Load unpacked"
   - Select the `linkedin-extension` folder
4. **Test the extension**:
   - Navigate to any LinkedIn job posting (e.g., https://www.linkedin.com/jobs/view/12345678/)
   - The extension will automatically extract the job details
   - Click the extension icon to view extracted data

## 🔧 Components Overview

### 1. **manifest.json** (MV3 Configuration)

Key aspects:
- **Manifest Version**: 3 (latest Chrome standard)
- **Permissions**: 
  - `activeTab`: Access to active tab
  - `scripting`: Execute content scripts
- **Host Permissions**: Restricted to LinkedIn job URLs only
  - `https://www.linkedin.com/jobs/view/*`
  - `https://www.linkedin.com/jobs/collections/*`
  - `https://www.linkedin.com/jobs/search/*`
- **Content Script**: Runs automatically on job pages
- **Background Service Worker**: Handles data communication

### 2. **linkedin-extractor.js** (Content Script)

**Responsibilities**:
- Extracts job data from LinkedIn's DOM
- Handles dynamic content loading with MutationObserver
- Detects URL changes for job navigation
- Sends extracted data to background service worker

**Key Functions**:
- `extractJobDetails()`: Main extraction function
- `extractTextBySelectors()`: Fallback selector logic
- `extractJobDescription()`: Robust description extraction
- `initializeMutationObserver()`: Watches for DOM changes
- `performInitialExtraction()`: Initial load extraction
- `watchForNavigationChanges()`: Tracks URL/navigation changes

**Data Structure Returned**:
```javascript
{
  source: "LinkedIn",
  jobTitle: "Senior Software Engineer",
  company: "Tech Company Inc.",
  description: "Full job description text...",
  extractedAt: "2024-01-15T10:30:00.000Z",
  url: "https://www.linkedin.com/jobs/view/..."
}
```

### 3. **background.js** (Service Worker)

**Responsibilities**:
- Receives messages from content script
- Stores extracted data in chrome.storage
- Communicates with popup
- Keeps extension alive and responsive

**Message Handlers**:
- `LINKEDIN_JOB_EXTRACTED`: Receives and stores job data
- `GET_CURRENT_JOB`: Returns stored job data to popup
- `CLEAR_STORED_DATA`: Clears all stored data
- `PING`: Keep-alive check for service worker

### 4. **popup.html / popup.js / popup.css**

**UI Features**:
- Displays extracted job title, company, and description
- Shows extraction timestamp
- "Send to Analysis" button for future integration
- "Clear" button to reset data
- Auto-refreshes every 3 seconds

## 📊 Data Extraction Process

1. **Page Load**: Content script runs when page loads
2. **Initial Extraction**: Waits 1 second for DOM to settle, then extracts data
3. **MutationObserver**: Watches for dynamic content changes (debounced 500ms)
4. **Navigation Detection**: Monitors URL changes and re-extracts on job switches
5. **Message Passing**: Sends data to background service worker via `chrome.runtime.sendMessage()`
6. **Storage**: Service worker stores data in `chrome.storage.local`
7. **Popup Display**: Popup retrieves and displays the stored data

## 🔍 DOM Selectors Used

The content script tries multiple selector strategies to handle LinkedIn's DOM variations:

**Job Title**:
- `[data-job-title]`
- `.jobs-details-top-card__job-title`
- `h2[class*="title"]`
- `[class*="job-title"]`

**Company Name**:
- `[data-company-name]`
- `.jobs-details-top-card__company-name`
- `a[class*="company-name"]`
- `[class*="company"]`

**Job Description**:
- `.jobs-details__main-content`
- `.show-more-less-html__markup`
- `article[class*="description"]`
- `[id*="description"]`

## 🔒 Security & Privacy

- **Limited Permissions**: Only runs on LinkedIn job pages
- **Content Script Isolation**: Runs in isolated context, no access to other scripts
- **Data Storage**: Uses Chrome Storage API (local to browser)
- **Message Passing**: Uses Chrome's secure runtime messaging
- **No Remote Calls**: All extraction happens locally (ready for backend integration)

## 🧪 Testing

### Test Scenarios:

1. **Initial Page Load**:
   - Navigate to a LinkedIn job page
   - Check browser console (Ctrl+Shift+J) for extraction logs
   - Click extension icon to view popup

2. **Job Navigation**:
   - Switch between different job postings
   - Verify data updates in popup

3. **Dynamic Content**:
   - Scroll to trigger "Show more" on description
   - Verify full description is captured

4. **Multiple Jobs**:
   - Test with different job postings
   - Verify extraction accuracy

### Debug Logs:

Look for console logs starting with `[JobHunt]`:
```
[JobHunt] LinkedIn Extractor Content Script Loaded
[JobHunt] Successfully extracted job details
[JobHunt Service Worker] Job data stored
```

## 🔄 Future Enhancements

1. **Backend Integration**: Send extracted data to your JobHunt server
2. **CV Matching**: Integrate with existing CV analysis
3. **One-Click Apply**: Add quick apply functionality
4. **Notifications**: Notify when matching jobs are found
5. **Job History**: Track job postings viewed
6. **Filtering**: Filter by salary range, location, etc.

## 📝 Integration with Main App

To integrate with your existing JobHunt app:

1. **Modify `sendJobDataToBackground()` in linkedin-extractor.js**:
   ```javascript
   // Send to your backend
   fetch('http://localhost:3000/api/jobs/extract', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(jobData)
   });
   ```

2. **Add handler in backend (server.js)**:
   ```javascript
   app.post('/api/jobs/extract', (req, res) => {
     const jobData = req.body;
     // Process with your job matcher
     res.json({ status: 'success' });
   });
   ```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not extracting data | Check if you're on a LinkedIn job page; check console for errors |
| Popup shows "No data" | Refresh the LinkedIn page and wait 2 seconds |
| Job description incomplete | LinkedIn may be showing truncated text; scroll to trigger "Show more" |
| Service worker errors | Reload extension in `chrome://extensions/` |

## 📞 Support

For issues or questions:
1. Check console logs for error messages
2. Verify you're on a supported LinkedIn job URL
3. Try reloading the extension

## 📄 License

Part of the JobHunt project. All rights reserved.
