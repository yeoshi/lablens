import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry, AnalysisResult } from '../utils/types';
import { generateId, getReportTitle, formatDate } from '../utils/helpers';

const STORAGE_KEY = 'lablens_history';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      setHistory((data[STORAGE_KEY] as HistoryEntry[]) || []);
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    chrome.storage.local.set({ [STORAGE_KEY]: entries });
  }, []);

  const saveAnalysis = useCallback(
    (result: AnalysisResult): HistoryEntry => {
      const flaggedCount = result.values.filter((v) => v.status !== 'normal').length;
      const entry: HistoryEntry = {
        id: generateId(),
        title: getReportTitle(result),
        analyzedAt: result.analyzedAt || new Date().toISOString(),
        flaggedCount,
        result,
      };
      persist([entry, ...history].slice(0, 50));
      return entry;
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

  return { history, loaded, saveAnalysis, clearHistory, deleteEntry, formatDate };
}
