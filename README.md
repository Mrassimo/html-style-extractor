# HTML Style Extractor for LLMs

A powerful tool designed to analyze any website, extract its complete design system, and format it into a comprehensive report optimized for Large Language Models (LLMs). Turn any webpage into a high-fidelity prompt for AI-driven UI replication and development.

## Core Features

-   **Deep Style Analysis**: Extracts a wide range of design tokens from the primary URL, including:
    -   **Color Palette**: All colors with usage frequency.
    -   **Typography**: Font families, sizes, weights, and line heights.
    -   **Spacing System**: Common margins, paddings, and gaps.
    -   **Layout Patterns**: Detects Flexbox and Grid usage with key properties.
    -   **CSS Variables**: Lists all defined CSS custom properties.
-   **Multi-Page Screenshotting**: Captures full-page desktop screenshots of up to four different URLs to provide comprehensive visual context.
-   **LLM-Optimized Markdown Report**: Generates a clean, well-structured markdown report that's easy for both humans and AI models to understand.
-   **AI Prompt Workflow**: Includes a built-in guide with copy-paste-ready prompts to streamline the process of replicating designs with models like Claude, Gemini, or ChatGPT.
-   **Clean Code Extraction**: Provides the cleaned HTML structure and the full (truncated) CSS rules from all stylesheets.

## How to Use

1.  **Enter Primary URL**: Input the main URL you want to analyze in the first field. The deep style analysis will be performed on this page.
2.  **Add More Pages (Optional)**: Add up to three additional URLs. The tool will capture a full-page screenshot of each URL provided, giving you a broader view of the site's design system across different pages.
3.  **Extract Styles**: Click the "Extract Styles" button to begin the analysis.
4.  **Review the Report**: Once complete, the "Report" tab will display the full markdown analysis and all captured screenshots. You can copy the entire report or download it as a `.md` file.
5.  **Use AI Prompts**: Switch to the "AI Prompts" tab to access a step-by-step workflow with pre-written prompts for your AI model.

## AI Workflow Integration

This tool is built to be the first step in a powerful AI-driven design workflow. The goal is to provide an AI with high-fidelity context, enabling it to create pixel-perfect replications.

Use the prompts in the **AI Prompts** tab as a guide:

### Step 1: Create Initial Page

Combine the full markdown **Report** with the first prompt to ask your AI to generate a single, self-contained HTML file that replicates the original design.

```
Help me rebuild the exact same UI design as a single HTML file.

The attached report contains the extracted CSS, HTML structure, and screenshots from multiple pages. Focus on capturing:
- Exact color palette
- Typography (fonts, sizes, weights)
- Spacing and layout
- Component styles (buttons, cards, forms)
- Shadows and borders

Make it pixel-perfect to the original. Use the full report as the primary source of truth.
```

### Step 2: Generate a Style Guide

Once the replication is accurate, use the second prompt to have the AI analyze its own work and generate a formal style guide. This document becomes the source of truth for all future designs.

### Step 3: Use Your Style Guide

With the style guide established, use the third prompt to create new pages, components, or even entire applications that are perfectly consistent with the original design system.

## Technical Details

-   **Frontend**: Built with React and styled with Tailwind CSS.
-   **CORS Handling**: Uses a CORS proxy (`corsproxy.io`) to reliably fetch cross-domain HTML and CSS content.
-   **Screenshots**: Leverages the Microlink API (`api.microlink.io`) to capture high-resolution, full-page screenshots.
-   **Client-Side Processing**: All analysis and processing happen locally in your browser. No data is ever sent to a server or stored.

## Privacy & Security

This tool operates entirely on the client side. Your data is your own.
-   No data collection.
-   No server-side processing.
-   All information is processed and displayed directly in your browser.

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1McSVV5BAlYurkeyDjwKpRVbR9X5YMV3G

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
