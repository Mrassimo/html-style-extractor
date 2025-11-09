import React from 'react';
import { CopyIcon, DownloadIcon } from './icons';

interface PromptDisplayProps {
  htmlContent: string;
  onCopySuccess: () => void;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ htmlContent, onCopySuccess }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent).then(() => {
      onCopySuccess();
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'replication-prompt.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
      <div className="flex justify-between items-center p-4 bg-gray-800 rounded-t-xl border-b border-gray-700">
        <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-200">Single-File HTML Prompt</h2>
            <p className="text-xs text-gray-400">A self-contained file for AI replication.</p>
        </div>
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
            title="Download as HTML"
          >
            <DownloadIcon />
            <span>Download .html</span>
          </button>
        </div>
      </div>
      <pre className="p-6 text-sm text-gray-300 whitespace-pre-wrap break-words overflow-auto max-h-[60vh] font-mono">
        <code>{htmlContent}</code>
      </pre>
    </div>
  );
};
