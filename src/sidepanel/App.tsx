import { useState } from 'react';
import { Header } from './components/Header';
import { WelcomeView } from './components/WelcomeView';
import { LoadingView } from './components/LoadingView';
import { ErrorView } from './components/ErrorView';
import { SummaryView } from './components/SummaryView';
import { HistoryView } from './components/HistoryView';
import { useAnalysis } from './hooks/useAnalysis';
import { useHistory } from './hooks/useHistory';
import { useExportPDF } from './hooks/useExportPDF';
import { useFileUpload } from './hooks/useFileUpload';
import { usePanelWidth } from './hooks/usePanelWidth';
import type { HistoryEntry } from './utils/types';
import { getAnalysisFromEntry } from './utils/history-utils';

function App() {
  const {
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
  } = useAnalysis();
  const { history, saveAnalysis, clearHistory, deleteEntry } = useHistory();
  const { exportPDF } = useExportPDF();
  const { containerRef } = usePanelWidth();
  const { inputRef, openFilePicker, handleFileChange, handleDrop, handleDragOver } =
    useFileUpload(analyzeFile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'duplicate'>('idle');

  const handleSave = () => {
    if (result) {
      const outcome = saveAnalysis(result);
      setSaveStatus(outcome.status);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleExport = () => {
    if (result) exportPDF(result);
  };

  const handleHistoryExport = (entry: HistoryEntry) => {
    exportPDF(getAnalysisFromEntry(entry));
  };

  const handleHistoryView = (entry: HistoryEntry) => {
    showResults(getAnalysisFromEntry(entry));
  };

  const handleHistoryBack = () => {
    if (result) {
      showResults(result);
    } else {
      showWelcome();
    }
  };

  const headerView =
    view === 'results'
      ? 'results'
      : view === 'history'
        ? 'history'
        : view === 'loading'
          ? 'loading'
          : view === 'error'
            ? 'error'
            : 'welcome';

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen w-full flex-col bg-bg-primary transition-all duration-300 ease-in-out"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Header
        view={headerView}
        onHistoryClick={showHistory}
        onNewAnalysis={reset}
        onBackClick={handleHistoryBack}
      />

      {view === 'welcome' && (
        <WelcomeView
          onAnalyze={analyze}
          onUpload={openFilePicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        />
      )}
      {view === 'loading' && <LoadingView processing={processing} />}
      {view === 'error' && (
        <ErrorView message={error || 'Unknown error'} onRetry={analyze} onUpload={openFilePicker} />
      )}
      {view === 'results' && result && (
        <SummaryView
          result={result}
          onExport={handleExport}
          onSave={handleSave}
          saveStatus={saveStatus}
        />
      )}
      {view === 'history' && (
        <HistoryView
          history={history}
          onView={handleHistoryView}
          onExport={handleHistoryExport}
          onDelete={deleteEntry}
          onClear={clearHistory}
        />
      )}
    </div>
  );
}

export default App;
