import React from 'react';

export const Header: React.FC = () => (
  <header className="text-center mb-8">
    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
      HTML Style Extractor
    </h1>
    <p className="text-lg text-gray-400">
      Analyze any webpage and generate LLM-ready style reports.
    </p>
  </header>
);
