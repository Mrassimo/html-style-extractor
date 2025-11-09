import JSZip from 'jszip';
import { StyleData, Screenshot } from '../types';
import { convertImageToBase64 } from './imageUtils';
import { generateCompleteOutput, generateBasicMarkdown } from './promptGenerator';

export const createCompleteDownloadPackage = async (data: StyleData): Promise<void> => {
    const zip = new JSZip();

    // 1. Add the main analysis markdown file
    const completeOutput = generateCompleteOutput(data);
    zip.file('design-system-analysis.md', completeOutput);

    // 2. Add a simplified version without analysis for quick reference
    const basicMarkdown = generateBasicMarkdown(data);
    zip.file('design-data-raw.md', basicMarkdown);

    // 3. Add AI prompts file
    const prompts = `
# AI Prompts for Design Replication

## Step 1: Create Initial Page
Use the "design-system-analysis.md" file as context with this prompt:

Help me rebuild the exact same UI design as a single HTML file for "${data.pageTitle}".

I've analyzed ${data.pageUrl} and extracted the complete design system. Use the design-system-analysis.md file as your primary source of truth to create an exact replica.

## Step 2: Generate Style Guide
Once the replication is accurate, use this prompt:

Based on the HTML you created and the original analysis, generate a comprehensive style guide documentation covering colors, typography, spacing, components, and layout patterns.

## Step 3: Create New Pages
Using the style guide, create new pages that maintain complete consistency with the established design system.
`;
    zip.file('ai-prompts.md', prompts);

    // 4. Add screenshots as actual image files
    const screenshotsFolder = zip.folder('screenshots');
    if (screenshotsFolder) {
        for (let i = 0; i < data.screenshots.length; i++) {
            const screenshot = data.screenshots[i];
            try {
                // Convert blob URL to base64 and save as image
                const base64Data = await convertImageToBase64(screenshot.url);

                // Extract the image type and data from base64
                const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const imageType = matches[1];
                    const imageData = matches[2];
                    const extension = imageType.split('/')[1] || 'png';
                    const filename = `screenshot-${i + 1}-${screenshot.label.replace(/[^a-zA-Z0-9]/g, '-')}.${extension}`;

                    screenshotsFolder.file(filename, imageData, { base64: true });
                }
            } catch (error) {
                console.error(`Failed to save screenshot ${i}:`, error);
                // Create a placeholder image file
                screenshotsFolder.file(`screenshot-${i + 1}-${screenshot.label.replace(/[^a-zA-Z0-9]/g, '-')}.txt`,
                    `Screenshot: ${screenshot.label}\nURL: ${screenshot.url}\n\nNote: Could not download image data.`);
            }
        }
    }

    // 5. Add HTML structure file
    zip.file('html-structure.html', data.cleanHtml);

    // 6. Add CSS files
    const cssFolder = zip.folder('css');
    if (cssFolder) {
        data.cssRules.forEach((rule, index) => {
            const filename = `stylesheet-${index + 1}.css`;
            cssFolder.file(filename, rule.content);
        });
    }

    // 7. Add a README file
    const readme = `# Design System Analysis Package

This package contains a complete analysis of the design system from "${data.pageTitle}" (${data.pageUrl}).

## Files Included:

### Main Analysis
- \`design-system-analysis.md\` - Complete analysis with AI prompts
- \`design-data-raw.md\` - Raw extracted data without analysis
- \`ai-prompts.md\` - Step-by-step AI prompts for replication

### Visual Assets
- \`screenshots/\` - All captured screenshots as image files

### Source Code
- \`html-structure.html\` - Clean HTML structure
- \`css/\` - Extracted CSS rules from all stylesheets

## Usage:

1. **For AI Analysis**: Use \`design-system-analysis.md\` as context with your AI model
2. **For Development**: Use the raw data and source files in the \`css/\` folder
3. **For Reference**: Use the screenshots in the \`screenshots/\` folder for visual reference

## Generated:
- Date: ${new Date().toLocaleString()}
- Stylesheets analyzed: ${data.stylesheetCount}
- Screenshots captured: ${data.screenshots.length}
- Colors identified: ${data.colorPalette.length}
`;
    zip.file('README.md', readme);

    // Generate the ZIP file and trigger download
    try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `design-system-${data.pageTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to create ZIP file:', error);
        // Fallback to markdown-only download
        const blob = new Blob([completeOutput], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `design-system-analysis-${data.pageTitle.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

export const createMarkdownWithBase64Images = async (data: StyleData): Promise<string> => {
    let markdown = generateCompleteOutput(data);

    // Replace screenshot URLs with base64 images
    for (const screenshot of data.screenshots) {
        try {
            const base64Data = await convertImageToBase64(screenshot.url);
            // Replace the original URL with the base64 data
            markdown = markdown.replace(
                new RegExp(`!\\[${screenshot.label}\\]\\(${screenshot.url}\\)`, 'g'),
                `![${screenshot.label}](${base64Data})`
            );
        } catch (error) {
            console.error(`Failed to convert screenshot to base64: ${screenshot.label}`, error);
            // Keep original URL if conversion fails
        }
    }

    return markdown;
};