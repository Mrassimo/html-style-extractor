export interface Screenshot {
  url: string;
  label: string;
}

export interface StyleData {
  pageTitle: string;
  pageUrl: string;
  stylesheetCount: number;
  inlineStyleCount: number;
  inaccessibleSheets: number;
  colorPalette: [string, number][];
  typography: {
    fontFamilies: [string, number][];
    fontSizes: [string, number][];
    fontWeights: [string, number][];
    lineHeights: [string, number][];
  };
  spacingScale: [string, number][];
  layoutPatterns: {
    flex: { selector: string, properties: string[] }[];
    grid: { selector: string, properties: string[] }[];
  };
  cssVariables: [string, string][];
  cleanHtml: string;
  headContent: string;
  cssRules: { url: string; content: string }[];
  screenshots: Screenshot[];
  generatedInlineCss: string;
}