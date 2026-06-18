# 🚀 Quick Start Guide - LinkedIn Extension Setup

## Prerequisites

- Google Chrome browser (latest version)
- Basic understanding of Chrome extensions

## 📦 Installation Steps

### Step 1: Locate the Extension Folder

The LinkedIn extension files are located in:
```
JobHunt/linkedin-extension/
```

### Step 2: Open Chrome Extensions Page

1. Open Google Chrome
2. Go to: `chrome://extensions/`
3. Or use menu: `☰ → More tools → Extensions`

### Step 3: Enable Developer Mode

- Look at the **top-right corner** of the Extensions page
- Toggle **"Developer mode"** to **ON**

### Step 4: Load the Extension

1. Click **"Load unpacked"** button (appears after enabling Developer mode)
2. Navigate to the `linkedin-extension` folder
3. Click **"Select Folder"**

### Step 5: Verify Installation

- You should see the extension in your extensions list
- Look for "JobHunt LinkedIn Assistant" 
- Pin it to your toolbar (click the pin icon) for easy access

## ✅ Testing the Extension

### Test 1: Extract a Job

1. Visit any LinkedIn job page: `https://www.linkedin.com/jobs/view/[ID]/`
2. Wait 1-2 seconds for the extension to extract
3. Click the **JobHunt extension icon** in your toolbar
4. You should see:
   - Job Title
   - Company Name
   - Job Description
   - Extraction timestamp

### Test 2: Multiple Jobs

1. Navigate to another LinkedIn job
2. The popup should update automatically
3. Try switching between jobs rapidly

### Test 3: Check Console Logs

For debugging:
1. Open the job page
2. Press `F12` to open DevTools
3. Go to the **"Console"** tab
4. Look for logs starting with `[JobHunt]`

Expected logs:
```
[JobHunt] LinkedIn Extractor Content Script Loaded
[JobHunt] Performing initial extraction on page load
[JobHunt] Successfully extracted job details
```

## 🔍 Troubleshooting

### Issue: Popup shows "No job data extracted yet"

**Solution:**
1. Make sure you're on a valid LinkedIn job page URL (contains `/jobs/view/` or `/jobs/collections/`)
2. Wait 2 seconds after the page loads
3. Try refreshing the page (Ctrl+R or Cmd+R)
4. Check the Console tab in DevTools for error messages

### Issue: "Not on a LinkedIn job page, script inactive"

**Solution:**
- The extension only runs on LinkedIn job URLs
- Valid URLs:
  - ✅ `https://www.linkedin.com/jobs/view/123456789/`
  - ✅ `https://www.linkedin.com/jobs/collections/12345/`
  - ✅ `https://www.linkedin.com/jobs/search/...`
- Invalid URLs:
  - ❌ `https://www.linkedin.com/feed/`
  - ❌ `https://www.linkedin.com/in/profile/`

### Issue: Job description is incomplete

**Solution:**
- LinkedIn may truncate descriptions
- Try scrolling down on the job page to trigger "Show more"
- Close and reopen the extension popup

### Issue: Extension doesn't appear in toolbar

**Solution:**
1. Go to `chrome://extensions/`
2. Find "JobHunt LinkedIn Assistant"
3. Click the **pin icon** next to the extension name

## 📝 Checking Extracted Data

The extension extracts data in this format:

```json
{
  "source": "LinkedIn",
  "jobTitle": "Senior Software Engineer",
  "company": "Tech Company Inc.",
  "description": "We are looking for...",
  "extractedAt": "2024-01-15T10:30:00.000Z",
  "url": "https://www.linkedin.com/jobs/view/..."
}
```

To see this data:
1. Click the extension popup
2. All visible fields contain the extracted data
3. Data is stored locally in your browser

## 🔄 Reloading the Extension

If you modify any files:

1. Go to `chrome://extensions/`
2. Find "JobHunt LinkedIn Assistant"
3. Click the **refresh icon** 🔄
4. Test again on a LinkedIn job page

## 🛠️ Development Workflow

### Making Changes

1. Edit files in `linkedin-extension/` folder
2. Reload the extension (click refresh icon)
3. Test on a LinkedIn job page

### Useful Logs

Open DevTools on a LinkedIn job page:
- `F12` or `Ctrl+Shift+J`
- Go to Console tab
- Search for `[JobHunt]` logs

### Testing Specific Features

```javascript
// In DevTools console on a LinkedIn job page:

// Check if extraction worked
localStorage.getItem('lastExtractedJob')

// Manually trigger extraction
chrome.runtime.sendMessage({ action: 'GET_CURRENT_JOB' }, console.log)
```

## 📚 File Reference

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration |
| `linkedin-extractor.js` | Main extraction script |
| `background.js` | Background service worker |
| `popup.html` | Popup UI |
| `popup.js` | Popup logic |
| `popup.css` | Popup styling |
| `types.ts` | TypeScript type definitions |
| `linkedin-extractor.ts` | TypeScript version |

## 🎯 Next Steps

After installation:

1. **Verify extraction** on a LinkedIn job page
2. **Review the code** in `linkedin-extractor.js`
3. **Plan backend integration** with your JobHunt server
4. **Customize selectors** if LinkedIn's DOM structure changes

## 📞 Support

If you encounter issues:

1. Check the **Console tab** for error messages
2. Verify you're on a valid **LinkedIn job page**
3. Try **reloading the extension**
4. Check this guide's **Troubleshooting section**

---

**Happy job hunting! 🎯**
