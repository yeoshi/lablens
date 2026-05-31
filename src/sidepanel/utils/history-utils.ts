import type { AnalysisResult, HistoryEntry } from './types';
import { countValueStatuses } from './normalize-analysis';

const PANEL_NAMES: Record<string, string> = {
  'Liver Health': 'Liver Function',
  'Blood Count': 'Complete Blood Count',
  'Cholesterol & Heart': 'Lipid Panel',
  'Kidney Function': 'Kidney Function',
  'Blood Sugar': 'Blood Sugar',
  Thyroid: 'Thyroid Panel',
  'Other Results': 'Other Results',
};

export function extractReportTitle(result: AnalysisResult): string {
  if (result.sourceTitle && !result.sourceTitle.endsWith('.pdf')) {
    return result.sourceTitle;
  }

  if (result.groups.length === 0) return 'Lab Report Analysis';

  const panelNames = result.groups.map((g) => PANEL_NAMES[g.system] || g.system);

  if (panelNames.length === 1) return panelNames[0];

  return panelNames.join(' + ');
}

export function extractSourceDomain(url?: string): string | undefined {
  if (!url || url.startsWith('file://') || url.startsWith('chrome://')) {
    return undefined;
  }

  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export function extractSourceFilename(sourceUrl?: string, sourceTitle?: string): string | undefined {
  if (sourceUrl) {
    const decoded = decodeURIComponent(sourceUrl);
    const segment = decoded.split('/').pop()?.split('?')[0]?.split('#')[0];
    if (segment && segment !== '' && segment !== 'Lab Report') {
      return segment;
    }
  }

  if (sourceTitle && sourceTitle.trim()) {
    const title = sourceTitle.trim();
    if (title.endsWith('.pdf') || !title.includes(' ')) {
      return title;
    }
  }

  return undefined;
}

export function getSourceDisplayLabel(entry: HistoryEntry): string {
  if (entry.sourceDomain) {
    return `from ${entry.sourceDomain}`;
  }

  const filename = entry.sourceFilename ?? extractSourceFilename(entry.sourceUrl);
  if (filename) {
    return filename;
  }

  return 'Local file';
}

export function canOpenSourceUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getAnalysisFromEntry(entry: HistoryEntry): AnalysisResult {
  return entry.analysisData;
}

export function migrateHistoryEntry(
  raw: Partial<HistoryEntry> & { result?: AnalysisResult; analyzedAt?: string }
): HistoryEntry {
  const analysisData = raw.analysisData ?? raw.result;
  if (!analysisData) {
    throw new Error('Invalid history entry: missing analysis data');
  }

  const date = raw.date ?? raw.analyzedAt ?? analysisData.analyzedAt ?? new Date().toISOString();
  const sourceUrl = raw.sourceUrl ?? analysisData.sourceUrl;
  const sourceFilename =
    raw.sourceFilename ??
    analysisData.sourceFilename ??
    extractSourceFilename(sourceUrl, analysisData.sourceTitle);
  const counts = countValueStatuses(analysisData);

  return {
    id: raw.id ?? crypto.randomUUID(),
    title: raw.title ?? extractReportTitle(analysisData),
    date,
    sourceUrl,
    sourceDomain: raw.sourceDomain ?? extractSourceDomain(sourceUrl),
    sourceFilename,
    urgency: raw.urgency ?? analysisData.urgency,
    flaggedCount: raw.flaggedCount ?? counts.abnormalCount,
    borderlineCount: raw.borderlineCount ?? counts.borderlineCount,
    normalCount: raw.normalCount ?? counts.normalCount,
    analysisData: {
      ...analysisData,
      sourceUrl,
      sourceFilename,
      analyzedAt: date,
    },
  };
}

export function analysisContentHash(data: AnalysisResult): string {
  const { analyzedAt: _a, sourceUrl: _u, ...content } = data;
  return JSON.stringify(content);
}

export function buildHistoryEntry(result: AnalysisResult): HistoryEntry {
  const date = result.analyzedAt ?? new Date().toISOString();
  const sourceUrl = result.sourceUrl;
  const sourceFilename =
    result.sourceFilename ?? extractSourceFilename(sourceUrl, result.sourceTitle);
  const counts = countValueStatuses(result);

  return {
    id: crypto.randomUUID(),
    title: extractReportTitle(result),
    date,
    sourceUrl,
    sourceDomain: extractSourceDomain(sourceUrl),
    sourceFilename,
    urgency: result.urgency,
    flaggedCount: counts.abnormalCount,
    borderlineCount: counts.borderlineCount,
    normalCount: counts.normalCount,
    analysisData: {
      ...result,
      sourceUrl,
      sourceFilename,
      analyzedAt: date,
    },
  };
}
