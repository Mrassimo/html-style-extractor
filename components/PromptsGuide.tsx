import React from 'react';
import { CopyIcon } from './icons';
import { generateContextualPrompts } from '../services/promptGenerator';

interface PromptsGuideProps {
  onCopySuccess: () => void;
  styleData?: any; // Make styleData optional for backward compatibility
}

const PromptCard: React.FC<{ title: string; description: string; prompt: string; onCopy: (text: string) => void; children?: React.ReactNode }> = ({ title, description, prompt, onCopy, children }) => {
    return (
        <div className="bg-md-white rounded-lg shadow-md-md-soft border border-md-border mb-6 overflow-hidden hover:shadow-md-md-btn-primary transition-all duration-300">
            <div className="p-6 bg-md-bg-alt border-b border-md-border">
                <h3 className="text-lg font-bold text-md-primary flex items-center gap-2">
                    <svg className="w-5 h-5 text-md-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {title}
                </h3>
                {description && <p className="text-sm text-md-muted mt-2">{description}</p>}
            </div>
            <div className="p-6">
                <div className="bg-md-bg rounded-lg border border-md-border p-4 mb-4">
                    <pre className="text-sm text-md-body whitespace-pre-wrap break-words font-mono leading-relaxed">
                        <code>{prompt}</code>
                    </pre>
                </div>
                {children}
                <button
                    onClick={() => onCopy(prompt)}
                    className="w-full flex items-center justify-center gap-2 bg-md-blue hover:bg-md-blue-focus text-md-white font-bold text-xs uppercase tracking-wide py-3 px-6 rounded-lg border-2 border-md-blue transition-all duration-200 shadow-md-btn-secondary hover:shadow-md-btn-secondary-hover hover:scale-105"
                    title="Copy Prompt"
                >
                    <CopyIcon />
                    <span>Copy Prompt</span>
                </button>
            </div>
        </div>
    );
};


export const PromptsGuide: React.FC<PromptsGuideProps> = ({ onCopySuccess, styleData }) => {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            onCopySuccess();
        }).catch(err => {
            console.error('Failed to copy prompt: ', err);
        });
    };

    // Use contextual prompts if styleData is available, otherwise fall back to generic prompts
    const prompts = styleData ? generateContextualPrompts(styleData) : {
        prompt1: `Help me rebuild the exact same UI design as a single HTML file.

The attached report contains the extracted CSS, HTML structure, and screenshots from multiple pages. Focus on capturing:
- Exact color palette
- Typography (fonts, sizes, weights)
- Spacing and layout
- Component styles (buttons, cards, forms)
- Shadows and borders

Make it pixel-perfect to the original. Use the full report as the primary source of truth.`,
        prompt2: `Perfect! Now help me generate a detailed style guide based on the replicated HTML.

The style guide must include:
1. Overview - Brief description of the design philosophy
2. Color Palette - All colors with hex codes and usage
3. Typography - Font families, sizes, weights, line heights
4. Spacing System - Margin and padding scale
5. Component Styles - Buttons, cards, inputs, etc.
6. Shadows - Box shadow values
7. Border Radius - Rounding values
8. Layout Grid - Container widths, breakpoints

Save this as "styles.md"`,
        prompt3: `Using the styles.md guide, help me design a new [task management / dashboard / landing page] interface.

Save as "new-page.html"

Make sure it follows ALL the style guidelines exactly.`
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-md-primary flex items-center gap-2">
                <svg className="w-6 h-6 text-md-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Prompts
            </h2>

            <div className="space-y-6">
                <PromptCard title="Step 1: Create Initial Page" description="" prompt={styleData ? prompts.step1 : prompts.prompt1} onCopy={handleCopy} />
                <PromptCard title="Step 2: Generate a Style Guide" description="" prompt={styleData ? prompts.step2 : prompts.prompt2} onCopy={handleCopy} />
                <PromptCard title="Step 3: Use Your Style Guide" description="" prompt={styleData ? prompts.step3 : prompts.prompt3} onCopy={handleCopy} />
            </div>
        </div>
    );
};