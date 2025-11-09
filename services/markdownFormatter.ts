import { StyleData, Screenshot } from '../types';

export const formatAsMarkdown = (data: StyleData): string => {
  return `
# Complete Design System Analysis

**URL:** ${data.pageUrl}
**Title:** ${data.pageTitle}
**Analysis Date:** ${new Date().toISOString()}

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
};