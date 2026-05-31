import { useState, useEffect, useCallback } from 'react';
import type { AnalysisResult, ProcessingState, MessageType } from '../utils/types';
import { extractTextFromPdfBase64, extractTextFromPdfFile } from '../utils/pdf-extractor';

type AppView = 'welcome' | 'loading' | 'results' | 'error' | 'history';

function debugLog(message: string, data?: unknown) {
  if (!__DEBUG_LOGS__) return;
  if (data !== undefined) {
    console.log(`[LabLens][SidePanel] ${message}`, data);
    return;
  }
  console.log(`[LabLens][SidePanel] ${message}`);
}

export function useAnalysis() {
  const [view, setView] = useState<AppView>('welcome');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    step: 'extracting',
    progress: 0,
    message: 'Starting...',
  });

  const sendTextForAnalysis = useCallback((text: string, url: string, title: string) => {
    debugLog('Sending ANALYZE_TEXT', { url, title, textLength: text.length });
    chrome.runtime.sendMessage({
      type: 'ANALYZE_TEXT',
      payload: { text, url, title },
    } satisfies MessageType);
  }, []);

  useEffect(() => {
    const listener = (message: MessageType) => {
      debugLog('Received runtime message', { type: message.type });
      if (message.type === 'ANALYSIS_PROGRESS') {
        setProcessing(message.payload);
        setView('loading');
      }
      if (message.type === 'ANALYSIS_COMPLETE') {
        setResult(message.payload);
        setView('results');
        setError(null);
      }
      if (message.type === 'ANALYSIS_ERROR') {
        setError(message.payload.message);
        setView('error');
      }
      if (message.type === 'EXTRACT_PDF_IN_SIDEPANEL') {
        (async () => {
          try {
            debugLog('Received EXTRACT_PDF_IN_SIDEPANEL; extracting with pdf.js');
            setProcessing({
              step: 'extracting',
              progress: 30,
              message: 'Extracting text from PDF...',
            });
            const text = await extractTextFromPdfBase64(message.payload.base64);
            sendTextForAnalysis(text, message.payload.url, message.payload.title);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Failed to extract text from PDF.'
            );
            setView('error');
          }
        })();
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [sendTextForAnalysis]);

  const analyze = useCallback(() => {
    debugLog('Sending ANALYZE_PDF');
    setView('loading');
    setError(null);
    setProcessing({ step: 'extracting', progress: 10, message: 'Reading your lab report...' });
    chrome.runtime.sendMessage({ type: 'ANALYZE_PDF' } satisfies MessageType);
  }, []);

  const analyzeFile = useCallback(
    async (file: File) => {
      debugLog('analyzeFile called', { name: file.name, size: file.size, type: file.type });
      setView('loading');
      setError(null);
      setProcessing({ step: 'extracting', progress: 20, message: 'Reading your lab report...' });
      try {
        const text = await extractTextFromPdfFile(file);
        sendTextForAnalysis(text, `file://${file.name}`, file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read PDF file.');
        setView('error');
      }
    },
    [sendTextForAnalysis]
  );

  const reset = useCallback(() => {
    setView('welcome');
    setResult(null);
    setError(null);
  }, []);

  const showResults = useCallback((data: AnalysisResult) => {
    setResult(data);
    setView('results');
  }, []);

  const showHistory = useCallback(() => setView('history'), []);
  const showWelcome = useCallback(() => setView('welcome'), []);

  return {
    view,
    result,
    error,
    processing,
    analyze,
    analyzeFile,
    reset,
    showResults,
    showHistory,
    showWelcome,
  };
}
