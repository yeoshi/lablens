# LabLens — Chrome Extension PRD

## SuperAI NEXT Hackathon 2026 | Team: Yeo Shi + Rose

> **One-liner:** A Chrome extension that detects lab result PDFs in your browser, translates medical jargon into plain English in a side panel, and generates a printable "Questions for My Doctor" checklist.

---

## 1. Problem

Patients in Singapore (and globally) receive lab results through hospital patient portals (e.g. SingHealth HealthBuddy, NUHS MyChart, Parkway) or as emailed PDFs. These reports are filled with medical abbreviations, reference ranges, and clinical terminology that most people can't interpret. The result: anxiety, Googling symptoms incorrectly, or waiting weeks to ask a doctor what "elevated ALT" means.

Existing tools like RosettaMD and Medsplain require copy-pasting text or navigating to a separate website. None work directly in-browser on a PDF you're already viewing, and none generate actionable next-step questions.

## 2. Target User

- **Primary:** Patients aged 25–55 who access lab results digitally through hospital portals or email attachments
- **Secondary:** Caregivers (adult children managing elderly parents' health) who receive forwarded lab PDFs
- **Context:** Singapore healthcare system (common portals: HealthBuddy, MyChart, Raffles Connect), but works globally

## 3. Core User Flow

```
1. User opens a lab result PDF in Chrome (from patient portal, email, or local file)
2. User clicks the LabLens extension icon in the toolbar
3. LabLens extracts text from the visible PDF using AWS Textract
4. AWS Bedrock (Claude) processes the extracted text and returns:
   a. A plain-English summary of each lab value
   b. Flagged values (abnormal/borderline) highlighted
   c. A "Questions for My Doctor" checklist
5. Results appear in Chrome's Side Panel alongside the original PDF
6. User can:
   a. Save the summary to their local history (stored in chrome.storage)
   b. Export a combined PDF (summary + questions) for their next appointment
```

## 4. Feature Scope — What to Build (and NOT Build)

### ✅ In Scope (MVP for 36 hours)

| Feature | Priority | Description |
|---|---|---|
| PDF text extraction | P0 | Extract text from the currently-viewed PDF tab via AWS Textract |
| Plain-English translation | P0 | Send extracted text to Bedrock Claude → return simplified summary with each lab value explained |
| Abnormal value flagging | P0 | Highlight out-of-range values with red/amber colour coding in the side panel |
| Questions for Doctor | P0 | Auto-generate 3–5 specific questions based on the flagged values |
| Chrome Side Panel UI | P0 | All results render in Chrome's native Side Panel API (persistent, alongside the PDF) |
| Export to PDF | P1 | One-click download of a clean PDF containing: summary + questions + date/source |
| Local history | P1 | Save past analyses to chrome.storage.local — viewable as a list in the side panel |
| Loading/processing state | P1 | Skeleton loader + progress indicator during Textract → Bedrock pipeline |

### ❌ Out of Scope (Do NOT build)

- User accounts / authentication
- Cloud storage / syncing across devices
- Diagnosis or medical advice (explicit disclaimer required)
- Image-based analysis (X-rays, MRIs) — text lab results only
- Multilingual support (English only for MVP)
- Integration with hospital systems or APIs
- Mobile or other browsers

## 5. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Extension framework | Chrome Extension Manifest V3 | Required for Chrome Web Store + Side Panel API |
| Side Panel UI | React + Tailwind CSS | Fast to build, clean output, Cursor-friendly |
| PDF text extraction | AWS Textract (via API) | Handles scanned PDFs and typed PDFs; AWS sponsor = bonus points |
| AI processing | AWS Bedrock — Claude Sonnet | LLM for translation + question generation; AWS sponsor alignment |
| PDF export | jsPDF (client-side) | No server needed, generates PDF in-browser |
| Local storage | chrome.storage.local | Stores history without needing a backend |
| Deployment | Chrome Web Store (dev mode for demo) | Load unpacked for hackathon demo |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CHROME BROWSER                        │
│                                                         │
│  ┌──────────────┐    ┌───────────────────────────────┐  │
│  │              │    │       SIDE PANEL (React)       │  │
│  │   PDF Tab    │    │                               │  │
│  │  (patient    │    │  ┌─────────────────────────┐  │  │
│  │   portal /   │    │  │   📋 SUMMARY VIEW       │  │  │
│  │   email)     │    │  │                         │  │  │
│  │              │    │  │   Plain-English breakdown│  │  │
│  │              │    │  │   of each lab value      │  │  │
│  │              │    │  │   🔴 Flagged abnormals   │  │  │
│  │              │    │  │   🟡 Borderline values   │  │  │
│  │              │    │  │   🟢 Normal values       │  │  │
│  │              │    │  ├─────────────────────────┤  │  │
│  │              │    │  │   🩺 QUESTIONS FOR DOC   │  │  │
│  │              │    │  │                         │  │  │
│  │              │    │  │   1. Why is my ALT...   │  │  │
│  │              │    │  │   2. Should I retest... │  │  │
│  │              │    │  │   3. Does this affect...│  │  │
│  │              │    │  ├─────────────────────────┤  │  │
│  │              │    │  │  [📥 Export PDF] [💾 Save]│  │  │
│  │              │    │  └─────────────────────────┘  │  │
│  │              │    │                               │  │
│  └──────────────┘    └───────────────────────────────┘  │
│         │                         ▲                     │
│         │ content script          │                     │
│         │ captures PDF            │ displays results    │
│         ▼                         │                     │
│  ┌──────────────────────────────────┐                   │
│  │      SERVICE WORKER (background) │                   │
│  │                                  │                   │
│  │  1. Receive PDF blob             │                   │
│  │  2. Send to AWS Textract  ───────┼──► AWS Textract   │
│  │  3. Receive extracted text       │                   │
│  │  4. Send to AWS Bedrock   ───────┼──► AWS Bedrock    │
│  │  5. Receive structured JSON      │     (Claude)      │
│  │  6. Send to Side Panel           │                   │
│  └──────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## 6. AI Prompt Design (Bedrock Claude)

### System Prompt

```
You are LabLens, a medical lab report translator. Your job is to take raw lab result text and convert it into plain English that a non-medical person can understand.

Rules:
- NEVER diagnose or give medical advice
- NEVER say "you should" or "you need to" — instead say "you may want to ask your doctor about..."
- Explain each lab value in 1–2 simple sentences
- Flag values outside the reference range as ABNORMAL (red) or BORDERLINE (amber)
- Use analogies when helpful (e.g. "Think of HDL cholesterol as the cleanup crew in your blood vessels")
- End every explanation with what the value measures and why it matters in everyday terms
- Generate 3–5 specific questions the patient should ask their doctor, based on the flagged values
- Always include the disclaimer: "This is not medical advice. Please consult your healthcare provider."

Respond in this exact JSON format:
{
  "summary": "A 2–3 sentence overview of the report",
  "values": [
    {
      "name": "Test name",
      "originalValue": "value + unit as shown in report",
      "referenceRange": "range as shown in report",
      "status": "normal" | "borderline" | "abnormal",
      "explanation": "Plain English explanation (1–2 sentences)",
      "analogy": "Optional simple analogy if it helps"
    }
  ],
  "questions": [
    {
      "question": "The question to ask",
      "context": "Why this question matters based on the results"
    }
  ],
  "disclaimer": "This is not medical advice. Please consult your healthcare provider for interpretation of your results."
}
```

## 7. UI/UX Design Specification

### 7.1 Design Direction

**Aesthetic:** Clean medical-tech — think Headspace meets a modern clinic. Calm, trustworthy, not clinical-cold. Rounded corners, soft shadows, warm neutrals with purposeful colour accents for status indicators.

**Typography:**
- Headlines: `DM Sans` (700) — friendly, modern, reads well at all sizes
- Body: `DM Sans` (400/500) — consistent, clean
- Monospace for original values: `JetBrains Mono` — to differentiate raw data from explanations

**Colour Palette:**
```
--bg-primary:       #FAFBFC      /* warm off-white */
--bg-card:          #FFFFFF
--bg-panel:         #F4F6F8      /* subtle grey for sections */
--text-primary:     #1A2332      /* near-black, warm */
--text-secondary:   #5F6B7A      /* muted grey */
--accent-blue:      #2563EB      /* trust blue — buttons, links */
--status-normal:    #10B981      /* green */
--status-borderline:#F59E0B      /* amber */
--status-abnormal:  #EF4444      /* red */
--status-normal-bg: #ECFDF5      /* light green bg */
--status-borderline-bg: #FFFBEB  /* light amber bg */
--status-abnormal-bg:   #FEF2F2  /* light red bg */
--border:           #E5E7EB
```

### 7.2 Side Panel Layout (400px wide)

```
┌─────────────────────────────────┐
│  🔬 LabLens          [History 📋]│  ← Header bar (sticky)
├─────────────────────────────────┤
│                                 │
│  📊 Your Results Summary        │  ← Section: Overview
│  ┌─────────────────────────┐    │
│  │ "Your complete blood     │    │  ← 2–3 sentence plain
│  │  count looks mostly      │    │     English overview
│  │  normal, with two values │    │
│  │  worth discussing..."    │    │
│  └─────────────────────────┘    │
│                                 │
│  ─── Lab Values ───────────     │  ← Section: Values
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🔴 ALT (Alanine          │    │  ← Abnormal card (red left
│  │    Aminotransferase)     │    │     border, light red bg)
│  │                          │    │
│  │  Your value: 78 U/L      │    │  ← Original value (mono)
│  │  Normal range: 7–56 U/L  │    │  ← Reference (mono, muted)
│  │                          │    │
│  │  This enzyme lives in     │    │  ← Plain English (body)
│  │  your liver. When the    │    │
│  │  level is higher than    │    │
│  │  normal, it can mean     │    │
│  │  your liver is working   │    │
│  │  harder than usual.      │    │
│  │                          │    │
│  │  💡 Think of it like a   │    │  ← Analogy (italic, blue bg)
│  │  "check engine" light    │    │
│  │  for your liver.         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🟡 HDL Cholesterol       │    │  ← Borderline card (amber)
│  │    ...                   │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🟢 Hemoglobin            │    │  ← Normal card (green,
│  │    ...                   │    │     collapsed by default,
│  │    [tap to expand]       │    │     expandable)
│  └─────────────────────────┘    │
│                                 │
│  ─── Questions for Your ────    │  ← Section: Doctor Questions
│      Doctor                     │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 1. "My ALT level is      │    │  ← Question card
│  │     above normal — could │    │
│  │     this be related to   │    │
│  │     any medication I'm   │    │
│  │     currently taking?"   │    │
│  │                          │    │
│  │  Why ask: Certain meds   │    │  ← Context (muted, smaller)
│  │  like statins can raise  │    │
│  │  ALT temporarily.        │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 2. ...                   │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ⚠️ This is not medical advice. │  ← Disclaimer (always visible)
│  Please consult your healthcare │
│  provider for interpretation.   │
│                                 │
├─────────────────────────────────┤
│  [📥 Export PDF]    [💾 Save]    │  ← Action bar (sticky bottom)
└─────────────────────────────────┘
```

### 7.3 Key UI States

**State 1 — Empty / Welcome**
```
┌─────────────────────────────────┐
│  🔬 LabLens          [History 📋]│
├─────────────────────────────────┤
│                                 │
│         [illustration]          │
│                                 │
│    Open a lab result PDF in     │
│    your browser, then click     │
│    "Analyse" to get started.    │
│                                 │
│       [ 🔍 Analyse This Page ]  │
│                                 │
│    Works with PDFs from:        │
│    • Hospital patient portals   │
│    • Emailed lab reports        │
│    • Downloaded PDF files       │
│                                 │
└─────────────────────────────────┘
```

**State 2 — Loading / Processing**
```
┌─────────────────────────────────┐
│  🔬 LabLens          [History 📋]│
├─────────────────────────────────┤
│                                 │
│    ┌───────────────────────┐    │
│    │ ████████░░░░░░  60%   │    │  ← Progress bar
│    └───────────────────────┘    │
│                                 │
│    📄 Reading your lab report...│  ← Step 1
│    ✅ Text extracted             │
│    🔄 Translating to plain      │  ← Step 2 (active)
│       English...                │
│    ○ Generating questions       │  ← Step 3 (pending)
│                                 │
│    This usually takes about     │
│    10–15 seconds.               │
│                                 │
└─────────────────────────────────┘
```

**State 3 — Error**
```
┌─────────────────────────────────┐
│  🔬 LabLens          [History 📋]│
├─────────────────────────────────┤
│                                 │
│    ⚠️ Couldn't read this PDF     │
│                                 │
│    This might happen if:        │
│    • The PDF is image-only      │
│    • The page isn't a lab report│
│    • The file is password-      │
│      protected                  │
│                                 │
│    [ Try Again ] [ Report Issue]│
│                                 │
└─────────────────────────────────┘
```

**State 4 — History View**
```
┌─────────────────────────────────┐
│  ← Back            Your History │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📋 Complete Blood Count  │    │
│  │    31 May 2026           │    │
│  │    2 flagged values      │    │
│  │              [View] [📥] │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📋 Lipid Panel           │    │
│  │    15 May 2026           │    │
│  │    1 flagged value       │    │
│  │              [View] [📥] │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📋 Liver Function Test   │    │
│  │    2 Apr 2026            │    │
│  │    0 flagged values      │    │
│  │              [View] [📥] │    │
│  └─────────────────────────┘    │
│                                 │
│     [ 🗑️ Clear All History ]    │
│                                 │
└─────────────────────────────────┘
```

### 7.4 Interaction Details

| Interaction | Behaviour |
|---|---|
| Click extension icon | Opens Side Panel + shows Welcome state if no PDF detected, or auto-triggers analysis if PDF is in active tab |
| "Analyse This Page" button | Triggers content script → extracts PDF → sends to background worker |
| Lab value cards (normal) | Collapsed by default, show only name + status dot. Tap to expand. |
| Lab value cards (abnormal/borderline) | Expanded by default, full explanation visible |
| "Export PDF" button | Generates a clean PDF via jsPDF: summary → flagged values → questions → disclaimer. Auto-names: `LabLens_Summary_YYYY-MM-DD.pdf` |
| "Save" button | Saves current analysis to chrome.storage.local with timestamp. Shows toast: "Saved to history ✓" |
| History → View | Loads saved analysis back into the summary view |
| History → Export | Re-generates the PDF from saved data |

## 8. Exported PDF Layout

```
┌────────────────────────────────────────────┐
│                                            │
│  🔬 LabLens Summary                        │
│  Generated: 31 May 2026                   │
│                                            │
│  ──────────────────────────────────────    │
│                                            │
│  OVERVIEW                                  │
│  Your complete blood count looks mostly    │
│  normal, with two values worth             │
│  discussing with your doctor...            │
│                                            │
│  ──────────────────────────────────────    │
│                                            │
│  FLAGGED VALUES                            │
│                                            │
│  🔴 ALT — 78 U/L (normal: 7–56 U/L)       │
│  This enzyme lives in your liver...        │
│                                            │
│  🟡 HDL — 38 mg/dL (normal: >40 mg/dL)    │
│  HDL is the "good cholesterol" that...     │
│                                            │
│  ──────────────────────────────────────    │
│                                            │
│  QUESTIONS FOR YOUR DOCTOR                 │
│                                            │
│  □ My ALT level is above normal — could    │
│    this be related to medication?           │
│                                            │
│  □ My HDL is slightly low — what           │
│    lifestyle changes would help?            │
│                                            │
│  □ Should I schedule a follow-up test?     │
│                                            │
│  ──────────────────────────────────────    │
│                                            │
│  ⚠️ This is not medical advice. Consult    │
│  your healthcare provider.                 │
│                                            │
│  Powered by LabLens | lablens.app          │
│                                            │
└────────────────────────────────────────────┘
```

The checkboxes (□) are intentional — they're empty so the patient can physically tick them off during their appointment.

## 9. File Structure for Cursor

```
lablens/
├── manifest.json              # Manifest V3 config
├── package.json
├── tailwind.config.js
├── vite.config.ts             # Vite for building React side panel
│
├── src/
│   ├── background/
│   │   └── service-worker.ts  # Handles Textract + Bedrock API calls
│   │
│   ├── content/
│   │   └── content-script.ts  # Detects PDF in tab, extracts blob
│   │
│   ├── sidepanel/
│   │   ├── index.html         # Side panel entry point
│   │   ├── App.tsx            # Main side panel app
│   │   ├── components/
│   │   │   ├── WelcomeView.tsx
│   │   │   ├── LoadingView.tsx
│   │   │   ├── ErrorView.tsx
│   │   │   ├── SummaryView.tsx    # Main results view
│   │   │   ├── LabValueCard.tsx   # Individual lab value card
│   │   │   ├── QuestionCard.tsx   # Doctor question card
│   │   │   ├── HistoryView.tsx    # Saved analyses list
│   │   │   ├── HistoryItem.tsx
│   │   │   ├── Disclaimer.tsx
│   │   │   └── ActionBar.tsx      # Export + Save buttons
│   │   ├── hooks/
│   │   │   ├── useAnalysis.ts     # Main analysis orchestration
│   │   │   ├── useHistory.ts      # chrome.storage.local CRUD
│   │   │   └── useExportPDF.ts    # jsPDF generation
│   │   ├── utils/
│   │   │   ├── aws-textract.ts    # Textract API wrapper
│   │   │   ├── aws-bedrock.ts     # Bedrock Claude API wrapper
│   │   │   ├── pdf-extractor.ts   # PDF blob → base64 conversion
│   │   │   └── types.ts          # TypeScript interfaces
│   │   └── styles/
│   │       └── globals.css        # Tailwind + custom CSS vars
│   │
│   └── popup/
│       ├── index.html             # Minimal popup (fallback)
│       └── Popup.tsx              # "Open Side Panel" redirect
│
├── public/
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── lablens-logo.svg
│
└── .env.local                     # AWS credentials (never commit)
    # AWS_REGION=ap-southeast-1
    # AWS_ACCESS_KEY_ID=xxx
    # AWS_SECRET_ACCESS_KEY=xxx
```

## 10. Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "LabLens",
  "version": "1.0.0",
  "description": "Understand your lab results in plain English",
  "permissions": [
    "sidePanel",
    "activeTab",
    "storage",
    "tabs"
  ],
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/content-script.ts"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "public/icons/icon-16.png",
      "32": "public/icons/icon-32.png",
      "48": "public/icons/icon-48.png",
      "128": "public/icons/icon-128.png"
    }
  },
  "icons": {
    "16": "public/icons/icon-16.png",
    "48": "public/icons/icon-48.png",
    "128": "public/icons/icon-128.png"
  }
}
```

## 11. API Flow — Sequence of Operations

```
USER clicks "Analyse" in side panel
        │
        ▼
