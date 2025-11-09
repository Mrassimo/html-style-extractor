import React from 'react';
import { CopyIcon } from './icons';

interface PromptsGuideProps {
  onCopySuccess: () => void;
}

const PromptCard: React.FC<{ title: string; description: string; prompt: string; onCopy: (text: string) => void; children?: React.ReactNode }> = ({ title, description, prompt, onCopy, children }) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg mb-6">
            <div className="p-4 bg-gray-800 rounded-t-xl border-b border-gray-700">
                <h3 className="text-lg font-bold text-gray-200">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <div className="p-4">
                <pre className="p-4 bg-gray-900 rounded-md text-sm text-gray-300 whitespace-pre-wrap break-words overflow-auto max-h-[200px] font-mono mb-4 border border-gray-700">
                    <code>{prompt}</code>
                </pre>
                {children}
                <button
                    onClick={() => onCopy(prompt)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-md transition duration-200"
                    title="Copy Prompt"
                >
                    <CopyIcon />
                    <span>Copy Prompt</span>
                </button>
            </div>
        </div>
    );
};


export const PromptsGuide: React.FC<PromptsGuideProps> = ({ onCopySuccess }) => {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            onCopySuccess();
        }).catch(err => {
            console.error('Failed to copy prompt: ', err);
        });
    };

    const prompts = {
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
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">AI Prompt Workflow</h2>
            <p className="text-gray-400 mb-6">Use these prompts with an AI model (like Claude, Gemini, or ChatGPT) along with the generated report to replicate and build upon the extracted styles.</p>
            
            <PromptCard title="Step 1: Create Initial Page" description="Use the 'Report' tab for this. The full report provides the best context for the AI." prompt={prompts.prompt1} onCopy={handleCopy} />
            <PromptCard title="Step 2: Generate a Style Guide" description="Once the replication is accurate, have the AI document the design system." prompt={prompts.prompt2} onCopy={handleCopy} />
            <PromptCard title="Step 3: Use Your Style Guide" description="Create new pages and components that are consistent with the original design." prompt={prompts.prompt3} onCopy={handleCopy} />
        </div>
    );
};