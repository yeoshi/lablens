import type { ReactNode } from 'react';

const BODY_SYSTEMS = [
  'complete blood count',
  'blood count',
  'blood sugar',
  'blood pressure',
  'liver function',
  'liver',
  'kidney function',
  'kidney',
  'cholesterol',
  'lipid panel',
  'lipid',
  'thyroid',
  'heart',
  'metabolic panel',
  'metabolic',
  'iron',
  'glucose',
  'hormone',
  'vitamin d',
  'vitamin b12',
  'vitamin',
  'cbc',
  'white blood cell',
  'red blood cell',
  'platelet',
  'hemoglobin',
  'triglycerides',
  'hdl',
  'ldl',
];

const STATUS_WORDS = [
  'outside the normal range',
  'within the normal range',
  'within range',
  'borderline',
  'abnormal',
  'elevated',
  'slightly elevated',
  'slightly low',
  'normal',
  'high',
  'low',
  'mostly normal',
  'worth discussing',
  'worth monitoring',
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildHighlightPattern(terms: string[]): RegExp {
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  return new RegExp(`\\b(${sorted.map(escapeRegex).join('|')})\\b`, 'gi');
}

const HIGHLIGHT_PATTERN = buildHighlightPattern([...BODY_SYSTEMS, ...STATUS_WORDS]);

interface TextSegment {
  text: string;
  bold: boolean;
}

function splitMarkdownBold(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }

  if (segments.length === 0) {
    segments.push({ text, bold: false });
  }

  return segments;
}

function formatKeywordHighlights(text: string, keyPrefix: string): ReactNode[] {
  if (!text) return [];

  const nodes: ReactNode[] = [];
  const pattern = new RegExp(HIGHLIGHT_PATTERN.source, 'gi');
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`${keyPrefix}-${key++}`}>{text.slice(lastIndex, match.index)}</span>
      );
    }
    nodes.push(
      <strong key={`${keyPrefix}-${key++}`} className="strong-keyword">
        {match[0]}
      </strong>
    );
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`${keyPrefix}-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return nodes.length > 0 ? nodes : [<span key={`${keyPrefix}-0`}>{text}</span>];
}

/** Parses **markdown bold** and highlights medical keywords */
export function formatRichText(text: string): ReactNode[] {
  const segments = splitMarkdownBold(text);
  const nodes: ReactNode[] = [];
  let key = 0;

  for (const segment of segments) {
    if (segment.bold) {
      nodes.push(
        <strong key={key++} className="strong-keyword">
          {segment.text}
        </strong>
      );
    } else {
      nodes.push(...formatKeywordHighlights(segment.text, String(key++)));
    }
  }

  return nodes.length > 0 ? nodes : [<span key={0}>{text}</span>];
}

/** @deprecated Use formatRichText */
export function formatSummaryText(summary: string): ReactNode[] {
  return formatRichText(summary);
}
