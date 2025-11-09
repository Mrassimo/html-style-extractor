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

const formatDesignSystemColors = (colors: [string, number][], variableMap: Map<string, string>) => {
  if (colors.length === 0) return 'No colors found.';

  // Group colors by type (primary, neutral, semantic)
  const categorizeColor = (color: string): string => {
    const lowerColor = color.toLowerCase();

    // Primary colors (blues, bright colors)
    if (lowerColor.includes('blue') || lowerColor.includes('#00') || lowerColor.includes('#3b') || lowerColor.includes('#256')) {
      return 'Primary';
    }

    // Neutral colors (grays, whites, blacks)
    if (lowerColor.includes('gray') || lowerColor.includes('grey') || lowerColor.includes('#fff') || lowerColor.includes('#000') ||
        lowerColor.includes('#f3') || lowerColor.includes('#e5') || lowerColor.includes('#d1') || lowerColor.includes('#9ca') ||
        lowerColor.includes('#6b7') || lowerColor.includes('#374') || lowerColor.includes('#111')) {
      return 'Neutral';
    }

    // Semantic colors (success, error, warning)
    if (lowerColor.includes('green') || lowerColor.includes('red') || lowerColor.includes('yellow') || lowerColor.includes('orange')) {
      return 'Semantic';
    }

    return 'Accent';
  };

  const categorized = colors.slice(0, 12).reduce((acc, [color, count]) => {
    const category = categorizeColor(color);
    if (!acc[category]) acc[category] = [];
    acc[category].push({ color, count });
    return acc;
  }, {} as Record<string, { color: string, count: number }[]>);

  return Object.entries(categorized)
    .map(([category, items]) => `#### ${category} Colors\n${items.map(({color, count}) => `- \`${color}\` (${count} uses)`).join('\n')}`)
    .join('\n\n');
};

const formatTypographySystem = (typography: StyleData['typography'], variableMap: Map<string, string>) => {
  const hasFontFamilies = typography.fontFamilies.length > 0;
  const hasFontSizes = typography.fontSizes.length > 0;

  if (!hasFontFamilies && !hasFontSizes) return 'No typography system found.';

  let result = '';

  // Font families - show primary and secondary
  if (hasFontFamilies) {
    const primary = typography.fontFamilies[0];
    const secondary = typography.fontFamilies[1];

    result += `#### Primary Font Family\n\`${primary[0]}\`\n\n`;

    if (secondary) {
      result += `#### Secondary Font Family\n\`${secondary[0]}\`\n\n`;
    }
  }

  // Font sizes - organize by scale
  if (hasFontSizes) {
    const sizes = typography.fontSizes.slice(0, 6);
    const scaleSizes = sizes.sort((a, b) => {
      const aVal = parseFloat(a[0]) || 0;
      const bVal = parseFloat(b[0]) || 0;
      return bVal - aVal;
    });

    result += `#### Type Scale\n${scaleSizes.map(([size, count]) => `- \`${size}\` (${count} uses)`).join('\n')}\n\n`;
  }

  return result.trim();
};

const formatSpacingSystem = (spacing: [string, number][]) => {
  if (spacing.length === 0) return 'No spacing system found.';

  // Extract numeric values and sort them
  const numericSpacing = spacing
    .filter(([value]) => /^\d+(\.\d+)?(px|rem|em)$/.test(value))
    .map(([value, count]) => ({
      value,
      numeric: parseFloat(value) || 0,
      unit: value.includes('rem') ? 'rem' : value.includes('em') ? 'em' : 'px',
      count
    }))
    .sort((a, b) => a.numeric - b.numeric);

  if (numericSpacing.length === 0) {
    return `#### Spacing Values\n${spacing.slice(0, 8).map(([value, count]) => `- \`${value}\` (${count} uses)`).join('\n')}`;
  }

  // Group by unit and show scale
  const byUnit = numericSpacing.reduce((acc, item) => {
    if (!acc[item.unit]) acc[item.unit] = [];
    acc[item.unit].push(item);
    return acc;
  }, {} as Record<string, typeof numericSpacing>);

  return Object.entries(byUnit)
    .map(([unit, items]) => {
      const scale = items.map(({value, count}) => `- \`${value}\` (${count} uses)`);
      return `#### ${unit.charAt(0).toUpperCase() + unit.slice(1)} Scale\n${scale.join('\n')}`;
    })
    .join('\n\n');
};

const formatLayoutSystem = (layout: StyleData['layoutPatterns']) => {
  const hasFlex = layout.flex.length > 0;
  const hasGrid = layout.grid.length > 0;

  if (!hasFlex && !hasGrid) return 'No layout system found.';

  let result = '';

  if (hasFlex) {
    result += `#### Flexbox Usage\nFound ${layout.flex.length} flexbox container${layout.flex.length === 1 ? '' : 's'}\n\n`;

    // Show most common patterns
    const patterns = layout.flex.slice(0, 3);
    patterns.forEach((pattern, i) => {
      result += `**${pattern.selector}**\n`;
      const props = pattern.properties.filter(p =>
        p.includes('justify-content') || p.includes('align-items') || p.includes('flex-direction') || p.includes('gap')
      );
      if (props.length > 0) {
        result += `\`\`\`css\n${props.join(';\n')};\n\`\`\`\n\n`;
      }
    });
  }

  if (hasGrid) {
    result += `#### Grid Usage\nFound ${layout.grid.length} grid container${layout.grid.length === 1 ? '' : 's'}\n\n`;

    const patterns = layout.grid.slice(0, 2);
    patterns.forEach((pattern, i) => {
      result += `**${pattern.selector}**\n`;
      const props = pattern.properties.filter(p =>
        p.includes('grid-template') || p.includes('grid-auto') || p.includes('gap')
      );
      if (props.length > 0) {
        result += `\`\`\`css\n${props.join(';\n')};\n\`\`\`\n\n`;
      }
    });
  }

  return result.trim();
};

export const formatAsMarkdown = (data: StyleData): string => {
  const variableMap = new Map(data.cssVariables);

  return `
# Design System Analysis: ${data.pageTitle}

**Source:** ${data.pageUrl}
**Analysis Date:** ${new Date().toLocaleDateString()}

---

## 📊 Overview
- **${data.stylesheetCount}** stylesheet${data.stylesheetCount === 1 ? '' : 's'} loaded
- **${data.inlineStyleCount}** element${data.inlineStyleCount === 1 ? '' : 's'} with inline styles
- **${data.screenshots.length}** page${data.screenshots.length === 1 ? '' : 's'} captured

---

## 🎨 Color System
${formatDesignSystemColors(data.colorPalette, variableMap)}

---

## ✍️ Typography System
${formatTypographySystem(data.typography, variableMap)}

---

## 📐 Spacing System
${formatSpacingSystem(data.spacingScale)}

---

## 🏗️ Layout System
${formatLayoutSystem(data.layoutPatterns)}

---

## 📸 Page Screenshots
${formatScreenshots(data.screenshots)}

---

## 🔧 Technical Details

### CSS Variables (${data.cssVariables.length})
${data.cssVariables.length > 0 ? formatCssVariables(data.cssVariables) : 'No CSS variables found.'}

### Source Files
${data.cssRules.map(rule => `- [${rule.url}](${rule.url})`).join('\n')}
  `.trim();
};