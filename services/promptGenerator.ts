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

export const generateContextualPrompts = (data: StyleData): { step1: string; step2: string; step3: string } => {
  const primaryColors = data.colorPalette.slice(0, 5).map(([color]) => color).join(', ');
  const mainFont = data.typography.fontFamilies[0]?.[0] || 'Unknown';
  const pageCount = data.screenshots.length;

  return {
    step1: `Help me rebuild the exact same UI design as a single HTML file for "${data.pageTitle}".

I've analyzed ${data.pageUrl} and extracted the complete design system. Here's what I found:

**Design System Summary:**
- **Primary Colors:** ${primaryColors}
- **Main Typography:** ${mainFont}
- **Layout Patterns:** ${data.layoutPatterns.flex.length} flexbox layouts, ${data.layoutPatterns.grid.length} grid layouts
- **Screenshots:** ${pageCount} pages captured for visual reference

**Your Task:**
Create a pixel-perfect replica as a single, self-contained HTML file with embedded CSS. Focus on:
1. **Exact color palette** - Use the extracted colors precisely
2. **Typography hierarchy** - Match font families, sizes, and weights exactly
3. **Spacing and layout** - Replicate margins, padding, and layout patterns
4. **Component styles** - Buttons, cards, forms, navigation elements
5. **Visual details** - Shadows, borders, hover states, transitions

**Important Guidelines:**
- Include all CSS inline in a <style> tag
- Add Google Fonts or other font imports from the head content
- Make it fully functional and interactive
- Ensure responsive design matches the original
- Use semantic HTML5 elements appropriately

I'll provide the complete analysis data including CSS rules, HTML structure, and screenshots. Use this as your primary source of truth to create an exact replica.`,

    step2: `Excellent! Now that you've replicated the "${data.pageTitle}" design, help me create a comprehensive style guide documentation.

Based on the HTML you just created and the original analysis data, generate a detailed style guide that includes:

**1. Design Philosophy**
- Brief overview of the design approach and brand personality
- Key design principles and patterns used

**2. Color System**
- **Primary palette:** ${data.colorPalette.slice(0, 3).map(([color, count]) => `${color} (${count} uses)`).join(', ')}
- **Secondary colors:** ${data.colorPalette.slice(3, 8).map(([color, count]) => `${color} (${count} uses)`).join(', ')}
- **Color usage guidelines** - when and how to use each color
- **Accessibility considerations** - contrast ratios and compliance

**3. Typography System**
- **Font families:** ${data.typography.fontFamilies.slice(0, 3).map(([font, count]) => `${font} (${count} uses)`).join(', ')}
- **Type scale:** ${data.typography.fontSizes.slice(0, 5).map(([size, count]) => `${size} (${count} uses)`).join(', ')}
- **Font weights:** ${data.typography.fontWeights.map(([weight, count]) => `${weight} (${count} uses)`).join(', ')}
- **Line heights:** ${data.typography.lineHeights.map(([height, count]) => `${height} (${count} uses)`).join(', ')}
- **Typography hierarchy** and usage guidelines

**4. Spacing System**
- **Spacing scale:** ${data.spacingScale.slice(0, 8).map(([spacing, count]) => `${spacing} (${count} uses)`).join(', ')}
- **Layout principles** and spacing relationships
- **Component spacing** patterns

**5. Component Library**
Document all reusable components with:
- HTML structure
- CSS classes and styles
- Variations and states
- Usage examples

**6. Layout Patterns**
- **Grid system:** breakpoints and container widths
- **Flexbox patterns:** common layout configurations
- **Responsive behavior:** mobile-first approach

**7. Visual Details**
- **Shadows:** ${data.cssVariables.filter(([name]) => name.includes('shadow')).map(([name, value]) => `${name}: ${value}`).join(', ') || 'Custom shadow values'}
- **Border radius:** ${data.cssVariables.filter(([name]) => name.includes('radius')).map(([name, value]) => `${name}: ${value}`).join(', ') || 'Custom radius values'}
- **Transitions and animations**

Save this comprehensive style guide as "style-guide.md" with clear sections, code examples, and usage guidelines.`,

    step3: `Perfect! Now using the style-guide.md you just created, help me design a new component/page that maintains complete consistency with the "${data.pageTitle}" design system.

**Design Task:**
Create a [dashboard/profile/settings/landing] page that follows the established design language exactly.

**Requirements:**
1. **Strict adherence** to the style guide you just created
2. **Consistent visual language** - same colors, typography, spacing, and patterns
3. **Component reuse** - utilize the documented components and patterns
4. **Responsive design** - follow the established grid and breakpoint system
5. **Interactive elements** - hover states, transitions, and micro-interactions

**Content to Include:**
- Navigation component (consistent with existing)
- Main content area with appropriate sections
- Interactive elements (buttons, forms, cards)
- Footer matching the established pattern

**Deliverables:**
- Single HTML file: "new-page.html"
- Embedded CSS following the style guide exactly
- Fully functional interactions
- Mobile-responsive design

**Key Constraints:**
- Use only the documented colors, fonts, and spacing values
- Follow the established component patterns
- Maintain the same visual hierarchy and layout principles
- Ensure consistency with the original design personality

Create this new page as if it were part of the original website's design system.`
  };
};

export const generateTextOnlyOutput = (data: StyleData): string => {
  const primaryColors = data.colorPalette.slice(0, 5).map(([color]) => color).join(', ');
  const mainFont = data.typography.fontFamilies[0]?.[0] || 'Unknown';
  const pageCount = data.screenshots.length;

  return `# Design System Analysis: ${data.pageTitle}

**Source:** ${data.pageUrl}
**Analysis Date:** ${new Date().toLocaleDateString()}
**Screenshots Captured:** ${pageCount} pages

## Design System Summary

- **Primary Colors:** ${primaryColors}
- **Main Typography:** ${mainFont}
- **Layout Patterns:** ${data.layoutPatterns.flex.length} flexbox layouts, ${data.layoutPatterns.grid.length} grid layouts
- **CSS Variables:** ${data.cssVariables.length} custom properties
- **Stylesheets Analyzed:** ${data.stylesheetCount}

## 🎨 Color Palette
${data.colorPalette.slice(0, 10).map(([color, count]) => `${color}: ${count} occurrences`).join('\n')}

## ✍️ Typography System
**Font Families:** ${data.typography.fontFamilies.slice(0, 5).map(([font, count]) => `${font} (${count} uses)`).join('\n')}
**Font Sizes:** ${data.typography.fontSizes.slice(0, 8).map(([size, count]) => `${size} (${count} uses)`).join('\n')}
**Font Weights:** ${data.typography.fontWeights.map(([weight, count]) => `${weight} (${count} uses)`).join('\n')}

## 📐 Spacing System
${data.spacingScale.slice(0, 10).map(([spacing, count]) => `${spacing}: ${count} occurrences`).join('\n')}

## 🏗️ Layout Patterns
**Flexbox Usage:** ${data.layoutPatterns.flex.length} layouts detected
**Grid Usage:** ${data.layoutPatterns.grid.length} layouts detected

## 🔧 Key CSS Variables
${data.cssVariables.slice(0, 15).map(([name, value]) => `${name}: ${value}`).join('\n')}

## 📋 HTML Structure
\`\`\`html
${data.cleanHtml.slice(0, 2000)}${data.cleanHtml.length > 2000 ? '\n... (truncated for brevity)' : ''}
\`\`\``;
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
