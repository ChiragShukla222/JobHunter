# Architecture & Flow Diagrams

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          Chrome Browser Instance                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │   LinkedIn.com       │  │   Extension Popup    │         │
│  │   (Job Page)         │  │  (popup.html)        │         │
│  │                      │  │  popup.js            │         │
│  │  • DOM Elements      │  │  popup.css           │         │
│  │  • Job Details       │  │                      │         │
│  │  • Description Text  │  └──────────────────────┘         │
│  └─────────┬────────────┘           ▲                        │
│            │                        │                        │
│            │ DOM Read               │ Display Data           │
│            ▼                        │                        │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Content Script (linkedin-extractor.js)        │        │
│  │  ┌─────────────────────────────────────────┐   │        │
│  │  │ • Extracts Job Title                    │   │        │
│  │  │ • Extracts Company Name                 │   │        │
│  │  │ • Extracts Job Description              │   │        │
│  │  │ • MutationObserver (watch for changes)  │   │        │
│  │  │ • Navigation detection                  │   │        │
│  │  │ • Sends via chrome.runtime.sendMessage()│   │        │
│  │  └─────────────────────────────────────────┘   │        │
│  └──────────────────┬──────────────────────────────┘        │
│                     │ Extracted Data JSON                    │
│                     ▼                                        │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Background Service Worker (background.js)     │        │
│  │  ┌─────────────────────────────────────────┐   │        │
│  │  │ • Receive extracted job data            │   │        │
│  │  │ • Store in chrome.storage.local         │   │        │
│  │  │ • Handle messages from popup            │   │        │
│  │  │ • (Optional) Relay to backend API       │   │        │
│  │  └─────────────────────────────────────────┘   │        │
│  └──────────────────┬──────────────────────────────┘        │
│                     │ Data Request/Response                  │
│                     │ via chrome.runtime.onMessage          │
│                     └─────────────────────┐                 │
│                                           ▼                 │
│                        ┌───────────────────────────┐        │
│                        │  Chrome Storage API       │        │
│                        │  (chrome.storage.local)   │        │
│                        │  • lastExtractedJob       │        │
│                        │  • lastExtractionTime     │        │
│                        └───────────────────────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ (Optional)
                             ▼
                    ┌─────────────────┐
                    │  Your Backend   │
                    │  (server.js)    │
                    │                 │
                    │ /api/linkedin   │
                    │ /extract        │
                    └─────────────────┘
```

## 🔄 Data Extraction Flow

```
User Opens LinkedIn Job Page
          │
          ▼