CONTENT SCRIPT detects PDF in active tab
        │
        ├─► If PDF detected: extract as blob → convert to base64
        │
        ├─► If NOT a PDF: send error message to side panel
        │
        ▼
BACKGROUND SERVICE WORKER receives base64 PDF
        │
        ▼
AWS TEXTRACT (AnalyzeDocument API)
        │
        ├─► Input: base64-encoded PDF
        ├─► Output: extracted text blocks with confidence scores
        │
        ▼
BACKGROUND processes extracted text
        │
        ├─► Clean + concatenate text blocks
        ├─► Basic validation: does this look like a lab report?
        │   (check for keywords: "reference range", "result",
        │    common lab test names)
        │
        ▼
AWS BEDROCK (Claude Sonnet via InvokeModel API)
        │
        ├─► Input: system prompt (Section 6) + extracted text
        ├─► Output: structured JSON response
        │
        ▼
BACKGROUND validates JSON structure
        │
        ├─► Parse and validate against expected schema
        ├─► Sort values: abnormal first, then borderline, then normal
        │
        ▼
SIDE PANEL receives structured data
        │
        ├─► Renders SummaryView with all components
        ├─► Updates state from Loading → Results
        │
        ▼
USER sees translated results alongside original PDF
```

## 12. Competitive Differentiation

| Feature | RosettaMD | Medsplain | MedTranslate Pro | **LabLens** |
|---|---|---|---|---|
| Works on PDFs in browser | ❌ Web pages only | ❌ Paste text | ❌ Web pages only | ✅ Yes |
| Side panel (see PDF + results) | ❌ | ❌ | ❌ | ✅ Yes |
| Doctor questions generated | ❌ | ❌ | ❌ | ✅ Yes |
| Exportable summary PDF | ❌ | ❌ | ❌ | ✅ Yes |
| Saves history locally | ❌ | ❌ | ✅ Flashcards | ✅ Yes |
| Analogies for clarity | ❌ | ❌ | ❌ | ✅ Yes |
| No account needed | ✅ | ❌ Requires signup | ✅ | ✅ |
| Works on hospital portals | ✅ | ❌ | ✅ | ✅ |

**Our edge:** LabLens is the only tool that (1) works directly on PDFs you're already viewing, (2) generates actionable doctor questions, and (3) produces a take-to-appointment export.

## 13. Hackathon Demo Script (5 minutes)

```
[0:00–0:45]  STORY HOOK
"Last month, my mom got her lab results emailed as a PDF. She called me
panicking because she saw 'elevated ALT' and Googled it — Google told
her she might have liver disease. She couldn't see her doctor for two
weeks. All she needed was someone to explain: this is a liver enzyme,
it's slightly above normal, and here's what to ask your doctor."

