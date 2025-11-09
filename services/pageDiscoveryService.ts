interface DiscoveredPage {
  url: string;
  title: string;
  type: 'main' | 'navigation' | 'important' | 'content';
  priority: number;
}

const CORS_PROXY =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_CORS_PROXY_URL) ||
  'https://corsproxy.io/?';

/**
 * Discover important pages from a website automatically
 * Returns the main URL plus top 3 most important pages
 */
export const discoverImportantPages = async (mainUrl: string): Promise<string[]> => {
  try {
    // Normalize the main URL
    const normalizedUrl = mainUrl.startsWith('http') ? mainUrl : `https://${mainUrl}`;
    const urlObj = new URL(normalizedUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

    // Fetch the main page HTML
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(normalizedUrl)}`);
    if (!response.ok) {
      console.warn('Failed to fetch page for discovery, using main URL only');
      return [normalizedUrl];
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Extract all links and score them
    const pages = extractAndScoreLinks(doc, baseUrl, normalizedUrl);

    // Sort by priority and take top 3
    const topPages = pages
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map(page => page.url);

    // Return main URL + discovered pages (max 4 total)
    return [normalizedUrl, ...topPages];

  } catch (error) {
    console.warn('Page discovery failed, using main URL only:', error);
    const normalizedUrl = mainUrl.startsWith('http') ? mainUrl : `https://${mainUrl}`;
    return [normalizedUrl];
  }
};

/**
 * Extract links from the page and score their importance
 */
const extractAndScoreLinks = (doc: Document, baseUrl: string, currentUrl: string): DiscoveredPage[] => {
  const pages: DiscoveredPage[] = [];
  const seenUrls = new Set<string>();

  // Get page title for context
  const pageTitle = doc.title?.toLowerCase() || '';

  // Helper to normalize and check if URL should be included
  const shouldIncludeUrl = (url: string): string | null => {
    try {
      const absoluteUrl = new URL(url, baseUrl).href;

      // Skip if already seen
      if (seenUrls.has(absoluteUrl)) return null;
      seenUrls.add(absoluteUrl);

      // Skip if different domain
      const urlObj = new URL(absoluteUrl);
      const baseObj = new URL(baseUrl);
      if (urlObj.hostname !== baseObj.hostname) return null;

      // Skip current page
      if (absoluteUrl === currentUrl) return null;

      // Skip common non-content pages
      const skipPatterns = [
        /\/login/i,
        /\/register/i,
        /\/signup/i,
        /\/cart/i,
        /\/checkout/i,
        /\/account/i,
        /\/profile/i,
        /\/admin/i,
        /\/dashboard/i,
        /\/settings/i,
        /\/logout/i,
        /\.pdf$/i,
        /\.jpg$/i,
        /\.png$/i,
        /\.gif$/i,
        /\.zip$/i,
        /mailto:/i,
        /tel:/i,
        /javascript:/i,
        /#/i
      ];

      if (skipPatterns.some(pattern => pattern.test(absoluteUrl))) {
        return null;
      }

      return absoluteUrl;
    } catch {
      return null;
    }
  };

  // Extract navigation links (highest priority)
  const navSelectors = [
    'nav a[href]',
    '.navigation a[href]',
    '.nav a[href]',
    '.menu a[href]',
    '.navbar a[href]',
    'header a[href]',
    '.header a[href]'
  ];

  navSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach((link) => {
      const href = link.getAttribute('href');
      const text = link.textContent?.trim() || '';
      const url = shouldIncludeUrl(href || '');

      if (url && text) {
        pages.push({
          url,
          title: text,
          type: 'navigation',
          priority: calculateNavigationPriority(text, pageTitle)
        });
      }
    });
  });

  // Extract important content links (medium priority)
  const importantSelectors = [
    'main a[href]',
    '.main a[href]',
    '.content a[href]',
    'article a[href]',
    '.hero a[href]',
    '.featured a[href]',
    'h1 a[href]',
    'h2 a[href]',
    'h3 a[href]'
  ];

  importantSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach((link) => {
      const href = link.getAttribute('href');
      const text = link.textContent?.trim() || '';
      const url = shouldIncludeUrl(href || '');

      if (url && text) {
        pages.push({
          url,
          title: text,
          type: 'important',
          priority: calculateContentPriority(text, pageTitle)
        });
      }
    });
  });

  // Extract remaining links (lower priority)
  doc.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const text = link.textContent?.trim() || '';
    const url = shouldIncludeUrl(href || '');

    if (url && text) {
      pages.push({
        url,
        title: text,
        type: 'content',
        priority: calculateGeneralPriority(text, pageTitle)
      });
    }
  });

  return pages;
};

/**
 * Calculate priority score for navigation links
 */
const calculateNavigationPriority = (text: string, pageTitle: string): number => {
  const lowerText = text.toLowerCase();
  let score = 50; // Base score for navigation links

  // High-value navigation items
  const highValueTerms = [
    'home', 'about', 'services', 'products', 'features', 'pricing',
    'contact', 'portfolio', 'solutions', 'demo', 'tour', 'overview'
  ];

  // Medium-value navigation items
  const mediumValueTerms = [
    'blog', 'news', 'resources', 'documentation', 'help', 'support',
    'team', 'company', 'careers', 'clients', 'testimonials'
  ];

  if (highValueTerms.some(term => lowerText.includes(term))) {
    score += 30;
  } else if (mediumValueTerms.some(term => lowerText.includes(term))) {
    score += 15;
  }

  // Prefer shorter, cleaner text
  if (lowerText.length <= 20) score += 10;
  if (lowerText.length <= 10) score += 5;

  // Deduct for less valuable terms
  const lowValueTerms = ['privacy', 'terms', 'legal', 'sitemap', 'rss'];
  if (lowValueTerms.some(term => lowerText.includes(term))) {
    score -= 20;
  }

  return Math.max(0, score);
};

/**
 * Calculate priority score for content links
 */
const calculateContentPriority = (text: string, pageTitle: string): number => {
  const lowerText = text.toLowerCase();
  let score = 30; // Base score for content links

  // High-value content terms
  const highValueTerms = [
    'getting started', 'tutorial', 'guide', 'how to', 'introduction',
    'overview', 'features', 'benefits', 'advantages', 'comparison'
  ];

  if (highValueTerms.some(term => lowerText.includes(term))) {
    score += 25;
  }

  // Prefer content that seems comprehensive
  if (lowerText.length > 10 && lowerText.length <= 50) {
    score += 10;
  }

  return Math.max(0, score);
};

/**
 * Calculate priority score for general links
 */
const calculateGeneralPriority = (text: string, pageTitle: string): number => {
  const lowerText = text.toLowerCase();
  let score = 10; // Base score for general links

  // Small bonus for meaningful text
  if (lowerText.length > 5 && lowerText.length <= 30) {
    score += 5;
  }

  return Math.max(0, score);
};