┌─────────────────────────────────────┐
│  manifest.json matches URL?         │
│  linkedin.com/jobs/view/* etc.      │
└─────────────────────┬───────────────┘
                      │ YES
                      ▼
┌─────────────────────────────────────┐
│  Content Script Injects             │
│  (linkedin-extractor.js)            │
└─────────────────────┬───────────────┘
                      │
                      ▼
┌─────────────────────────────────────┐
│  Wait 1 second for DOM to settle    │
└─────────────────────┬───────────────┘
                      │
                      ▼
┌─────────────────────────────────────┐
│  Try Multiple DOM Selectors         │
│  ├─ [data-job-title]                │
│  ├─ .jobs-details-top-card__...    │
│  ├─ h2[class*="title"]             │
│  └─ [class*="job-title"]           │
└─────────────────────┬───────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Job      │ │ Company  │ │ Desc-    │
    │ Title    │ │ Name     │ │ ription  │
    └────┬─────┘ └────┬─────┘ └────┬─────┘
         │            │            │
         └────────────┼────────────┘
                      │
                      ▼
         ┌──────────────────────────┐
         │  Extract Complete?       │
         │  (All fields filled)     │
         └────┬──────────────┬──────┘
         YES  │              │  NO
              ▼              ▼
        ┌─────────────┐  Skip (retry
        │ Send Data   │   with MutationObserver)
        │ via Message │
        └─────┬───────┘
              │
              ▼
    ┌───────────────────────────────┐
    │  JSON Data:                   │
    │  {                            │
    │    source: "LinkedIn",        │
    │    jobTitle: "...",           │
    │    company: "...",            │
    │    description: "...",        │
    │    extractedAt: "...",        │
    │    url: "..."                 │
    │  }                            │
    └─────┬───────────────────────┘
          │ chrome.runtime.sendMessage()
          ▼
    ┌───────────────────────────────┐
    │  Background Service Worker    │
    │  (background.js)              │
    │  onMessage listener           │
    └─────┬───────────────────────┘
          │
          ├─► chrome.storage.local.set()
          │
          └─► Return confirmation
                      │
                      ▼
              ┌─────────────────┐
              │   Popup Ready   │
              │   to Display    │
              └─────────────────┘
```

## 🎬 Event Handling Sequence

```
Timeline: User navigates to LinkedIn job page

T0:  Page Load
     └─► manifest.json content_script injected
         └─► linkedin-extractor.js starts

T100ms: DOM Parsing
       └─► Page still loading

T500ms: Initial Content
       └─► linkedin-extractor.js waiting (500ms delay)

T1000ms: Extract Trigger 🔔
        ├─► Query DOM selectors
        ├─► Build data JSON
        ├─► Send via chrome.runtime.sendMessage()
        └─► MutationObserver activated

T1010ms: Message Received
        └─► background.js onMessage listener
            ├─► Store in chrome.storage
            └─► Send confirmation

T1500ms: MutationObserver Active
        └─► Watches for DOM changes
            ├─► If changes detected
            ├─► Wait 500ms (debounce)
            ├─► Extract again
            └─► Send updated data

T2000s: User Clicks "Clear"
       └─► popup.js sends CLEAR_STORED_DATA
           └─► background.js clears storage

T2010s: User Switches Jobs
       └─► URL changes detected
           ├─► Navigation listener triggers
           ├─► performInitialExtraction()
           ├─► Wait 1 second
           ├─► Extract new job data
           └─► Send to background

Continuous: Auto-Refresh Popup
            └─► Every 3 seconds
                ├─► popup.js requests data
                ├─► background.js responds
                └─► Popup updates UI
```

## 📦 Message Passing Format

### Content Script → Service Worker

```
chrome.runtime.sendMessage({
  action: 'LINKEDIN_JOB_EXTRACTED',
  data: {
    source: 'LinkedIn',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Corp',
    description: 'Lorem ipsum...',
    extractedAt: '2024-01-15T10:30:00Z',
    url: 'https://www.linkedin.com/jobs/view/12345'
  }
})
```

### Popup → Service Worker (Request)

```
chrome.runtime.sendMessage({
  action: 'GET_CURRENT_JOB'
})
```

### Service Worker → Popup (Response)

```
{
  status: 'success',
  data: {
    source: 'LinkedIn',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Corp',
    description: 'Lorem ipsum...',
    extractedAt: '2024-01-15T10:30:00Z',
    url: 'https://www.linkedin.com/jobs/view/12345'
  }
}
```

## 🔍 DOM Selector Strategy

```
Try to Extract Job Title:

1st Attempt: [data-job-title]
   └─► If found: return text ✓
   └─► If not: try next

2nd Attempt: .jobs-details-top-card__job-title
   └─► If found: return text ✓
   └─► If not: try next

3rd Attempt: h2[class*="title"]
   └─► If found: return text ✓
   └─► If not: try next

4th Attempt: [class*="job-title"]
   └─► If found: return text ✓
   └─► If not: return null ✗

Same strategy for:
  • Company Name (4 selectors)
  • Job Description (4 selectors)
```

## 💾 Storage Structure

### Chrome Storage (chrome.storage.local)

```
{
  lastExtractedJob: {
    source: 'LinkedIn',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Corp',
    description: 'Job description text...',
    extractedAt: '2024-01-15T10:30:00Z',
    url: 'https://www.linkedin.com/jobs/view/12345'
  },
  lastExtractionTime: '2024-01-15T10:30:00Z'
}
```

## 🔐 Permissions Model

```
What the extension CAN do:
├─ Read content of LinkedIn job pages ✓
├─ Extract text from DOM elements ✓
├─ Store data locally ✓
├─ Communicate via chrome APIs ✓
└─ Display popup with extracted data ✓

What the extension CANNOT do:
├─ Access other websites ✗
├─ Upload data without user action ✗
├─ Read browsing history ✗
├─ Access user credentials ✗
└─ Install or modify other software ✗

Permissions Declared:
{
  "permissions": [
    "activeTab",      ← Current tab access
    "scripting"       ← Inject content script
  ],
  "host_permissions": [
    "https://www.linkedin.com/jobs/view/*",    ← Only LinkedIn jobs
    "https://www.linkedin.com/jobs/collections/*"
  ]
}
```

## 🚀 Execution Lifecycle

```
INSTALLATION:
├─ User loads unpacked extension
├─ manifest.json parsed
├─ Permissions requested
└─ Extension ready

ACTIVATION:
├─ User visits LinkedIn job page
├─ URL matches host_permissions
├─ Content script injected
├─ linkedin-extractor.js initializes
└─ Extraction begins

EXTRACTION (per page):
├─ 1. DOM Stabilization (1000ms)
├─ 2. Selector Query (multiple fallbacks)
├─ 3. Text Extraction & Cleaning
├─ 4. Validation (all fields present?)
├─ 5. Message Sending
└─ 6. MutationObserver Setup

MONITORING:
├─ MutationObserver watches DOM
├─ URL monitor checks for navigation
├─ On changes → Debounced extraction
└─ On navigation → New job extraction

DISPLAY:
├─ Popup requests data every 3 seconds
├─ Service worker retrieves from storage
├─ Popup displays formatted data
└─ User sees real-time job info
```

## 🧩 Component Dependencies

```
manifest.json
    ├─► Declares permissions
    ├─► References content_scripts
    ├─► References background service_worker
    └─► References action.default_popup

linkedin-extractor.js (Content Script)
    ├─ Requires: manifest content_scripts permission
    ├─ Depends on: Chrome DOM API
    ├─ Uses: chrome.runtime.sendMessage()
    └─ Triggers: background.js onMessage

background.js (Service Worker)
    ├─ Requires: manifest background.service_worker
    ├─ Depends on: chrome.runtime.onMessage
    ├─ Uses: chrome.storage.local API
    └─ Serves: popup.js requests

popup.html/js/css (UI)
    ├─ Requires: manifest action.default_popup
    ├─ Loads: popup.js
    ├─ Styles: popup.css
    ├─ Uses: chrome.runtime.sendMessage()
    └─ Displays: Data from background.js

types.ts (TypeScript)
    ├─ Optional: For TypeScript projects
    ├─ Imports: In linkedin-extractor.ts
    └─ No runtime dependency
```

## 📊 Performance Characteristics

```
Extraction Time:
├─ Wait for page render:      1000ms
├─ Query DOM selectors:        ~10ms (per selector)
├─ Text extraction:             ~5ms
├─ Message transmission:        ~2ms
└─ Total per extraction:      ~1020ms

Memory Usage:
├─ Content script:           ~500KB
├─ Service worker:           ~300KB
├─ Storage (1 job):          ~50KB
├─ Popup UI:                 ~200KB
└─ Total:                   ~1MB

Message Size:
├─ Typical job data:        ~2-5KB
├─ Network overhead:        ~1KB
└─ Total per message:       ~3-6KB
```

---

**Architecture v1.0** | LinkedIn Extension | Manifest V3
