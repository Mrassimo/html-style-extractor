# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HTML Style Extractor is a React-based web application that analyses websites and extracts their complete design system for LLM consumption. The application performs deep style analysis, captures screenshots, and generates comprehensive markdown reports optimized for AI-driven UI replication.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run smoke tests
npm run test:smoke
```

## Architecture

### Core Application Structure

- **Entry point**: `index.tsx` → `App.tsx`
- **Component-based architecture**: All UI components in `/components/`
- **Service layer**: Business logic in `/services/`
- **Type definitions**: Centralized in `types.ts`

### Key Services

1. **extractorService.ts**: Core analysis engine that fetches and parses CSS/HTML from target URLs
2. **markdownFormatter.ts**: Converts extracted data into LLM-optimized markdown reports
3. **pageDiscoveryService.ts**: Identifies important pages for screenshot capture
4. **promptGenerator.ts**: Creates AI-ready prompts for design replication
5. **geminiService.ts**: Optional AI analysis integration

### Data Flow

1. User enters URLs via `UrlInputForm`
2. `extractorService` fetches and analyses styles using CORS proxy
3. Screenshots captured via Edge Function (`api/screenshot.ts`) using ScreenshotOne API
4. Results formatted by `markdownFormatter` and displayed in `ResultsDisplay`
5. AI prompts generated in `PromptsGuide` component

## Key Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with MotherDuck design system
- **Deployment**: Vercel Edge Functions
- **External APIs**: ScreenshotOne (screenshots), corsproxy.io (CORS proxy)

## Environment Configuration

### Required Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_CORS_PROXY_URL=https://corsproxy.io/?
VITE_SCREENSHOT_API=/api/screenshot
SCREENSHOTONE_ACCESS_KEY=your_screenshotone_key  # For Edge Function
```

### Local Development Setup

1. Copy `.env.local.example` to `.env.local` (if it exists)
2. Configure environment variables
3. Run `npm run dev`
4. Application available at `http://localhost:3000`

## Design System

The application uses the MotherDuck design system with CSS custom properties:
- Colors: `--md-primary`, `--md-secondary`, `--md-accent`, etc.
- Typography: `--md-font-*` variables
- Spacing: `--md-space-*` variables
- Components follow consistent BEM-like naming with `md-` prefix

## Key Features & Implementation

### Style Analysis Engine
- Extracts color palettes with frequency counts
- Analyses typography (fonts, sizes, weights, line heights)
- Identifies spacing patterns and layout systems (Flexbox/Grid)
- Parses CSS variables and complete CSS rules
- Handles CORS limitations via proxy service

### Screenshot System
- Edge Function for server-side screenshot capture
- Fallback to placeholder images when external services fail
- Full-page screenshots at 1440x900 viewport
- Cached responses with appropriate headers

### LLM Integration
- Generates comprehensive markdown reports
- Provides step-by-step AI prompts for design replication
- Structured output format for optimal AI consumption
- Copy-to-clipboard functionality for easy workflow integration

## Testing

The project includes smoke tests in `scripts/smoke-check.cjs` that verify:
- Production build completion
- Application startup functionality
- Critical UI element rendering

## Deployment

Designed for Vercel deployment with:
- Zero configuration required
- Edge Function runtime for screenshot API
- Static site generation for main application
- Automatic environment variable handling