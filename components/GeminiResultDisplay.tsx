import React from 'react';
import { CopyIcon, DownloadIcon } from './icons';

interface GeminiResultDisplayProps {
  htmlContent: string;
  onCopySuccess: () => void;
}

export const GeminiResultDisplay: React.FC<GeminiResultDisplayProps> = ({ htmlContent, onCopySuccess }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent).then(() => {
      onCopySuccess();
    }).catch(err => {
      console.error('Failed to copy generated HTML: ', err);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gemini-replication.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
      <div className="flex justify-between items-center p-4 bg-gray-800 rounded-t-xl border-b border-gray-700">
        <h2 className="text-xl font-bold text-gray-200">Gemini Replication Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-md transition duration-200"
            title="Copy Generated HTML"
          >
            <CopyIcon />
            <span>Copy HTML</span>
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
      <div className="p-4 sm:p-6">
        <iframe
          srcDoc={htmlContent}
          title="Gemini HTML Preview"
          className="w-full h-[60vh] bg-white rounded-md border border-gray-600"
          sandbox="allow-scripts" // Use 'allow-scripts' to let JS run, but be cautious. 'allow-same-origin' is riskier.
        />
      </div>
    </div>
  );
};