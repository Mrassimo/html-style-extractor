import { StyleData, Screenshot } from '../types';
import { discoverImportantPages } from './pageDiscoveryService';

const CORS_PROXY =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_CORS_PROXY_URL) ||
  'https://corsproxy.io/?';

const SCREENSHOT_API =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_SCREENSHOT_API) ||
  '/api/screenshot';
const HTML_TRUNCATE_LENGTH = 50000;
const CSS_RULES_TRUNCATE_LENGTH = 20000;

// Helper to count frequencies in an array and return sorted entries
const countAndSort = (items: string[]): [string, number][] => {
  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).sort(([, a], [, b]) => b - a);
};

// A more robust CSS parser that can handle simple nesting (like media queries)
function parseCssRules(css: string): { selector: string, declarations: string }[] {
    const rules: { selector: string, declarations: string }[] = [];
    const ruleRegex = /([^{}]+)\s*\{([^}]+)\}/g;
    const flattenedCss = css.replace(/@media[^{]+\{([\s\S]+?})\s*}/g, (_, body) => body);

    let match;
    while ((match = ruleRegex.exec(flattenedCss)) !== null) {
        const selector = match[1].trim();
        const declarations = match[2].trim();
        if (selector && declarations && !selector.startsWith('@')) {
            rules.push({ selector, declarations });
        }
    }
    return rules;
}

// Parse layout patterns from CSS text
const parseLayoutPatterns = (cssText: string) => {
  const layoutPatterns: { flex: { selector: string, properties: string[] }[], grid: { selector: string, properties: string[] }[] } = { flex: [], grid: [] };
  const rules = parseCssRules(cssText);
  
  const layoutProperties = [
    'display', 'flex-direction', 'flex-wrap', 'justify-content', 
    'align-items', 'align-content', 'gap', 'grid-template-columns',
    'grid-template-rows', 'grid-auto-flow'
  ];

  for (const rule of rules) {
    const propertiesStr = rule.declarations;
    if (propertiesStr.includes('display: flex') || propertiesStr.includes('display: inline-flex')) {
        const relevantProps = propertiesStr.split(';')
            .map(p => p.trim())
            .filter(p => layoutProperties.some(lp => p.startsWith(lp) || p.startsWith('flex:')));
        if(relevantProps.length > 0) {
            layoutPatterns.flex.push({ selector: rule.selector, properties: relevantProps });
        }
    }
    if (propertiesStr.includes('display: grid') || propertiesStr.includes('display: inline-grid')) {
        const relevantProps = propertiesStr.split(';')
            .map(p => p.trim())
            .filter(p => layoutProperties.some(lp => p.startsWith(lp)));
        if(relevantProps.length > 0) {
            layoutPatterns.grid.push({ selector: rule.selector, properties: relevantProps });
        }
    }
  }
  return layoutPatterns;
};

// We no longer generate placeholders. We only use real screenshots.
// If something fails, we just skip that screenshot entry.

const getScreenshots = async (urls: string[]): Promise<Screenshot[]> => {
  if (!urls.length) return [];

  const screenshots: Screenshot[] = [];

  for (const url of urls) {
    try {
      const endpoint = `${SCREENSHOT_API}?url=${encodeURIComponent(url)}`;
      console.log('📸 Requesting screenshot:', endpoint);

      const res = await fetch(endpoint);

      if (!res.ok) {
        console.warn('❌ Screenshot request failed', {
          url,
          status: res.status,
          statusText: res.statusText,
        });
        // Do not add placeholder; just skip.
        continue;
      }

      const contentType = res.headers.get('content-type') || '';

      if (!contentType.startsWith('image/')) {
        const textSample = (await res.text().catch(() => '')).slice(0, 200);
        console.warn('❌ Screenshot response is not an image', {
          url,
          contentType,
          bodySample: textSample,
        });
        // Skip non-image responses.
        continue;
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        console.warn('❌ Empty screenshot blob for', url);
        continue;
      }

      const objectUrl = URL.createObjectURL(blob);
      screenshots.push({
        url: objectUrl,
        label: `Full Page: ${new URL(url).pathname || '/'}`,
      });
    } catch (error) {
      console.error('❌ Error fetching screenshot for', url, error);
      // Skip this one; do not create any fallback.
    }
  }

  console.log(`📸 Screenshot summary: ${screenshots.length}/${urls.length} succeeded`);

  return screenshots;
};

