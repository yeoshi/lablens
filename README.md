# LabLens

A Chrome extension that detects lab result PDFs in your browser, translates medical jargon into plain English in a side panel, and generates a printable "Questions for My Doctor" checklist.

Built for SuperAI NEXT Hackathon 2026.

## Features

- PDF text extraction via AWS Textract (with pdf.js fallback)
- Plain-English lab result translation via AWS Bedrock (Claude)
- Abnormal/borderline value flagging with color-coded cards
- Auto-generated doctor questions
- Chrome Side Panel UI
- Export summary to PDF (jsPDF)
- Local analysis history (chrome.storage.local)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure AWS (optional for demo)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your AWS credentials, or set `DEMO_MODE=true` to use sample data without AWS.

### 3. Build the extension

```bash
npm run build
```

### 4. Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist` folder

### 5. Try it

**Upload PDF (works for local files):**
1. Open the LabLens side panel
2. Click **Upload PDF** and select `sample-data/sample-lab-report.pdf`

**Analyse This Page (works for web-hosted PDFs):**
1. Serve the sample PDF over HTTP (Chrome blocks extensions from reading `file://` tabs):
   ```bash
   npm run serve-sample
   ```
2. Open http://localhost:3456/sample-lab-report.pdf in Chrome
3. Click **Analyse This Page** in the side panel

For local PDFs opened directly in Chrome (`file://`), always use **Upload PDF** instead.

## Development

```bash
npm run dev
```

Load the `dist` folder as an unpacked extension; Vite will rebuild on changes.

## Tech Stack

- Chrome Extension Manifest V3 + Side Panel API
- React + Tailwind CSS + Vite
- AWS Textract + AWS Bedrock (Claude)
- jsPDF for export
- chrome.storage.local for history

## Disclaimer

LabLens is not medical advice. Always consult your healthcare provider for interpretation of lab results.
