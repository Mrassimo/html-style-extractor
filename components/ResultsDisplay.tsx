import React, { useState } from 'react';
import { CopyIcon, DownloadIcon } from './icons';
import { Screenshot, StyleData } from '../types';
import { generateTextOnlyOutput } from '../services/promptGenerator';
import { createCompleteDownloadPackage } from '../services/downloadService';

interface ResultsDisplayProps {
  data: StyleData;
  onCopySuccess: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, onCopySuccess }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copyingScreenshots, setCopyingScreenshots] = useState(false);
  const textOnlyOutput = generateTextOnlyOutput(data);
  const { screenshots } = data;

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(textOnlyOutput);
      onCopySuccess();
    } catch (err) {
      console.error('Failed to copy text: ', err);
    } finally {
      setIsCopying(false);
    }
  };

  const handleCopyScreenshots = async () => {
    if (screenshots.length === 0) return;

    setCopyingScreenshots(true);
    try {
      // Copy screenshots sequentially with a small delay
      for (let i = 0; i < screenshots.length; i++) {
        const shot = screenshots[i];
        const screenshotText = `Screenshot ${i + 1}: ${shot.label}\n${shot.url}\n${i < screenshots.length - 1 ? '---\n' : ''}`;

        await navigator.clipboard.writeText(screenshotText);

        // Show progress to user
        onCopySuccess();

        // Small delay between copies (except for the last one)
        if (i < screenshots.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (err) {
      console.error('Failed to copy screenshots: ', err);
    } finally {
      setCopyingScreenshots(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await createCompleteDownloadPackage(data);
      onCopySuccess();
    } catch (error) {
      console.error('Failed to download package:', error);
      // Fallback to simple markdown download
      const blob = new Blob([textOnlyOutput], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'design-system-analysis.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-md-white rounded-lg shadow-md-md-soft border border-md-border overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-md-white border-b border-md-border gap-4">
        <div>
          <h2 className="text-2xl font-bold text-md-primary mb-2">Complete Design System Analysis</h2>
          <p className="text-sm text-md-muted">Text analysis + AI prompts • Complete package with all assets</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleCopy}
            disabled={isCopying}
            className="flex items-center gap-2 bg-md-primary hover:bg-md-black disabled:bg-md-muted disabled:cursor-not-allowed text-md-white font-bold text-xs uppercase tracking-wide py-3 px-4 rounded-lg border-2 border-md-primary transition-all duration-200 shadow-md-btn-secondary hover:shadow-md-btn-secondary-hover hover:scale-105"
            title="Copy Analysis with AI Prompts"
          >
            {isCopying ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Copying...</span>
              </>
            ) : (
              <>
                <CopyIcon />
                <span>Copy Analysis</span>
              </>
            )}
          </button>

          {screenshots.length > 0 && (
            <button
              onClick={handleCopyScreenshots}
              disabled={copyingScreenshots}
              className="flex items-center gap-2 bg-md-blue hover:bg-md-blue-focus disabled:bg-md-muted disabled:cursor-not-allowed text-md-white font-bold text-xs uppercase tracking-wide py-3 px-4 rounded-lg border-2 border-md-blue transition-all duration-200 shadow-md-btn-secondary hover:shadow-md-btn-secondary-hover hover:scale-105"
              title={`Copy ${screenshots.length} screenshot URLs sequentially`}
            >
              {copyingScreenshots ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Copying URLs...</span>
                </>
              ) : (
                <>
                  <CopyIcon />
                  <span>Copy Screenshots</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-md-orange hover:bg-md-orange-hover disabled:bg-md-muted disabled:cursor-not-allowed text-md-primary font-bold text-xs uppercase tracking-wide py-3 px-4 rounded-lg border-2 border-md-primary transition-all duration-200 shadow-md-btn-primary hover:shadow-md-btn-primary-hover hover:scale-105"
            title="Download Complete Package (ZIP with all assets)"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating ZIP...</span>
              </>
            ) : (
              <>
                <DownloadIcon />
                <span>Download Package</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8">
          {screenshots.length > 0 && (
              <div className="mb-10">
                  <h3 className="text-xl font-bold text-md-primary mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-md-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Page Screenshots
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {screenshots.map((shot, index) => (
                          <div key={index} className="bg-md-bg-alt rounded-lg border border-md-border overflow-hidden shadow hover:shadow-md-md-btn-secondary transition-all duration-300 hover:scale-105">
                              <div className="bg-md-black rounded-t-lg overflow-hidden h-64 flex items-center justify-center">
                                  <img src={shot.url} alt={shot.label} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="p-4">
                                <p className="text-center text-xs font-semibold text-md-muted truncate" title={shot.label}>{shot.label}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-md-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-md-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Design Analysis & AI Prompts
              </h3>
              <div className="flex items-center gap-2 text-xs text-md-muted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Text analysis with integrated prompts</span>
              </div>
            </div>

            <div className="bg-md-bg-alt rounded-lg border border-md-border p-6">
              <pre className="text-sm text-md-body whitespace-pre-wrap break-words overflow-auto max-h-[70vh] font-mono leading-relaxed">
                <code>{textOnlyOutput}</code>
              </pre>
            </div>

            {screenshots.length > 0 && (
              <div className="bg-md-yellow border border-md-orange rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-md-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-md-primary">Screenshot URLs for AI</h4>
                </div>
                <p className="text-sm text-md-body mb-3">
                  Use the "Copy Screenshots" button to copy screenshot URLs sequentially for AI models
                </p>
                <div className="text-xs text-md-muted">
                  Most AIs need screenshots uploaded separately - use the URLs as references
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};