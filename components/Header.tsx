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
    </div>
    <p className="text-lg text-md-body max-w-2xl mx-auto leading-relaxed">
      Extract the complete design system from any website. Clone it with AI in one quick cleanup.
    </p>
  </header>
);
