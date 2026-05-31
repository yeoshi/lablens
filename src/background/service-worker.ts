import type { AnalysisResult, MessageType, ProcessingState } from '../sidepanel/utils/types';
import { analyzeWithBedrock } from '../sidepanel/utils/aws-bedrock';
import { looksLikeLabReport } from '../sidepanel/utils/helpers';
import { extractTextWithTextract } from './textract';

function sendProgress(state: ProcessingState) {
  chrome.runtime.sendMessage({
    type: 'ANALYSIS_PROGRESS',
    payload: state,
  } satisfies MessageType);
}

async function runAnalysis(
  extractedText: string,
  url: string,
  title: string
): Promise<AnalysisResult> {
  sendProgress({ step: 'extracting', progress: 40, message: 'Text extracted' });

  if (!extractedText.trim() || extractedText.length < 30) {
    throw new Error(
      'Could not extract text from this PDF. It may be image-only or password-protected.'
    );
  }

  if (!looksLikeLabReport(extractedText)) {
    throw new Error(
      'This does not appear to be a lab report. Please open a lab result PDF and try again.'
    );
  }

  sendProgress({
    step: 'translating',
    progress: 60,
    message: 'Translating to plain English...',
  });

  const result = await analyzeWithBedrock(extractedText);

  sendProgress({
    step: 'questions',
    progress: 85,
    message: 'Generating questions...',
  });

  await new Promise((r) => setTimeout(r, 400));

  sendProgress({ step: 'done', progress: 100, message: 'Complete' });

  return {
    ...result,
    sourceUrl: url,
    sourceTitle: title,
    analyzedAt: new Date().toISOString(),
  };
}

function isPdfTabUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.pdf') || lower.includes('.pdf?') || lower.includes('.pdf#');
}

async function tryContentScript(tabId: number): Promise<MessageType | null> {
  try {
    return await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_PDF' });
  } catch {
    return null;
  }
}

async function tryScriptingInjection(
  tabId: number,
  tab: chrome.tabs.Tab
): Promise<MessageType | null> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: 'MAIN',
      func: async () => {
        const url = window.location.href;
        if (!url.toLowerCase().includes('.pdf') && document.contentType !== 'application/pdf') {
          return null;
        }
        try {
          const response = await fetch(url, { credentials: 'include' });
          if (!response.ok) return null;
          const buffer = await response.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          const chunk = 8192;
          for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
          }
          return { base64: btoa(binary), url, title: document.title || 'Lab Report' };
        } catch {
          return null;
        }
      },
    });

    for (const result of results) {
      const data = result.result as { base64: string; url: string; title: string } | null;
      if (data?.base64) {
        return { type: 'PDF_EXTRACTED', payload: data };
      }
    }
  } catch {
    // Injection blocked on this page
  }

  if (tab.url?.startsWith('file://') && isPdfTabUrl(tab.url)) {
    return {
      type: 'PDF_NOT_FOUND',
      payload: {
        message:
          'Chrome blocks reading local PDF files from the page. Use "Upload PDF" instead.',
      },
    };
  }

  return null;
}

async function fetchPdfFromTab(tab: chrome.tabs.Tab): Promise<MessageType | null> {
  const url = tab.url;
  if (!url || !isPdfTabUrl(url)) {
    return {
      type: 'PDF_NOT_FOUND',
      payload: { message: 'No PDF detected on this page. Open a lab result PDF first.' },
    };
  }

  if (url.startsWith('file://')) {
    return {
      type: 'PDF_NOT_FOUND',
      payload: {
        message:
          'Local PDF files cannot be read directly. Use "Upload PDF" in the side panel instead.',
      },
    };
  }

  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    return {
      type: 'PDF_EXTRACTED',
      payload: { base64, url, title: tab.title || 'Lab Report' },
    };
  } catch {
    return {
      type: 'PDF_NOT_FOUND',
      payload: {
        message:
          'Could not download the PDF from this page. Try uploading the file directly with "Upload PDF".',
      },
    };
  }
}

async function extractPdfFromTab(tab: chrome.tabs.Tab): Promise<MessageType> {
  if (!tab.id) {
    return { type: 'PDF_NOT_FOUND', payload: { message: 'No active tab found.' } };
  }

  let response = await tryContentScript(tab.id);

  if (!response || response.type === 'PDF_NOT_FOUND') {
    const injected = await tryScriptingInjection(tab.id, tab);
    if (injected) response = injected;
  }

  if (!response || response.type === 'PDF_NOT_FOUND') {
    const fetched = await fetchPdfFromTab(tab);
    if (fetched) response = fetched;
  }

  return (
    response ?? {
      type: 'PDF_NOT_FOUND',
      payload: {
        message:
          'Could not read this PDF. Use "Upload PDF" to select the file from your computer.',
      },
    }
  );
}

async function processPdfBytes(
  base64: string,
  url: string,
  title: string
): Promise<void> {
  sendProgress({ step: 'extracting', progress: 20, message: 'Reading your lab report...' });

  const textractText = await extractTextWithTextract(base64);
  if (textractText) {
    const result = await runAnalysis(textractText, url, title);
    chrome.runtime.sendMessage({
      type: 'ANALYSIS_COMPLETE',
      payload: result,
    } satisfies MessageType);
    return;
  }

  // pdf.js cannot run in service workers — delegate extraction to side panel
  chrome.runtime.sendMessage({
    type: 'EXTRACT_PDF_IN_SIDEPANEL',
    payload: { base64, url, title },
  } satisfies MessageType);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((message: MessageType, _sender, sendResponse) => {
  if (message.type === 'ANALYZE_PDF') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
          chrome.runtime.sendMessage({
            type: 'ANALYSIS_ERROR',
            payload: { message: 'No active tab found.' },
          } satisfies MessageType);
          return;
        }

        const response = await extractPdfFromTab(tab);

        if (response.type === 'PDF_NOT_FOUND') {
          chrome.runtime.sendMessage({
            type: 'ANALYSIS_ERROR',
            payload: { message: response.payload.message },
          } satisfies MessageType);
          return;
        }

        if (response.type === 'PDF_EXTRACTED') {
          await processPdfBytes(
            response.payload.base64,
            response.payload.url,
            response.payload.title
          );
        }
      } catch (err) {
        chrome.runtime.sendMessage({
          type: 'ANALYSIS_ERROR',
          payload: {
            message: err instanceof Error ? err.message : 'Analysis failed. Please try again.',
          },
        } satisfies MessageType);
      }
    })();
    return true;
  }

  if (message.type === 'ANALYZE_TEXT') {
    (async () => {
      try {
        const { text, url, title } = message.payload;
        const result = await runAnalysis(text, url, title);
        chrome.runtime.sendMessage({
          type: 'ANALYSIS_COMPLETE',
          payload: result,
        } satisfies MessageType);
      } catch (err) {
        chrome.runtime.sendMessage({
          type: 'ANALYSIS_ERROR',
          payload: {
            message: err instanceof Error ? err.message : 'Analysis failed. Please try again.',
          },
        } satisfies MessageType);
      }
    })();
    return true;
  }

  if (message.type === 'GET_DEMO_RESULT') {
    analyzeWithBedrock('').then((result) => {
      sendResponse({
        type: 'ANALYSIS_COMPLETE',
        payload: { ...result, analyzedAt: new Date().toISOString() },
      });
    });
    return true;
  }

  return false;
});

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export {};
