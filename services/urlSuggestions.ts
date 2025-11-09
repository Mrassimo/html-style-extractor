export interface UrlSuggestion {
  url: string;
  label: string;
  category: 'popular' | 'recent' | 'design' | 'tech';
}

// Popular websites that people often analyze for design systems
const POPULAR_SITES: UrlSuggestion[] = [
  { url: 'https://stripe.com', label: 'Stripe (Payment)', category: 'popular' },
  { url: 'https://apple.com', label: 'Apple (Tech)', category: 'popular' },
  { url: 'https://github.com', label: 'GitHub (Development)', category: 'popular' },
  { url: 'https://airbnb.com', label: 'Airbnb (Travel)', category: 'popular' },
  { url: 'https://shopify.com', label: 'Shopify (E-commerce)', category: 'popular' },
  { url: 'https://notion.so', label: 'Notion (Productivity)', category: 'popular' },
  { url: 'https://motherduck.com', label: 'MotherDuck (Database)', category: 'tech' },
  { url: 'https://linear.app', label: 'Linear (Project Mgmt)', category: 'tech' },
  { url: 'https://vercel.com', label: 'Vercel (Hosting)', category: 'tech' },
  { url: 'https://www.figma.com', label: 'Figma (Design)', category: 'design' },
  { url: 'https://dribbble.com', label: 'Dribbble (Design)', category: 'design' },
  { url: 'https://www.intercom.com', label: 'Intercom (Customer Service)', category: 'design' },
  { url: 'https://www.tailwindcss.com', label: 'Tailwind CSS (Framework)', category: 'design' },
  { url: 'https://www.squarespace.com', label: 'Squarespace (Website Builder)', category: 'design' },
  { url: 'https://www.headlessui.com', label: 'Headless UI (Components)', category: 'design' },
  { url: 'https://mui.com', label: 'Material-UI (React)', category: 'design' },
  { url: 'https://chakra-ui.com', label: 'Chakra UI (React)', category: 'design' },
  { url: 'https://react-bootstrap.github.io', label: 'React Bootstrap', category: 'design' },
  { url: 'https://www.mongodb.com', label: 'MongoDB (Database)', category: 'tech' },
  { url: 'https://www.twilio.com', label: 'Twilio (Communications)', category: 'tech' },
  { url: 'https://www.segment.com', label: 'Segment (Analytics)', category: 'tech' },
  { url: 'https://www.datadog.com', label: 'Datadog (Monitoring)', category: 'tech' },
  { url: 'https://www.hashicorp.com', label: 'HashiCorp (DevTools)', category: 'tech' },
  { url: 'https://www.cloudflare.com', label: 'Cloudflare (CDN)', category: 'tech' },
  { url: 'https://www.netlify.com', label: 'Netlify (Hosting)', category: 'tech' },
  { url: 'https://www.spotify.com', label: 'Spotify (Music)', category: 'popular' },
  { url: 'https://www.netflix.com', label: 'Netflix (Streaming)', category: 'popular' },
  { url: 'https://www.amazon.com', label: 'Amazon (E-commerce)', category: 'popular' },
  { url: 'https://www.medium.com', label: 'Medium (Blogging)', category: 'popular' },
  { url: 'https://www.linkedin.com', label: 'LinkedIn (Professional)', category: 'popular' },
  { url: 'https://www.twitter.com', label: 'X (Social)', category: 'popular' },
  { url: 'https://www.instagram.com', label: 'Instagram (Social)', category: 'popular' },
  { url: 'https://www.facebook.com', label: 'Facebook (Social)', category: 'popular' },
];

// Store recently used URLs in localStorage
const RECENT_URLS_KEY = 'html-extractor-recent-urls';
const MAX_RECENT_URLS = 10;

