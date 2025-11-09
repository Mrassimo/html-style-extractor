import React from 'react';

export const Header: React.FC = () => (
  <header className="text-center mb-12">
    <div className="inline-flex items-center space-x-3 mb-6">
      <div className="w-12 h-12 bg-md-orange rounded-full flex items-center justify-center shadow-md-md-btn-primary">
        <svg className="w-6 h-6 text-md-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-md-primary">
        Style Extractor
      </h1>
      <p className="text-lg font-semibold text-md-muted mt-2">HTML Inline Style Refactor</p>
    </div>
    <p className="text-lg text-md-body max-w-2xl mx-auto leading-relaxed">
      Turn messy inline-styled HTML into clean, reusable CSS utility classes and cleaned HTML output in one click.
    </p>
    <div className="flex items-center justify-center space-x-6 mt-6">
      <div className="flex items-center space-x-2 text-sm text-md-muted">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>One-Click Cleanup</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-md-muted">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Safe & Local</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-md-muted">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Copy-Ready Output</span>
      </div>
    </div>
  </header>
);
