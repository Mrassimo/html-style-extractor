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

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Analyzing...');
  const [styleData, setStyleData] = useState<StyleData | null>(null);
  const [markdownResult, setMarkdownResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [hideExtractButton, setHideExtractButton] = useState<boolean>(false);
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState<string>('');

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClearAll = () => {
    setStyleData(null);
    setMarkdownResult(null);
    setError(null);
    setNotification(null);
    setHideExtractButton(false);
    setLastAnalyzedUrl('');
  };

  const handleExtract = useCallback(async (urls: string[]) => {
    setIsLoading(true);
    setLoadingMessage('Analyzing...');
    setStyleData(null);
    setMarkdownResult(null);
    setError(null);

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
          detailedError += ' This might be due to an incorrect URL, network issue, the CORS proxy not working, or the target website blocking requests. Please check your input, connection and try again or use a different URL.';
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

  const downloadAsZip = async () => {
    if (!styleData || !markdownResult) return;

    try {
      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add files to zip
      zip.file('analysis.md', markdownResult);
      zip.file('cleaned.html', styleData.cleanHtml);

      // Create CSS file from styles
      const cssContent = styleData.styles
        .map(style => `.${style.class} { ${style.declarations.join('; ')}; }`)
        .join('\n\n');
      zip.file('styles.css', cssContent);

      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'design-export.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification('Design package downloaded!');
    } catch (err) {
      console.error('Failed to create zip', err);
      showNotification('Download failed');
    }
  };

  const copyAllContent = async () => {
    if (!styleData || !markdownResult) return;

    try {
      const content = `${markdownResult}\n\n--- CLEANED HTML ---\n\n${styleData.cleanHtml}`;
      await navigator.clipboard.writeText(content);
      showNotification('All content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
      showNotification('Copy failed');
    }
  };

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
              {/* Action Buttons */}
              <div className="bg-md-white rounded-lg shadow-md-md-soft border border-md-border p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadAsZip}
                    className="flex items-center justify-center gap-2 bg-md-orange hover:bg-md-orange-focus text-md-primary font-bold text-[10px] uppercase tracking-wide py-2 px-6 rounded-lg border border-md-orange transition-all duration-200 shadow-md-btn-primary hover:shadow-md-btn-primary-hover hover:scale-105"
                  >
                    <span>⬇️ Download Package</span>
                  </button>
                  <button
                    onClick={copyAllContent}
                    className="flex items-center justify-center gap-2 bg-md-blue hover:bg-md-blue-focus text-md-white font-bold text-[10px] uppercase tracking-wide py-2 px-6 rounded-lg border border-md-blue transition-all duration-200 shadow-md-btn-secondary hover:shadow-md-btn-secondary-hover hover:scale-105"
                  >
                    <span>📋 Copy All</span>
                  </button>
                </div>
              </div>

              {/* Analysis Report */}
              <ResultsDisplay
                data={styleData}
                onCopySuccess={() => showNotification('Copied complete analysis to clipboard!')}
              />

              {/* Cleaned HTML Output */}
              <div className="bg-md-white rounded-lg shadow-md-md-soft border border-md-border p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-md-primary">Cleaned HTML Output</h2>
                    <p className="text-xs text-md-muted">
                      Inline &lt;style&gt; tags and scripts stripped from body. Ready to pair with extracted CSS.
                    </p>
                  </div>
                </div>
                <div className="bg-md-bg-alt rounded-lg border border-md-border p-4">
                  <pre className="text-xs text-md-body whitespace-pre-wrap break-words overflow-auto max-h-[70vh] font-mono leading-relaxed">
                    <code>{styleData.cleanHtml}</code>
                  </pre>
                </div>
              </div>

              {/* AI Prompts Guide */}
              <PromptsGuide
                onCopySuccess={() => showNotification('Prompt copied!')}
                styleData={styleData}
              />
            </div>
          )}
        </main>
        <footer className="mt-20 pt-12 border-t border-md-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-md-muted">
            <p>HTML Inline Style Refactor. All processing is done locally in your browser.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wide border border-md-border rounded-lg text-md-muted hover:text-md-primary hover:border-md-primary hover:bg-md-bg-alt transition-all duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </footer>
      </div>
      {notification && <Notification message={notification} />}
    </div>
  );
};

export default App;