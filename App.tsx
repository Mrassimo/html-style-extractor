import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UrlInputForm } from './components/UrlInputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { PromptsGuide } from './components/PromptsGuide';
import { Loader } from './components/Loader';
import { Notification } from './components/Notification';
import { extractAllStyles } from './services/extractorService';
import { formatAsMarkdown } from './services/markdownFormatter';
import { StyleData } from './types';

type Tab = 'report' | 'prompts';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Analyzing...');
  const [styleData, setStyleData] = useState<StyleData | null>(null);
  const [markdownResult, setMarkdownResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('report');
  const [hideExtractButton, setHideExtractButton] = useState<boolean>(false);
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState<string>('');

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExtract = useCallback(async (urls: string[]) => {
    setIsLoading(true);
    setLoadingMessage('Analyzing...');
    setStyleData(null);
    setMarkdownResult(null);
    setError(null);
    setActiveTab('report');

    try {
      const data = await extractAllStyles(urls);
      const markdown = formatAsMarkdown(data);

      setStyleData(data);
      setMarkdownResult(markdown);
      setLastAnalyzedUrl(urls[0] || '');
      setHideExtractButton(true);
      showNotification('Analysis complete!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      let detailedError = `Extraction failed: ${errorMessage}.`;
      if (errorMessage.toLowerCase().includes('failed to fetch')) {
          detailedError += ' This might be due to a network issue, the CORS proxy not working, or the target website blocking requests. Please check your connection and try again or use a different URL.';
      }
      setError(detailedError);
      showNotification('Analysis failed!');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUrlChange = useCallback((url: string) => {
    // Show the extract button again if URL differs from last analyzed
    if (url !== lastAnalyzedUrl) {
      setHideExtractButton(false);
    }
  }, [lastAnalyzedUrl]);

  const TabButton: React.FC<{tab: Tab, label: string}> = ({ tab, label }) => (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide transition-all duration-200 flex-1 sm:flex-none rounded-lg ${activeTab === tab ? 'bg-md-orange text-md-primary border-2 border-md-primary shadow-md-md-btn-primary' : 'bg-transparent text-md-muted hover:bg-md-white hover:text-md-primary hover:border hover:border-md-border-strong'}`}
      >
        {label}
      </button>
  );

  return (
    <div className="min-h-screen bg-md-bg text-md-primary font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />
        <main className="space-y-8">
          <UrlInputForm
          onSubmit={handleExtract}
          isLoading={isLoading}
          hideButton={hideExtractButton}
          onUrlChange={handleUrlChange}
        />
          {isLoading && <Loader message={loadingMessage} />}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-md">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800">Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          {styleData && markdownResult && (
            <div className="space-y-6">
                <div className="bg-md-white rounded-lg shadow-md-md-soft border border-md-border p-1">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1">
                        <TabButton tab="report" label="Analysis Report" />
                        <TabButton tab="prompts" label="AI Prompts" />
                    </div>
                </div>

                {activeTab === 'report' && (
                    <ResultsDisplay
                        data={styleData}
                        onCopySuccess={() => showNotification('Copied complete analysis to clipboard!')} />
                )}
                {activeTab === 'prompts' && (
                    <PromptsGuide onCopySuccess={() => showNotification('Prompt copied!')} />
                )}
            </div>
          )}
        </main>
        <footer className="mt-20 pt-12 border-t border-md-border">
          <div className="text-center">
            <p className="text-md-muted text-sm">HTML Style Extractor for LLMs. All processing is done locally in your browser.</p>
            <p className="text-md-muted text-xs mt-2">Styled with MotherDuck design system</p>
          </div>
        </footer>
      </div>
      {notification && <Notification message={notification} />}
    </div>
  );
};

export default App;