[0:45–1:30]  THE PROBLEM
"In Singapore, 78% of patients access their lab results digitally, but
most can't interpret them. Existing tools require copy-pasting text into
separate apps. Nobody has built something that works right where you're
already reading your results."

[1:30–3:30]  LIVE DEMO
- Open a sample lab report PDF in Chrome
- Click LabLens icon → side panel opens
- Show the analysis loading (3 steps)
- Walk through: summary → flagged values → analogies
- Scroll to doctor questions
- Click Export PDF → show the downloadable file
- Click Save → show history

[3:30–4:15]  TECH + DIFFERENTIATOR
"Built on AWS — Textract for PDF extraction, Bedrock Claude for
translation. Chrome Side Panel API means you see your original report
and the translation side by side. Unlike RosettaMD or Medsplain,
LabLens works on PDFs, generates doctor questions, and gives you an
exportable summary for your next appointment."

[4:15–5:00]  IMPACT + ASK
"We want to make health literacy effortless. The chrome extension format
means zero friction — no app download, no signup. We see this expanding
to radiology reports, discharge summaries, and prescription leaflets.
Thank you."
```

## 14. Risk Mitigation

| Risk | Mitigation |
|---|---|
| PDF extraction fails on scanned/image PDFs | AWS Textract handles OCR natively; add error state with clear messaging |
| Bedrock response is slow (>10s) | Show stepped progress indicator; pre-write loading copy to manage expectation |
| AI hallucinates lab values | Always show original values from Textract alongside AI explanation; user can cross-reference |
| Medical disclaimer liability | Prominent, always-visible disclaimer. Never use words like "diagnosis", "you should", "treatment" |
| Demo day: live API fails | Pre-record a backup demo video the night before. Keep one cached response in chrome.storage for offline fallback |
| PDPA / privacy concerns | All processing via API (no data stored server-side). Local history uses chrome.storage.local only. Add "your data never leaves your browser" messaging |

## 15. Role Split — Yeo Shi + Rose

| Time Block | Yeo Shi (PM + Prompt + Frontend) | Rose (Backend + Infra + QA) |
|---|---|---|
| Hr 0–2 | Lock the idea, start PRD with Claude | Set up repo, install deps, verify AWS access |
| Hr 2–4 | Finalise PRD, design v0 mockup | Scaffold Chrome extension structure (Manifest V3 + Vite + React) |
| Hr 4–6 | Build side panel UI components (WelcomeView, SummaryView shells) | Build content script (PDF detection + blob extraction) |
| Hr 6–10 | Build LabValueCard, QuestionCard, LoadingView, ErrorView | Build service worker: Textract integration → Bedrock integration |
| Hr 10–14 | Connect frontend to backend (useAnalysis hook), style all components | End-to-end pipeline working: PDF → Textract → Bedrock → JSON response |
| Hr 14–18 | Build HistoryView + useHistory hook | Build Export PDF (jsPDF) + test on multiple lab report PDFs |
| Hr 18–22 | Polish UI, responsive, loading animations, micro-interactions | Bug fixes, edge cases, error handling, test on hospital portal PDFs |
| Hr 22–26 | Build pitch deck (5 slides), record backup demo video | Final QA pass, prepare demo environment, cached fallback response |
| Hr 26–28 | Practice pitch 3x | Confirm everything works, backup video ready |

## 16. Sample Lab Report (for testing)

Use this mock data to test the pipeline without needing real patient data:

```
COMPLETE BLOOD COUNT (CBC) REPORT
Patient: [REDACTED]
Date: 31 May 2026
Lab: Singapore General Hospital

