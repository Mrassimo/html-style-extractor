# CLAUDE.md

## Project Overview

This app is currently optimized for "HTML Style Extractor for LLMs" (remote URL-based design analysis).
The next iteration is to support a full inline-style refactor workflow:
- Paste arbitrary HTML with inline styles.
- Generate:
  - Cleaned HTML output (inline styles removed, classes applied).
  - Deduplicated CSS classes (configurable prefix).
  - QoL utilities (copy, clear, etc).

This file is a placeholder for coordination and is intentionally minimal. The actual implementation changes will be made in:
- [`App.tsx`](App.tsx)
- [`components/ResultsDisplay.tsx`](components/ResultsDisplay.tsx)
- [`services/extractorService.ts`](services/extractorService.ts)
- [`types.ts`](types.ts)