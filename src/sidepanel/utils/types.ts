export type LabValueStatus = 'normal' | 'borderline' | 'abnormal';

export type AnalysisUrgency = 'action_needed' | 'worth_monitoring' | 'all_clear';

export interface GroupLabValue {
  name: string;
  fullName?: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: LabValueStatus;
}

export interface BodySystemGroup {
  system: string;
  icon: string;
  status: LabValueStatus;
  topline: string;
  analogy?: string;
  values: GroupLabValue[];
}

export interface DoctorQuestion {
  question: string;
  context: string;
}

export interface AnalysisResult {
  summary: string;
  urgency: AnalysisUrgency;
  groups: BodySystemGroup[];
  questions: DoctorQuestion[];
  disclaimer: string;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceFilename?: string;
  analyzedAt?: string;
}

/** @deprecated Legacy flat value — used only when normalizing old API responses */
export interface LegacyLabValue {
  name: string;
  originalValue: string;
  referenceRange: string;
  status: LabValueStatus;
  explanation?: string;
  analogy?: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  date: string;
  sourceUrl?: string;
  sourceDomain?: string;
  sourceFilename?: string;
  urgency: AnalysisUrgency;
  flaggedCount: number;
  borderlineCount: number;
  normalCount: number;
  analysisData: AnalysisResult;
}

export type ProcessingStep = 'extracting' | 'translating' | 'questions' | 'done';

export interface ProcessingState {
  step: ProcessingStep;
  progress: number;
  message: string;
}

export type MessageType =
  | { type: 'ANALYZE_PDF' }
  | { type: 'ANALYZE_TEXT'; payload: { text: string; url: string; title: string } }
  | { type: 'EXTRACT_PDF_IN_SIDEPANEL'; payload: { base64: string; url: string; title: string } }
  | { type: 'ANALYSIS_PROGRESS'; payload: ProcessingState }
  | { type: 'ANALYSIS_COMPLETE'; payload: AnalysisResult }
  | { type: 'ANALYSIS_ERROR'; payload: { message: string } }
  | { type: 'EXTRACT_PDF' }
  | { type: 'PDF_EXTRACTED'; payload: { base64: string; url: string; title: string } }
  | { type: 'PDF_NOT_FOUND'; payload: { message: string } }
  | { type: 'GET_DEMO_RESULT' };

export {};
export default {};
