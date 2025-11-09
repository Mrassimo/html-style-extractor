import React, { useState } from 'react';

interface UrlInputFormProps {
  onSubmit: (urls: string[]) => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState<string>('');
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [urls, setUrls] = useState<string[]>(['']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (manualMode) {
      // Manual mode: use multiple URLs
      const validUrls = urls.filter(u => u.trim() !== '');
      if (validUrls.length > 0 && !isLoading) {
        const fullUrls = validUrls.map(url => {
          if (!/^https?:\/\//i.test(url)) {
            return `https://${url}`;
          }
          return url;
        });
        onSubmit(fullUrls);
      }
    } else {
      // Automatic mode: use single URL with auto-discovery
      if (url.trim() && !isLoading) {
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        onSubmit([fullUrl]);
      }
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
  };

  const handleManualUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlInput = () => {
    if (urls.length < 4) {
      setUrls([...urls, '']);
    }
  };

  const removeUrlInput = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-200">Website Analysis</h3>
          <button
            type="button"
            onClick={() => setManualMode(!manualMode)}
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            {manualMode ? '🔍 Auto-Discover Pages' : '⚙️ Manual URL Selection'}
          </button>
        </div>
        <p className="text-sm text-gray-400">
          {manualMode
            ? 'Manually specify which pages to screenshot'
            : '🚀 Automatically discovers and screenshots the most important pages'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!manualMode ? (
          // Automatic mode - single URL input
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Enter website URL (e.g., example.com)"
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-3 text-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 outline-none disabled:opacity-50"
              disabled={isLoading}
              aria-label="Website URL"
            />
            <div className="mt-2 p-3 bg-gray-700/50 rounded-md">
              <p className="text-xs text-gray-300">
                <span className="text-green-400">✨ Automatic Mode:</span> We'll automatically discover and screenshot the main page plus the 3 most important pages
              </p>
            </div>
          </div>
        ) : (
          // Manual mode - multiple URL inputs
          <>
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleManualUrlChange(index, e.target.value)}
                  placeholder={index === 0 ? "Enter primary URL for analysis" : "Add another page for screenshot"}
                  className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-3 text-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 outline-none disabled:opacity-50"
                  disabled={isLoading}
                  aria-label={`Website URL ${index + 1}`}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeUrlInput(index)}
                    className="p-2 text-gray-400 hover:text-red-400 disabled:opacity-50"
                    disabled={isLoading}
                    aria-label={`Remove URL ${index + 1}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {urls.length < 4 && (
              <button
                type="button"
                onClick={addUrlInput}
                className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
                disabled={isLoading}
              >
                + Add Another Page
              </button>
            )}
          </>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
          disabled={isLoading || (!manualMode && !url.trim()) || (manualMode && urls.filter(u => u.trim()).length === 0)}
        >
          {isLoading ? 'Analyzing...' : '🎯 Extract Styles & Screenshots'}
        </button>

        <div className="text-xs text-gray-500 mt-3 space-y-1">
          {manualMode ? (
            <p>Style analysis is performed on the first URL. Screenshots will be taken for all provided URLs.</p>
          ) : (
            <p>
              <span className="text-green-400">🤖 Smart Discovery:</span> Automatically analyzes navigation and finds the most important pages to screenshot
            </p>
          )}
        </div>
      </form>
    </div>
  );
};