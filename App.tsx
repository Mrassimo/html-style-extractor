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
  const [styleData, setStyleData] = useState<StyleData | null>(null);
  const [markdownResult, setMarkdownResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('report');

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExtract = useCallback(async (urls: string[]) => {
    setIsLoading(true);
    setStyleData(null);
    setMarkdownResult(null);
    setError(null);
    setActiveTab('report');

    try {
      const data = await extractAllStyles(urls);
      const markdown = formatAsMarkdown(data);
      
      setStyleData(data);
      setMarkdownResult(markdown);
      showNotification('Extraction successful!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      let detailedError = `Extraction failed: ${errorMessage}.`;
      if (errorMessage.toLowerCase().includes('failed to fetch')) {
          detailedError += ' This might be due to a network issue, the CORS proxy not working, or the target website blocking requests. Please check your connection and try again or use a different URL.';
      }
      setError(detailedError);
      showNotification('Extraction failed!');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const TabButton: React.FC<{tab: Tab, label: string}> = ({ tab, label }) => (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors w-full sm:w-auto ${activeTab === tab ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
      >
        {label}
      </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <main>
          <UrlInputForm onSubmit={handleExtract} isLoading={isLoading} />
          {isLoading && <Loader message="Analyzing website..." />}
          {error && (
            <div className="mt-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {styleData && markdownResult && (
            <div className="mt-8">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4 p-1 bg-gray-800 rounded-lg border border-gray-700">
                    <TabButton tab="report" label="Report" />
                    <TabButton tab="prompts" label="AI Prompts" />
                </div>

                {activeTab === 'report' && (
                    <ResultsDisplay 
                        markdown={markdownResult} 
                        screenshots={styleData.screenshots}
                        onCopySuccess={() => showNotification('Copied to clipboard!')} />
                )}
                {activeTab === 'prompts' && (
                    <PromptsGuide onCopySuccess={() => showNotification('Prompt copied!')} />
                )}
            </div>
          )}
        </main>
        <footer className="text-center text-gray-500 mt-12 text-sm">
          <p>HTML Style Extractor for LLMs. All processing is done locally in your browser.</p>
        </footer>
      </div>
      {notification && <Notification message={notification} />}
    </div>
  );
};

export default App;