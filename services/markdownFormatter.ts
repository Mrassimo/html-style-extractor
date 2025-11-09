import { StyleData, Screenshot } from '../types';

const formatTopItems = (items: [string, number][], limit: number, variableMap: Map<string, string>) => {
  if (items.length === 0) return 'None found.';
  
  const resolveVar = (value: string): string => {
    const varMatch = value.match(/var\((--[\w-]+)/);
    if (varMatch && variableMap.has(varMatch[1])) {
        const resolvedValue = variableMap.get(varMatch[1])!;
        return `${value} (\`${resolvedValue}\`)`;
    }
    return value;
  };

  return items.slice(0, limit)
    .map(([value, count]) => {
      const resolvedValue = resolveVar(value);
      return `- \`${resolvedValue}\` (${count} occurrences)`;
    })
    .join('\n');
};

const formatLayoutPatterns = (patterns: { selector: string, properties: string[] }[], limit = 5) => {
  if (patterns.length === 0) return 'None found.';
  return patterns.slice(0, limit)
    .map(p => `**Selector:** \`${p.selector}\`\n\`\`\`css\n${p.properties.join(';\n')};\n\`\`\``)
    .join('\n\n');
};

const formatCssVariables = (variables: [string, string][]) => {
    if (variables.length === 0) return 'None found.';
    return '```css\n' +
        variables
        .slice(0, 15)
        .map(([name, value]) => `${name}: ${value};`)
        .join('\n') +
        (variables.length > 15 ? '\n...' : '') +
        '\n```';
}

const formatScreenshots = (screenshots: Screenshot[]) => {
    if (screenshots.length === 0) return 'No screenshots could be captured.';
    return screenshots
      .map(shot => `### ${shot.label}\n![Screenshot of ${shot.label}](${shot.url})`)
      .join('\n\n');
}

export const formatAsMarkdown = (data: StyleData): string => {
  const variableMap = new Map(data.cssVariables);

  return `
# HTML Style Extractor Report: ${data.pageTitle}

**URL:** ${data.pageUrl}

## CSS Overview
- **External Stylesheets:** ${data.stylesheetCount}
- **Elements with Inline Styles:** ${data.inlineStyleCount}
- **Inaccessible Sheets (CORS):** ${data.inaccessibleSheets}

## Page Screenshots
${formatScreenshots(data.screenshots)}

## Color Palette (Top 10)
${formatTopItems(data.colorPalette, 10, variableMap)}

## Typography
### Font Families (Top 5)
${formatTopItems(data.typography.fontFamilies, 5, variableMap)}

### Font Sizes (Top 5)
${formatTopItems(data.typography.fontSizes, 5, variableMap)}

### Font Weights (Top 5)
${formatTopItems(data.typography.fontWeights, 5, variableMap)}

### Line Heights (Top 5)
${formatTopItems(data.typography.lineHeights, 5, variableMap)}

## Spacing Scale (Top 10)
Common values used for margin, padding, and gap.
${formatTopItems(data.spacingScale, 10, variableMap)}

## Layout Patterns (First 5 of each)
### Flexbox Layouts
${formatLayoutPatterns(data.layoutPatterns.flex, 5)}

### Grid Layouts
${formatLayoutPatterns(data.layoutPatterns.grid, 5)}

## CSS Variables (First 15 found in :root)
${formatCssVariables(data.cssVariables)}

## Clean HTML Structure
*Note: HTML output is truncated for performance.*
\`\`\`html
${data.cleanHtml}
\`\`\`

## Full CSS Rules
*Note: Individual CSS file outputs are truncated for performance.*
${data.cssRules.map(rule => `
### ${rule.url}
\`\`\`css
${rule.content}
\`\`\`
`).join('')}
  `.trim();
};