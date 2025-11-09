import React from 'react';
import { CopyIcon, DownloadIcon } from './icons';
import { Screenshot, StyleData } from '../types';
import { generateCompleteOutput, generateAnalysisPrompt } from '../services/promptGenerator';

interface ResultsDisplayProps {
  data: StyleData;
  onCopySuccess: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, onCopySuccess }) => {
  const completeOutput = generateCompleteOutput(data);
  const { screenshots } = data;

  const handleCopy = () => {
    navigator.clipboard.writeText(completeOutput).then(() => {
      onCopySuccess();
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([completeOutput], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'design-system-analysis-complete.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyPrompt = () => {
    const analysisPrompt = generateAnalysisPrompt(data);
    navigator.clipboard.writeText(analysisPrompt).then(() => {
      onCopySuccess();
    }).catch(err => {
      console.error('Failed to copy prompt: ', err);
    });
  };

  return (
    <div className="bg-md-white rounded-lg shadow-md-md-soft border border-md-border overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-md-white border-b border-md-border gap-4">
        <div>
          <h2 className="text-2xl font-bold text-md-primary mb-2">Complete Design System Analysis</h2>
          <p className="text-sm text-md-muted">Screenshots, HTML, CSS & AI-ready analysis prompt</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-md-primary hover:bg-md-black text-md-white font-bold text-xs uppercase tracking-wide py-3 px-4 rounded-lg border-2 border-md-primary transition-all duration-200 shadow-md-btn-secondary hover:shadow-md-btn-secondary-hover hover:scale-105"
            title="Copy Complete Analysis (Screenshots + HTML + CSS + AI Prompt)"
          >
            <CopyIcon />
            <span>Copy All</span>
          </button>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-2 bg-md-blue hover:bg-md-blue-focus text-md-white font-bold text-xs uppercase tracking-wide py-3 px-4 rounded-lg border-2 border-md-blue transition-all duration-200 shadow-md-btn-secondary hover:shadow-md-btn-secondary-hover hover:scale-105"
            title="Copy AI Analysis Prompt Only"
          >
            <CopyIcon />
            <span>Copy Prompt</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-md-orange hover:bg-md-orange-hover text-md-primary font-bold text-xs uppercase tracking-wide py-3 px-4 rounded-lg border-2 border-md-primary transition-all duration-200 shadow-md-btn-primary hover:shadow-md-btn-primary-hover hover:scale-105"
            title="Download Complete Analysis"
          >
            <DownloadIcon />
            <span>Download .md</span>
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
                Complete Analysis Output
              </h3>
              <div className="flex items-center gap-2 text-xs text-md-muted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Ready for AI analysis</span>
              </div>
            </div>

            <div className="bg-md-bg-alt rounded-lg border border-md-border p-6">
              <pre className="text-sm text-md-body whitespace-pre-wrap break-words overflow-auto max-h-[70vh] font-mono leading-relaxed">
                <code>{completeOutput}</code>
              </pre>
            </div>
          </div>
      </div>
    </div>
  );
};