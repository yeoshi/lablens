export type LabValueStatus = 'normal' | 'borderline' | 'abnormal';

export interface LabValue {
  name: string;
  originalValue: string;
  referenceRange: string;
  status: LabValueStatus;
  explanation: string;
  analogy?: string;
}

export interface DoctorQuestion {
  question: string;
  context: string;
}

export interface AnalysisResult {
  summary: string;
  values: LabValue[];
  questions: DoctorQuestion[];
  disclaimer: string;
  sourceUrl?: string;
  sourceTitle?: string;
  analyzedAt?: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  analyzedAt: string;
  flaggedCount: number;
  result: AnalysisResult;
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
