import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => (
  <div className="bg-md-white rounded-lg shadow-md-md-soft border border-md-border p-8 text-center" aria-label="Loading content">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 bg-md-orange rounded-full flex items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-md-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <div className="absolute -inset-2 bg-md-orange rounded-full animate-ping opacity-20"></div>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-md-primary">{message}</p>
        <p className="text-sm text-md-muted">Analyzing design systems and generating comprehensive reports...</p>
      </div>
      <div className="flex items-center space-x-2 text-xs text-md-muted">
        <div className="w-2 h-2 bg-md-green rounded-full animate-pulse"></div>
        <span>Processing in your browser</span>
      </div>
    </div>
  </div>
);