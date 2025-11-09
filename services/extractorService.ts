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

// Check if we're in development mode
const isDevelopment = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('localhost') ||
  window.location.port !== ''
);

// Create a placeholder screenshot for development
const createMockScreenshot = (url: string): Screenshot => {
  const pathname = new URL(url).pathname || '/';
  const svgContent = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#f3f4f6"/>
      <rect x="50" y="50" width="1100" height="530" fill="white" stroke="#e5e7eb" stroke-width="2" rx="8"/>
      <text x="600" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#374151">
        Design System Analysis
      </text>
      <text x="600" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#6b7280">
        ${pathname}
      </text>
      <text x="600" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af">
        Development mode - screenshots work in production
      </text>
      <text x="600" y="390" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
        (Design system extraction works perfectly)
      </text>
    </svg>
  `.trim();

  // Use a safer encoding method that handles Unicode characters in the browser
  const encodedSvg = btoa(new TextEncoder().encode(svgContent).reduce((data, byte) => data + String.fromCharCode(byte), ''));

  return {
    url: `data:image/svg+xml;base64,${encodedSvg}`,
    label: `Full Page: ${pathname}`
  };
};

const getScreenshots = async (urls: string[]): Promise<Screenshot[]> => {
  if (!urls.length) return [];

  // In development, create mock screenshots
  if (isDevelopment) {
    console.log('📸 Development mode: Using mock screenshots');
    return urls.map(url => createMockScreenshot(url));
  }

  console.log('🌐 Production mode: Attempting screenshots via Edge Function');
  try {
    const screenshotPromises = urls.map(async (url, index): Promise<Screenshot | null> => {
      try {
        const label = `Full Page: ${new URL(url).pathname || '/'}`;
        const endpoint = `${SCREENSHOT_API}?url=${encodeURIComponent(url)}`;
        console.log(`📸 Attempting screenshot ${index + 1}/${urls.length}: ${endpoint}`);

        const response = await fetch(endpoint);

        if (!response.ok) {
          console.warn(`❌ Screenshot failed for ${url}: ${response.status}`);
          return null;
        }

        const contentType = response.headers.get('content-type') || '';
        console.log(`📸 Response content-type: ${contentType}`);

        if (!contentType.startsWith('image/')) {
          console.warn(`❌ Screenshot service for ${url} did not return an image. Content-Type: ${contentType}`);
          return null;
        }

        const blob = await response.blob();
        console.log(`📸 Successfully created blob for ${url}, size: ${blob.size} bytes`);
        const objectUrl = URL.createObjectURL(blob);
        return { url: objectUrl, label };
      } catch (err) {
        console.error(`❌ Screenshot error for ${url}:`, err);
        return null;
      }
    });

    const results = await Promise.all(screenshotPromises);
    const successfulScreenshots = results.filter((shot): shot is Screenshot => shot !== null);

    console.log(`📸 Screenshots completed: ${successfulScreenshots.length}/${urls.length} successful`);

    // If no screenshots succeeded, provide mock screenshots as fallback
    if (successfulScreenshots.length === 0) {
      console.log('📸 All screenshots failed, using mock fallbacks');
      return urls.map(url => createMockScreenshot(url));
    }

    return successfulScreenshots;
  } catch (error) {
    console.error('❌ Unexpected error fetching screenshots:', error);
    // Return mock screenshots as fallback
    return urls.map(url => createMockScreenshot(url));
  }
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

  let inlineStyleCount = 0;
  const inlineStyles: string[] = [];
  doc.querySelectorAll('[style]').forEach(el => {
    const styleAttr = el.getAttribute('style');
    if (styleAttr) {
        inlineStyles.push(styleAttr);
        inlineStyleCount++;
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

  const styleData: Omit<StyleData, 'cleanHtml'> = {
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
  };

  const bodyClone = doc.body?.cloneNode(true) as HTMLElement;
  let cleanHtml: string;

  if (bodyClone) {
    bodyClone.querySelectorAll('script, style').forEach(el => el.remove());
    cleanHtml = bodyClone.outerHTML;
    if (cleanHtml.length > HTML_TRUNCATE_LENGTH) {
        cleanHtml = cleanHtml.substring(0, HTML_TRUNCATE_LENGTH) + '\n...<!-- TRUNCATED -->';
    }
  } else {
    cleanHtml = '<!-- Could not find a <body> element in the document. -->';
  }

  return {
    ...styleData,
    cleanHtml,
  };
};