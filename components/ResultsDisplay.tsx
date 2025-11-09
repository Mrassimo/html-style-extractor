import React from 'react';
import { CopyIcon, DownloadIcon } from './icons';
import { Screenshot } from '../types';

interface ResultsDisplayProps {
  markdown: string;
  screenshots: Screenshot[];
  onCopySuccess: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ markdown, screenshots, onCopySuccess }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      onCopySuccess();
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted-styles.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
      <div className="flex justify-between items-center p-4 bg-gray-800 rounded-t-xl border-b border-gray-700">
        <h2 className="text-xl font-bold text-gray-200">Extraction Report</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-md transition duration-200"
            title="Copy to Clipboard"
          >
            <CopyIcon />
            <span>Copy</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            title="Download as Markdown"
          >
            <DownloadIcon />
            <span>Download .md</span>
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-6">
          {screenshots.length > 0 && (
              <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-200 mb-4">Page Screenshots</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {screenshots.map((shot, index) => (
                          <div key={index} className="bg-gray-900 p-2 rounded-lg border border-gray-700">
                              <div className="bg-black rounded-md overflow-hidden h-72 flex items-center justify-center">
                                  <img src={shot.url} alt={shot.label} className="max-w-full max-h-full object-contain" />
                              </div>
                              <p className="text-center text-xs text-gray-400 mt-2 font-semibold truncate" title={shot.label}>{shot.label}</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}
          <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words overflow-auto max-h-[60vh] font-mono bg-gray-900 p-4 rounded-md border border-gray-700">
            <code>{markdown}</code>
          </pre>
      </div>
    </div>
  );
};