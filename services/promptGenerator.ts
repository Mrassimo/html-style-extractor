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

export const generateAnalysisPrompt = (data: StyleData): string => {
  return `
# Complete Design System Analysis

You are a senior UI/UX designer and design system specialist. I need you to analyze the following complete design system data from ${data.pageTitle} (${data.pageUrl}) and provide comprehensive insights.

## Context
- **Website**: ${data.pageTitle}
- **URL**: ${data.pageUrl}
- **Analysis Date**: ${new Date().toISOString()}
- **Screenshots Available**: ${data.screenshots.length} pages captured

## Visual Context
${data.screenshots.map(shot => `![${shot.label}](${shot.url})`).join('\n\n')}

## Design System Data

### Color Palette
${data.colorPalette.map(([color, count]) => `${color}: ${count} occurrences`).join('\n')}

### Typography System
**Font Families:**
${data.typography.fontFamilies.map(([font, count]) => `${font}: ${count} occurrences`).join('\n')}

**Font Sizes:**
${data.typography.fontSizes.map(([size, count]) => `${size}: ${count} occurrences`).join('\n')}

**Font Weights:**
${data.typography.fontWeights.map(([weight, count]) => `${weight}: ${count} occurrences`).join('\n')}

**Line Heights:**
${data.typography.lineHeights.map(([height, count]) => `${height}: ${count} occurrences`).join('\n')}

### Spacing System
${data.spacingScale.map(([spacing, count]) => `${spacing}: ${count} occurrences`).join('\n')}

### Layout Patterns
**Flexbox Layouts:**
${data.layoutPatterns.flex.map(pattern => `
**${pattern.selector}**
\`\`\`css
${pattern.properties.join(';\n')};
\`\`\`
`).join('\n')}

**Grid Layouts:**
${data.layoutPatterns.grid.map(pattern => `
**${pattern.selector}**
\`\`\`css
${pattern.properties.join(';\n')};
\`\`\`
`).join('\n')}

### CSS Variables
\`\`\`css
${data.cssVariables.map(([name, value]) => `${name}: ${value};`).join('\n')}
\`\`\`

### HTML Structure
\`\`\`html
${data.cleanHtml}
\`\`\`

### Complete CSS Rules
${data.cssRules.map(rule => `
### ${rule.url}
\`\`\`css
${rule.content}
\`\`\`
`).join('\n')}

---

## Analysis Instructions

Please provide a comprehensive design system analysis covering:

### 1. Color Strategy
- Primary, secondary, and accent colors
- Color psychology and branding implications
- Accessibility considerations (contrast ratios)
- Color hierarchy and usage patterns

### 2. Typography System
- Font family selection rationale
- Type scale analysis and hierarchy
- Readability and legibility assessment
- Brand voice through typography

### 3. Spacing & Layout
- Grid system analysis
- Spacing scale and rhythm
- Layout patterns and responsive behavior
- Component spacing principles

### 4. Component Architecture
- Identifiable component patterns
- Reusable design patterns
- Component naming conventions
- Design tokens and systematic approach

### 5. User Experience Insights
- Visual hierarchy effectiveness
- Information architecture
- User flow considerations
- Accessibility and inclusivity

### 6. Brand Identity & Cohesion
- Brand consistency across elements
- Visual personality assessment
- Competitive positioning insights
- Brand differentiation opportunities

### 7. Technical Implementation
- CSS organization and maintainability
- Performance optimization opportunities
- Responsive design strategy
- Cross-browser compatibility considerations

### 8. Recommendations
- Improvement opportunities
- Best practices implementation
- Design system expansion potential
- Future scalability considerations

Please structure your response with clear sections, actionable insights, and specific examples from the provided data.
`.trim();
};

export const generateCompleteOutput = (data: StyleData): string => {
  const prompt = generateAnalysisPrompt(data);
  const existingMarkdown = generateBasicMarkdown(data);

  return `${prompt}

---

# Raw Design System Data (for reference)

${existingMarkdown}`;
};

function generateBasicMarkdown(data: StyleData): string {
  return `
## 📸 Screenshots
${data.screenshots.map(shot => `![${shot.label}](${shot.url})`).join('\n\n')}

## 📊 CSS Overview
- **Stylesheets:** ${data.stylesheetCount}
- **Inline Styles:** ${data.inlineStyleCount}
- **Inaccessible Sheets:** ${data.inaccessibleSheets}

## 🎨 Color Palette (Complete Raw Data)
${data.colorPalette.map(([color, count]) => `${color}: ${count} occurrences`).join('\n')}

## ✍️ Typography (Complete Raw Data)

### Font Families
${data.typography.fontFamilies.map(([font, count]) => `${font}: ${count} occurrences`).join('\n')}

### Font Sizes
${data.typography.fontSizes.map(([size, count]) => `${size}: ${count} occurrences`).join('\n')}

### Font Weights
${data.typography.fontWeights.map(([weight, count]) => `${weight}: ${count} occurrences`).join('\n')}

### Line Heights
${data.typography.lineHeights.map(([height, count]) => `${height}: ${count} occurrences`).join('\n')}

## 📐 Spacing Scale (Complete Raw Data)
${data.spacingScale.map(([spacing, count]) => `${spacing}: ${count} occurrences`).join('\n')}

## 🏗️ Layout Patterns (Complete Raw Data)

### Flexbox Layouts
${data.layoutPatterns.flex.map(pattern => `
**${pattern.selector}**
\`\`\`css
${pattern.properties.join(';\n')};
\`\`\`
`).join('\n')}

### Grid Layouts
${data.layoutPatterns.grid.map(pattern => `
**${pattern.selector}**
\`\`\`css
${pattern.properties.join(';\n')};
\`\`\`
`).join('\n')}

## 🔧 CSS Variables (Complete Raw Data)
\`\`\`css
${data.cssVariables.map(([name, value]) => `${name}: ${value};`).join('\n')}
\`\`\`

## 📄 Complete HTML Structure
\`\`\`html
${data.cleanHtml}
\`\`\`

## 📋 Complete CSS Rules
${data.cssRules.map(rule => `
### ${rule.url}
\`\`\`css
${rule.content}
\`\`\`
`).join('\n')}
  `.trim();
}
