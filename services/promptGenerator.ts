import { StyleData } from '../types';

const extractFontLinks = (headHtml: string): string => {
    const doc = new DOMParser().parseFromString(headHtml, 'text/html');
    const fontLinks: string[] = [];
    
    // Google Fonts, etc.
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com'))) {
            fontLinks.push(link.outerHTML);
        }
    });

    // Font preconnect links
     doc.querySelectorAll('link[rel="preconnect"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('fonts.gstatic.com')) {
            fontLinks.push(link.outerHTML);
        }
    });

    return fontLinks.join('\n    ');
}


export const generateSingleFilePrompt = (data: StyleData): string => {
    const allCss = data.cssRules.map(rule => `/* From: ${rule.url} */\n${rule.content.replace(/\/\*...TRUNCATED...\*\//g, '')}`).join('\n\n');
    const fontLinks = extractFontLinks(data.headContent);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Replication of: ${data.pageTitle}</title>
    
    <!-- Extracted Font Links -->
    ${fontLinks}

    <style>
        /* --- Consolidated CSS from ${data.pageUrl} --- */

        ${allCss}
    </style>
</head>
${data.cleanHtml.replace('...<!-- TRUNCATED -->', '')}
</html>
    `.trim();

    return html;
}
