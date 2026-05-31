import type { AnalysisResult } from './types';

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function isPdfUrl(url: string): boolean {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return false;
  }
  const lower = url.toLowerCase();
  return lower.endsWith('.pdf') || lower.includes('.pdf?') || lower.includes('.pdf#');
}

export function looksLikeLabReport(text: string): boolean {
  const lower = text.toLowerCase();
  const keywords = [
    'reference range',
    'reference',
    'result',
    'hemoglobin',
    'cholesterol',
    'glucose',
    'lab',
    'specimen',
    'blood',
    'mg/dl',
    'g/dl',
    'u/l',
    'mmol/l',
  ];
  const matches = keywords.filter((k) => lower.includes(k));
  return matches.length >= 2;
}

export function sortLabValues<T extends { status: string }>(values: T[]): T[] {
  const order: Record<string, number> = { abnormal: 0, borderline: 1, normal: 2 };
  return [...values].sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getReportTitle(result: AnalysisResult): string {
  const flagged = result.values.filter((v) => v.status !== 'normal');
  if (flagged.length > 0) {
    return flagged[0].name.split('(')[0].trim() + ' Panel';
  }
  return 'Lab Report Analysis';
}