export const extractAllStyles = async (urls: string[]): Promise<StyleData> => {
  const analysisUrl = urls[0];

  // Automatically discover important pages for screenshots
  let screenshotUrls: string[];
  if (urls.length === 1) {
    // Only main URL provided - discover additional pages automatically
    screenshotUrls = await discoverImportantPages(analysisUrl);
  } else {
    // Multiple URLs provided manually - use as-is
    screenshotUrls = urls;
  }

  const htmlResponse = await fetch(`${CORS_PROXY}${encodeURIComponent(analysisUrl)}`);
  const screenshots = await getScreenshots(screenshotUrls);

  if (!htmlResponse.ok) {
    throw new Error(`Failed to fetch URL: ${htmlResponse.statusText} (status: ${htmlResponse.status})`);
  }
  const html = await htmlResponse.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  let fullCssText = '';
  let inaccessibleSheets = 0;
  const fetchedCssRules: { url: string; content: string }[] = [];

  doc.querySelectorAll('style').forEach(style => {
    fullCssText += style.textContent || '';
  });

  const stylesheetPromises = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
    .map(async (link) => {
      const href = link.getAttribute('href');
      if (href) {
        try {
          const stylesheetUrl = new URL(href, analysisUrl).href;
          const res = await fetch(`${CORS_PROXY}${encodeURIComponent(stylesheetUrl)}`);
          if (res.ok) {
            const cssContent = await res.text();
            fullCssText += cssContent;
            fetchedCssRules.push({
              url: stylesheetUrl,
              content: cssContent.length > CSS_RULES_TRUNCATE_LENGTH ? cssContent.substring(0, CSS_RULES_TRUNCATE_LENGTH) + '\n/*...TRUNCATED...*/' : cssContent
            });
          } else {
            inaccessibleSheets++;
          }
        } catch (e) {
          inaccessibleSheets++;
        }
      }
    });

  await Promise.all(stylesheetPromises);

  // New: inline-style-to-class extraction with prefix + class application
  interface InlineStyleExtractionResult {
    cleanedHtml: string;
    generatedCss: string;
    inlineStyleCount: number;
  }

  const extractInlineStylesToClasses = (
    root: HTMLElement,
    classPrefix: string
  ): InlineStyleExtractionResult => {
    const styleToClass = new Map<string, string>();
    const classToStyle = new Map<string, string>();
    let counter = 1;
    let inlineCount = 0;

    const normalizeStyle = (style: string): string => {
      return style
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .sort()
        .join('; ');
    };

    const getOrCreateClassName = (normalized: string): string => {
      const existing = styleToClass.get(normalized);
      if (existing) return existing;
      const className = `${classPrefix}${counter++}`;
      styleToClass.set(normalized, className);
      classToStyle.set(className, normalized);
      return className;
    };

    const walk = (node: Element) => {
      if (node.hasAttribute('style')) {
        const raw = node.getAttribute('style') || '';
        const normalized = normalizeStyle(raw);
        if (normalized) {
          const className = getOrCreateClassName(normalized);
          const existingClass = node.getAttribute('class') || '';
          const classes = existingClass
            .split(/\s+/)
            .filter(Boolean);
          if (!classes.includes(className)) {
            classes.push(className);
          }
          node.setAttribute('class', classes.join(' '));
          node.removeAttribute('style');
          inlineCount++;
        }
      }
      Array.from(node.children).forEach(child => walk(child as Element));
    };

    walk(root);

    const generatedCss = Array.from(classToStyle.entries())
      .map(([cls, decl]) => {
        const safeDecl = decl.endsWith(';') ? decl : decl + ';';
        return `.${cls} { ${safeDecl} }`;
      })
      .join('\n');

    const container = document.createElement('div');
    container.appendChild(root);
    const html = container.innerHTML;

    return {
      cleanedHtml: html,
      generatedCss,
      inlineStyleCount: inlineCount,
    };
  };

  // Use extraction on cloned body
  let inlineStyleCount = 0;
  let generatedInlineCss = '';
  let cleanedBodyHtml = '';

  const bodyClone = doc.body?.cloneNode(true) as HTMLElement | null;
  if (bodyClone) {
    // Remove scripts/styles before processing
    bodyClone.querySelectorAll('script, style').forEach(el => el.remove());
    const { cleanedHtml, generatedCss, inlineStyleCount: count } =
      extractInlineStylesToClasses(bodyClone, 'style-');
    inlineStyleCount = count;
    generatedInlineCss = generatedCss;
    cleanedBodyHtml = cleanedHtml;
  }

  const inlineStyles: string[] = [];
  doc.querySelectorAll('[style]').forEach(el => {
    const styleAttr = el.getAttribute('style');
    if (styleAttr) {
      inlineStyles.push(styleAttr);
    }
  });

  const allCssText = fullCssText + inlineStyles.join(';');

  const colors = allCssText.match(/(#[0-9a-f]{3,8}|rgba?\([\d\s,.]+\)|hsla?\([\d\s%,.]+\))/gi) || [];
  const fontFamilies = allCssText.match(/font-family:\s*([^;\}]+)/gi)?.map(s => s.replace(/font-family:\s*/, '').trim()) || [];
  const fontSizes = allCssText.match(/font-size:\s*([^;\}]+)/gi)?.map(s => s.replace(/font-size:\s*/, '').trim()) || [];
  const fontWeights = allCssText.match(/font-weight:\s*([^;\}]+)/gi)?.map(s => s.replace(/font-weight:\s*/, '').trim()) || [];
  const lineHeights = allCssText.match(/line-height:\s*([^;\}]+)/gi)?.map(s => s.replace(/line-height:\s*/, '').trim()) || [];
  const spacingValues = (allCssText.match(/(margin|padding|gap):[^;\}]+/gi) || [])
    .flatMap(s => s.split(':')[1].trim().split(/\s+/))
    .filter(val => val !== '0' && val !== 'auto' && val !== 'inherit' && val !== 'initial');
    
  const layoutPatterns = parseLayoutPatterns(fullCssText);
  inlineStyles.forEach((style, index) => {
    if (style.includes('display: flex') || style.includes('display: inline-flex')) {
      layoutPatterns.flex.push({ selector: `Inline Style #${index + 1}`, properties: style.split(';') });
    }
    if (style.includes('display: grid') || style.includes('display: inline-grid')) {
      layoutPatterns.grid.push({ selector: `Inline Style #${index + 1}`, properties: style.split(';') });
    }
  });

  const variableMap = new Map<string, string>();
  const varRegex = /--[\w-]+:\s*[^;\}]+/g;
  const rootRegex = /:root\s*\{([^}]+)\}/g;
  let rootMatch;
  while ((rootMatch = rootRegex.exec(allCssText)) !== null) {
      const rootVars = rootMatch[1].match(varRegex);
      if (rootVars) {
        rootVars.forEach(v => {
            const [name, value] = v.split(/:\s*/);
            if(name && value) variableMap.set(name.trim(), value.trim());
        });
      }
  }
  const cssVariables: [string, string][] = Array.from(variableMap.entries());

  const headContent = doc.head?.innerHTML || '';

  // Truncate cleaned HTML safely
  let cleanHtml: string;
  if (cleanedBodyHtml) {
    cleanHtml = cleanedBodyHtml;
    if (cleanHtml.length > HTML_TRUNCATE_LENGTH) {
      cleanHtml =
        cleanHtml.substring(0, HTML_TRUNCATE_LENGTH) +
        '\n...<!-- TRUNCATED -->';
    }
  } else {
    cleanHtml =
      '<!-- Could not find a <body> element in the document. -->';
  }

  const styleData: StyleData = {
    pageTitle: doc.title || 'Untitled Page',
    pageUrl: analysisUrl,
    stylesheetCount: fetchedCssRules.length,
    inlineStyleCount,
    inaccessibleSheets,
    colorPalette: countAndSort(colors.map(c => c.toLowerCase())),
    typography: {
      fontFamilies: countAndSort(fontFamilies),
      fontSizes: countAndSort(fontSizes),
      fontWeights: countAndSort(fontWeights),
      lineHeights: countAndSort(lineHeights),
    },
    spacingScale: countAndSort(spacingValues),
    layoutPatterns,
    cssVariables,
    cssRules: fetchedCssRules,
    headContent,
    screenshots,
    cleanHtml,
    generatedInlineCss,
  };

  return styleData;
};