Test                  Result    Unit        Reference Range    Status
───────────────────────────────────────────────────────────────────────
Hemoglobin            14.2      g/dL        13.0 – 17.0        Normal
White Blood Cell      11.8      x10^9/L     4.0 – 10.0         HIGH
Red Blood Cell        4.85      x10^12/L    4.50 – 5.50        Normal
Platelet Count        245       x10^9/L     150 – 400          Normal
Hematocrit            42.1      %           38.0 – 50.0        Normal
MCV                   86.8      fL          80.0 – 100.0       Normal
MCH                   29.3      pg          27.0 – 33.0        Normal
MCHC                  33.7      g/dL        32.0 – 36.0        Normal

LIVER FUNCTION TEST
ALT (SGPT)            78        U/L         7 – 56             HIGH
AST (SGOT)            45        U/L         10 – 40            HIGH
ALP                   82        U/L         44 – 147           Normal
Total Bilirubin       0.9       mg/dL       0.1 – 1.2          Normal
Albumin               4.2       g/dL        3.5 – 5.0          Normal

LIPID PANEL
Total Cholesterol     218       mg/dL       < 200              HIGH
HDL Cholesterol       38        mg/dL       > 40               LOW
LDL Cholesterol       148       mg/dL       < 100              HIGH
Triglycerides         160       mg/dL       < 150              HIGH

Notes: Patient fasting. Recommend follow-up in 4 weeks.
```

---

*PRD v1.0 — LabLens for SuperAI NEXT Hackathon 2026*
*Last updated: 31 May 2026*
