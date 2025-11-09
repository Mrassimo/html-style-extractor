import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from './icons';
import { getUrlSuggestions, addRecentUrl, filterSuggestions } from '../services/urlSuggestions';
import type { UrlSuggestion } from '../services/urlSuggestions';

interface UrlInputFormProps {
  onSubmit: (urls: string[]) => void;
  isLoading: boolean;
  hideButton?: boolean;
  onUrlChange?: (url: string) => void;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onSubmit, isLoading, hideButton = false, onUrlChange }) => {
  const [url, setUrl] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<UrlSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<UrlSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef<boolean>(false);

  // Load initial suggestions
  useEffect(() => {
    setSuggestions(getUrlSuggestions());
    setFilteredSuggestions(getUrlSuggestions().slice(0, 8));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Automatic mode: use single URL with auto-discovery
    if (url.trim() && !isLoading) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;

      // Add to recent URLs
      addRecentUrl(fullUrl);

      onSubmit([fullUrl]);

      // Close dropdown
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);

    // Notify parent component of URL change
    onUrlChange?.(value);

    // Don't show suggestions if we just selected an item
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    // Always show suggestions when typing, filter more aggressively
    let filtered: UrlSuggestion[] = [];

    if (value.length >= 1) {
      // Search mode: filter suggestions based on input
      filtered = filterSuggestions(suggestions, value);
    } else {
      // Show top suggestions when input is empty
      filtered = suggestions.slice(0, 8);
    }

    console.log('Suggestions for query:', value, 'found:', filtered.length); // Debug log
    setFilteredSuggestions(filtered);
    setShowSuggestions(true); // Always show when typing
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    // Show suggestions when input is focused
    let filtered: UrlSuggestion[] = [];

    if (url.length >= 1) {
      // When there's input, show only matching suggestions (no popular fallback)
      filtered = filterSuggestions(suggestions, url);
    } else {
      // When empty, show default/popular suggestions
      filtered = suggestions.slice(0, 8);
    }

    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSuggestionSelect = (suggestion: UrlSuggestion) => {
    // Set flag to prevent reopening dropdown when URL changes
    justSelectedRef.current = true;

    setUrl(suggestion.url);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Notify parent component of URL change
    onUrlChange?.(suggestion.url);

    // Keep focus on input so user can immediately submit or type
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    const hasSuggestions = filteredSuggestions.length > 0;

    switch (e.key) {
      case 'ArrowDown':
        if (!hasSuggestions) {
          // No interactive suggestions to move through
          return;
        }
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        if (!hasSuggestions) {
          // No interactive suggestions to move through
          return;
        }
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (hasSuggestions && selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionSelect(filteredSuggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'popular': return 'text-green-400';
      case 'recent': return 'text-blue-400';
      case 'design': return 'text-purple-400';
      case 'tech': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'popular': return '🔥';
      case 'recent': return '⏰';
      case 'design': return '🎨';
      case 'tech': return '⚙';
      default: return '🔗';
    }
  };

  return (
    <div className="bg-md-white rounded-lg shadow-md-md-soft border border-md-border p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative" ref={dropdownRef}>
          <label htmlFor="url-input" className="block text-sm font-semibold text-md-primary mb-3 uppercase tracking-wide">
            Website URL
          </label>
          <input
            id="url-input"
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Enter website URL (e.g., stripe.com) - try typing 'git' or 'design'"
            className="w-full bg-md-white border border-md-border-strong rounded-lg px-4 py-3 text-md-primary placeholder:text-md-muted focus:outline-none focus:ring-2 focus:ring-md-blue-focus focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label="Website URL"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            role="combobox"
          />

          {/* Dropdown arrow indicator */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none top-9">
            <ChevronDownIcon className={`h-5 w-5 text-md-muted transition-transform duration-200 ${showSuggestions ? 'rotate-180' : ''}`} />
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute z-50 w-full mt-2 bg-md-white border border-md-border-strong rounded-lg shadow-md-btn-primary max-h-80 overflow-auto">
              <div className="flex items-center justify-between p-2 border-b border-md-border gap-2">
                <p className="text-xs font-semibold text-md-muted uppercase tracking-wide">
                  {url.trim().length === 0 ? 'Suggestions' : 'Matches'}
                </p>
                {url.trim().length > 0 && (
                  <span className="text-[10px] text-slate-500">
                    {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'match' : 'matches'}
                  </span>
                )}
              </div>

              {filteredSuggestions.length > 0 ? (
                <ul className="py-2" role="listbox">
                  {filteredSuggestions.map((suggestion, index) => (
                    <li
                      key={`${suggestion.url}-${index}`}
                      className={`px-4 py-3 cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                        index === selectedIndex
                          ? 'bg-md-blue-light text-md-primary border-l-4 border-md-blue-focus'
                          : 'text-md-primary hover:bg-md-bg-alt hover:text-md-primary'
                      }`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      <span className="text-lg flex-shrink-0">
                        {getCategoryIcon(suggestion.category)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {suggestion.label}
                        </div>
                        <div className="text-xs text-md-muted truncate font-mono">
                          {suggestion.url}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full bg-md-bg-alt ${getCategoryColor(
                          suggestion.category
                        )}`}
                      >
                        {suggestion.category}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : url.trim().length > 0 ? (
                <div className="py-3 px-4 text-xs text-md-muted flex items-center justify-between gap-3">
                  <span>No matching sites. Try a full URL or a different term.</span>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">(0 matches)</span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {!hideButton && (
          <div className="transition-all duration-500 ease-in-out"
               style={{
                 opacity: hideButton ? 0 : 1,
                 transform: hideButton ? 'translateY(-20px) scale(0.95)' : 'translateY(0) scale(1)',
                 maxHeight: hideButton ? '0px' : '80px',
                 overflow: 'hidden'
               }}>
            <button
              type="submit"
              className="w-full bg-md-orange hover:bg-md-orange-hover text-md-primary font-bold text-xs uppercase tracking-wide py-4 px-8 rounded-lg border-2 border-md-primary transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:translate-y-0 shadow-md-btn-primary hover:shadow-md-btn-primary-hover"
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-md-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Extract Styles
                </span>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};