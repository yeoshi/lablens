import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry, AnalysisResult } from '../utils/types';
import {
  buildHistoryEntry,
  formatDateTime,
  migrateHistoryEntry,
  analysisContentHash,
} from '../utils/history-utils';

const STORAGE_KEY = 'lablens_history';

export type SaveAnalysisResult = { status: 'saved' | 'duplicate'; entry: HistoryEntry };

function loadEntries(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      try {
        return migrateHistoryEntry(entry as Partial<HistoryEntry> & { result?: AnalysisResult });
      } catch {
        return null;
      }
    })
    .filter((e): e is HistoryEntry => e !== null);
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      setHistory(loadEntries(data[STORAGE_KEY]));
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    chrome.storage.local.set({ [STORAGE_KEY]: entries });
  }, []);

  const saveAnalysis = useCallback(
    (result: AnalysisResult): SaveAnalysisResult => {
      const hash = analysisContentHash(result);
      const duplicate = history.find(
        (e) => analysisContentHash(e.analysisData) === hash
      );

      if (duplicate) {
        return { status: 'duplicate', entry: duplicate };
      }

      const entry = buildHistoryEntry(result);
      persist([entry, ...history].slice(0, 50));
      return { status: 'saved', entry };
    },
    [history, persist]
  );

  const clearHistory = useCallback(() => {
    persist([]);
  }, [persist]);

  const deleteEntry = useCallback(
    (id: string) => {
      persist(history.filter((e) => e.id !== id));
    },
    [history, persist]
  );

  return { history, loaded, saveAnalysis, clearHistory, deleteEntry, formatDateTime };
}