export const getUrlSuggestions = (): UrlSuggestion[] => {
  const suggestions: UrlSuggestion[] = [...POPULAR_SITES];

  // Add recent URLs from localStorage
  try {
    const recentUrls = JSON.parse(localStorage.getItem(RECENT_URLS_KEY) || '[]');
    const validRecentUrls = recentUrls
      .filter((item: { url: string; timestamp: number }) =>
        item.url && typeof item.url === 'string' && item.url.length > 0
      )
      .sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_URLS)
      .map((item: { url: string; timestamp: number }) => ({
        url: item.url,
        label: new URL(item.url).hostname,
        category: 'recent' as const
      }));

    suggestions.push(...validRecentUrls);
  } catch (error) {
    console.warn('Failed to load recent URLs:', error);
  }

  return suggestions;
};

export const addRecentUrl = (url: string): void => {
  try {
    const recentUrls = JSON.parse(localStorage.getItem(RECENT_URLS_KEY) || '[]');

    // Remove existing entry if it exists
    const filteredUrls = recentUrls.filter((item: { url: string; timestamp: number }) => item.url !== url);

    // Add new entry at the beginning
    filteredUrls.unshift({
      url,
      timestamp: Date.now()
    });

    // Keep only the most recent ones
    const limitedUrls = filteredUrls.slice(0, MAX_RECENT_URLS);

    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(limitedUrls));
  } catch (error) {
    console.warn('Failed to save recent URL:', error);
  }
};

export const filterSuggestions = (suggestions: UrlSuggestion[], query: string): UrlSuggestion[] => {
  if (!query.trim()) {
    return suggestions.slice(0, 8); // Show first 8 when no query
  }

  const lowerQuery = query.toLowerCase();

  // Enhanced fuzzy matching with partial character matching
  return suggestions
    .map(suggestion => {
      const urlLower = suggestion.url.toLowerCase();
      const labelLower = suggestion.label.toLowerCase();
      const categoryLower = suggestion.category.toLowerCase();

      // Direct inclusion matches
      const urlMatch = urlLower.includes(lowerQuery);
      const labelMatch = labelLower.includes(lowerQuery);
      const categoryMatch = categoryLower.includes(lowerQuery);

      // Fuzzy character matching - check if query characters appear in order
      const fuzzyUrlMatch = fuzzyMatch(lowerQuery, urlLower);
      const fuzzyLabelMatch = fuzzyMatch(lowerQuery, labelLower);

      // Calculate relevance score
      let score = 0;
      if (urlMatch) score += 10; // Direct URL matches are most relevant
      if (labelMatch) score += 8; // Direct label matches are very relevant
      if (categoryMatch) score += 3; // Category matches are less relevant

      // Fuzzy matches get lower scores but still show up
      if (fuzzyUrlMatch) score += 5;
      if (fuzzyLabelMatch) score += 4;

      // Bonus for exact matches
      if (urlLower === lowerQuery) score += 20;
      if (labelLower === lowerQuery) score += 15;

      // Bonus for starts with
      if (urlLower.startsWith(lowerQuery)) score += 6;
      if (labelLower.startsWith(lowerQuery)) score += 5;

      // Bonus for word boundary matches
      if (urlLower.includes(`.${lowerQuery}`) || urlLower.includes(`//${lowerQuery}`)) score += 4;
      if (labelLower.includes(` ${lowerQuery}`)) score += 3;

      return { suggestion, score };
    })
    .filter(item => item.score > 0) // Only show matching suggestions
    .sort((a, b) => b.score - a.score) // Sort by relevance
    .slice(0, 8) // Limit to 8 results
    .map(item => item.suggestion);
};

// Helper function for fuzzy character matching
function fuzzyMatch(query: string, text: string): boolean {
  if (query.length === 0) return true;
  if (text.length === 0) return false;

  let queryIndex = 0;
  let textIndex = 0;

  while (queryIndex < query.length && textIndex < text.length) {
    if (query[queryIndex] === text[textIndex]) {
      queryIndex++;
    }
    textIndex++;
  }

  return queryIndex === query.length;
}