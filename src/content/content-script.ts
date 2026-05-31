import type { MessageType } from '../sidepanel/utils/types';
import { blobToBase64, isPdfUrl } from '../sidepanel/utils/helpers';

function isPdfPage(): boolean {
  if (isPdfUrl(window.location.href)) return true;
  if (document.contentType === 'application/pdf') return true;
  const embed = document.querySelector('embed[type="application/pdf"]');
  return !!embed;
}

async function extractPdfBlob(): Promise<{ base64: string; url: string; title: string } | null> {
  const url = window.location.href;

  if (!isPdfPage()) return null;

  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch PDF');

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('pdf') && !isPdfUrl(url)) {
      const blob = await response.blob();
      if (blob.type && !blob.type.includes('pdf')) return null;
    }

    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    return { base64, url, title: document.title || 'Lab Report' };
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((message: MessageType, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_PDF') {
    extractPdfBlob().then((result) => {
      if (result) {
        sendResponse({
          type: 'PDF_EXTRACTED',
          payload: result,
        } satisfies MessageType);
      } else {
        sendResponse({
          type: 'PDF_NOT_FOUND',
          payload: {
            message: 'No PDF detected on this page. Open a lab result PDF first.',
          },
        } satisfies MessageType);
      }
    });
    return true;
  }
  return false;
});

export {};
