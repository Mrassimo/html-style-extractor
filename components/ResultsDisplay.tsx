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
  const [screenshotExpanded, setScreenshotExpanded] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const textOnlyOutput = generateTextOnlyOutput(data);
  const { screenshots } = data;

  const handleToggleScreenshot = (index: number) => {
    // Toggle expanded state for screenshot
    const expandedState = screenshotExpanded[index] || false;
    setScreenshotExpanded(prev => ({ ...prev, [index]: !expandedState }));
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

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopySuccess();
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-md-white rounded-lg shadow-md-md-soft border border-md-border overflow-hidden">
      <div className="p-6 sm:p-8">
          {screenshots.length > 0 && (
              <div className="mb-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {screenshots.map((shot, index) => {
                        const isExpanded = !!screenshotExpanded[index];
                        return (
                          <div
                            key={index}
                            className="bg-md-bg-alt rounded-lg border border-md-border overflow-hidden shadow hover:shadow-md-md-btn-secondary transition-all duration-300"
                          >
                            {/* Clickable preview area */}
                            <div
                              className={`
                                bg-md-black p-4 cursor-pointer flex items-center justify-center
                                overflow-hidden
                                transition-all duration-300 ease-in-out
                                ${isExpanded ? 'max-h-[600px]' : 'max-h-[200px]'}
                              `}
                              style={{ transitionProperty: 'max-height' }}
                              onClick={() => handleToggleScreenshot(index)}
                            >
                              <img
                                src={shot.url}
                                alt={shot.label}
                                className={`
                                  max-w-full object-contain
                                  transition-all duration-300 ease-in-out
                                  ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-[2px]'}
                                `}
                              />
                            </div>
                            {/* Label + expand/collapse control */}
                            <div className="p-4">
                              <div
                                className={`
                                  flex items-center justify-between
                                  transition-all duration-200 ease-in-out
                                  ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-[1px]'}
                                `}
                              >
                                <p
                                  className="text-sm font-semibold text-md-primary"
                                  title={shot.label}
                                >
                                  {shot.label}
                                </p>
                                <button
                                  onClick={() => handleToggleScreenshot(index)}
                                  className="text-xs text-md-blue hover:text-md-blue-focus transition-colors flex items-center gap-1"
                                >
                                  <svg
                                    className={`
                                      w-4 h-4
                                      transition-transform duration-300 ease-in-out
                                      ${isExpanded ? 'rotate-180' : ''}
                                    `}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                  {isExpanded ? 'Collapse' : 'Expand'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

              </div>
          )}

          <div className="space-y-6">
            {/* Output Section - Consolidated */}
            <div className="bg-md-white rounded-lg border border-md-border overflow-hidden">
              <button
                onClick={() => setAnalysisExpanded(!analysisExpanded)}
                className="w-full flex items-center justify-between gap-2 p-6 hover:bg-md-bg-alt transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-md-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <h3 className="text-xl font-bold text-md-primary">
                    Output
                  </h3>
                </div>
                <svg
                  className={`w-5 h-5 text-md-muted transition-transform duration-300 ${analysisExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {analysisExpanded && (
                <div className="border-t border-md-border p-6 bg-md-bg-alt">
                  <pre className="text-sm text-md-body whitespace-pre-wrap break-words font-mono leading-relaxed">
                    <code>{textOnlyOutput}</code>
                  </pre>
                  {data.cleanHtml && (
                    <>
                      <div className="my-6 border-t border-md-border"></div>
                      <h4 className="text-md font-semibold text-md-primary mb-3">Cleaned HTML</h4>
                      <pre className="text-sm text-md-body whitespace-pre-wrap break-words font-mono leading-relaxed">
                        <code>{data.cleanHtml}</code>
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-md-white rounded-lg border border-md-border p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 bg-md-orange hover:bg-md-orange-hover disabled:bg-md-muted disabled:cursor-not-allowed text-md-primary font-bold text-xs uppercase tracking-wide py-3 px-6 rounded-lg border-2 border-md-primary transition-all duration-200 shadow-md-btn-primary hover:shadow-md-btn-primary-hover hover:scale-105"
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
                      <span>Download Complete Package</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => handleCopyText(textOnlyOutput)}
                    className="flex items-center justify-center gap-2 bg-md-blue hover:bg-md-blue-focus text-white font-bold text-xs uppercase tracking-wide py-3 px-6 rounded-lg border-2 border-md-blue transition-all duration-200 shadow-md-btn-secondary hover:shadow-md-btn-secondary-hover hover:scale-105"
                    title="Copy Text"
                  >
                    <CopyIcon />
                    <span>Copy Text</span>
                  </button>
                  {copied && (
                    <span className="text-[10px] text-md-green font-semibold">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};