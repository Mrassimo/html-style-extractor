import React, { useState } from 'react';

interface UrlInputFormProps {
  onSubmit: (urls: string[]) => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Automatic mode: use single URL with auto-discovery
    if (url.trim() && !isLoading) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      onSubmit([fullUrl]);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? 'Analyzing...' : 'Extract Styles'}
        </button>
      </form>
    </div>
  );
};