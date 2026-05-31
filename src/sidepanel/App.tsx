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
import type { HistoryEntry } from './utils/types';

function App() {
  const {
    view,
    result,
    error,
    processing,
    analyze,
    analyzeFile,
    showResults,
    showHistory,
    showWelcome,
  } = useAnalysis();
  const { history, saveAnalysis, clearHistory, formatDate } = useHistory();
  const { exportPDF } = useExportPDF();
  const { inputRef, openFilePicker, handleFileChange, handleDrop, handleDragOver } =
    useFileUpload(analyzeFile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (result) {
      saveAnalysis(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleExport = () => {
    if (result) exportPDF(result);
  };

  const handleHistoryExport = (entry: HistoryEntry) => {
    exportPDF(entry.result);
  };

  const handleHistoryView = (entry: HistoryEntry) => {
    showResults(entry.result);
  };

  return (
    <div
      className="flex min-h-screen flex-col bg-bg-primary"
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
        onHistoryClick={showHistory}
        showBack={view === 'history'}
        onBackClick={result ? () => showResults(result) : showWelcome}
        title={view === 'history' ? 'Your History' : undefined}
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
          saved={saved}
        />
      )}
      {view === 'history' && (
        <HistoryView
          history={history}
          onView={handleHistoryView}
          onExport={handleHistoryExport}
          onClear={clearHistory}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

export default App;
