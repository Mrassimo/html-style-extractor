```markdown
# MotherDuck Replica – UI Style Guide

File: `styles.md`  
Source: Single-file HTML replica provided (MotherDuck.com-inspired)

---

## 1. Overview – Design Philosophy

The MotherDuck-inspired UI is:

- Playfully serious: friendly illustrations and bright accents on a clean, precise layout.
- Content-first: generous whitespace, clear hierarchy, and compact navigation.
- Systematic: consistent scales for color, typography, spacing, and radius.
- Robustly simple: minimal visual noise, subtle shadows, gentle borders, and rounded shapes.
- Responsive: same visual language from mobile to desktop with fluid stacking.

This style guide documents the tokens and patterns to keep implementations visually consistent and as pixel-perfect to the replica as possible.

---

## 2. Color Palette

Primary neutral + brand accents derived from the replicated HTML.

### Core

- `#383838` — Primary text, icons, outlines, logo.
- `#000000` — High-contrast elements, subtle in icons/lines.
- `#ffffff` — Cards, panels, surfaces, hero video card, clouds.
- `#f4efea` — Main page background; warm neutral base.
- `#f8f8f7` — Subtle alternate background; soft sections.
- `#f1f1f1` — Very light neutral for subtle dividers (footer / inputs).

### Brand / Accent

- `#ff9538` — Primary CTA button background (START FREE), duck orange.
- `#ffb26a` — Hover state variant for orange CTA.
- `#ffde00` — Highlight / promo / banner background, book highlight.
- `#6fc2ff` — Large CTA band background, sky accent.
- `#2ba5ff` — Focus & accent blue (inputs focus ring).
- `#ebf9ff` — Light blue panel background (rare / supporting).
- `#53dbc9` — Success/active dot (e.g., hero demo pill).
- `#16aa98` — Decorative green (badges/shapes in hero artwork).

### Supporting / Semantic (subtle use)

- `#a1a1a1` — Secondary text, labels, muted nav.
- `#555555` — Body copy in sections; slightly softer than main text.
- `#768390` — Footer secondary text.
- `#adbac7` — Footer body text color.
- `#22272e` — Dark footer background.
- `#38383815` — Ultra-light border for cards (`rgba(56,56,56,0.08–0.1)` feel).

### Usage Summary

- Backgrounds:
  - Page: `#f4efea`
  - Alternating sections: `#f8f8f7`, `#6fc2ff`, `#22272e`
  - Cards: `#ffffff`
  - Promo banner/top eyebrow: `#ffde00`
- Text:
  - Primary: `#383838`
  - Secondary: `#555555` / `#a1a1a1`
  - Inverted (dark background): `#ffffff`, `#adbac7`
- CTAs:
  - Primary: `#ff9538` (with black border, dark text)
  - Emphasis: `#ffde00`, `#6fc2ff`
- Borders:
  - Standard hairline: `#38383815`
  - Stronger: `rgba(56,56,56,0.25–0.5)` for checkboxes, pills
- Focus:
  - `#2ba5ff` ring on inputs.

---

## 3. Typography

All mathematical notation in this guide uses $...$.

### Font Families

- Primary:
  - `$--md-font-sans`: `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Secondary / Body Alternative:
  - `$--md-font-alt`: `"Open Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Mono / Eyebrow / Accents:
  - `$--md-font-mono`: `"Aeonik Mono", "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

Use:

- Headings, nav, buttons: `Inter`
- Long-form text, footer: `Open Sans` or `Inter` (consistent with replica)
- Kicker/eyebrow labels: `Aeonik Mono`-style mono where available.

### Type Scale (Key Sizes)

From replica and token usage; apply consistently.

- Hero:
  - H1: $32$–$72$ px (desktop: $72$ px, mobile: $32$–$40$ px), $fw:700$, $lh:1.05$
  - Hero subtitle: $18$ px, $fw:400$, $lh:1.5$
  - Hero kicker: $11$ px, uppercase, $ls:0.16em$
- Section titles:
  - H2: $26$–$40$ px, $fw:700$, $lh:1.2$–$1.3$
  - H3: $18$–$24$ px, $fw:700$
- Body:
  - Primary body: $14$–$16$ px, $fw:400$, $lh:1.4$–$1.6$
  - Helper / muted: $13$ px, $fw:300$–$400$
- UI / Meta:
  - Nav links, button labels: $10$–$11$ px, uppercase, $ls:0.06$–$0.12em$, $fw:500$–$600$
  - Footnotes / footer: $11$–$13$ px

### Weights

- $300$ — Light secondary text.
- $400$ — Default body.
- $500$–$600$ — Nav, labels, some buttons.
- $700$ — Headings, key labels.

### Line Heights

- Headings: $1.05$–$1.2$
- Body & subtitles: $1.4$–$1.6$
- Tight labels/nav: $1.2$

---

## 4. Spacing System

Core spacing tokens (from CSS usage and replica):

- `$--space-4`: $4$ px
- `$--space-8`: $8$ px
- `$--space-12`: $12$ px
- `$--space-16`: $16$ px
- `$--space-20`: $20$ px
- `$--space-24`: $24$ px
- `$--space-32`: $32$ px
- `$--space-40`: $40$ px
- `$--space-64`: $64$ px
- `$--space-80`: $80$ px
- `$--space-120`: $120$ px

Usage:

- Micro gaps (icon-text, pill contents): $4$–$8$ px
- Between stacked labels / headings / text: $8$–$16$ px
- Card padding: $16$–$24$ px
- Grid gaps: $16$–$40$ px depending on section
- Section vertical padding:
  - Standard: $40$–$80$ px
  - Hero / major bands: $64$–$120$ px

Always align to these steps; avoid ad-hoc values.

---

## 5. Component Styles

### 5.1 Buttons

Base characteristics:

- Uppercase labels, small caps feel.
- High contrast outlines.
- Rounded pill or soft-rounded rectangles.
- Slight elevation; stronger for primary CTAs.

#### Primary CTA (Orange)

Class reference: `.btn-primary`

- Background: `#ff9538`
- Text: `#383838`
- Border: `1px solid #383838`
- Radius: `var(--md-radius-pill)` (fully pill-shaped)
- Padding: `10px 18px`
- Font: $11$ px, $fw:600$, $ls:0.08em$, uppercase
- Shadow:
  - Default: `0 10px 24px rgba(0,0,0,0.16)`
  - Hover: `0 14px 32px rgba(0,0,0,0.2)`
- Hover:
  - Background: `#ffb26a`
  - Slight translateY(-1px)

Usage: Primary actions (Start Free / Try Free).

#### Secondary CTA (White)

Class reference: `.btn-secondary`

- Background: `#ffffff`
- Text: `#383838`
- Border: `1px solid #383838`
- Radius: `var(--md-radius-pill)`
- Padding: `10px 16px`
- Font: $11$ px, $fw:500$, uppercase
- Shadow:
  - `0 10px 24px rgba(0,0,0,0.12)`
- Hover:
  - Background: `#f8f8f7`
  - Stronger shadow, slight lift.

Usage: Secondary hero actions (Learn More).

#### Ghost / Outline Button

Class reference: `.btn-ghost`

- Background: transparent
- Text: `#383838`
- Border: `1px solid rgba(56,56,56,0.3)`
- Radius: `var(--md-radius-pill)`
- Padding: `9px 14px`
- Font: $11$ px, $fw:500$, uppercase
- Hover:
  - Background: `#ffffff`
  - Shadow: `0 8px 18px rgba(0,0,0,0.06)`

Usage: Tertiary actions (Log In, Book a Demo, etc.).

#### Disabled Promo Submit

Class reference: `.book-submit`

- Inherits primary style (yellow/orange style) but:
  - `opacity: 0.45`
  - `cursor: not-allowed`
  - No hover transform.

### 5.2 Navigation Pills

Class reference: `.md-nav-group`, `.md-nav-link`

- Background:
  - Default: transparent
  - Hover: `#ffffffee`
- Text: `#383838`
- Radius: `var(--md-radius-pill)`
- Padding: ~`10px 12px` (group), `8px 10px` (link)
- Font: $11$ px, $ls:0.06em$, uppercase
- Icon: 16px chevron down
- Shadow on hover: `0 8px 20px rgba(0,0,0,0.06)`

### 5.3 Cards

Includes hero video card, "Why it's better" cards, "Who is it for?" cards, book banner.

Common traits:

- Background: `#ffffff`
- Border:
  - Primary: `1px solid #38383815`
  - Hover (select cards): darker `rgba(56,56,56,0.25)`
- Radius:
  - Standard card: $18$–$24$ px
- Padding:
  - $16$–$32$ px depending on prominence
- Shadow:
  - Base: `var(--md-shadow-soft)`
- Behavior:
  - Interactive cards (.who-card, .why-card):
    - Hover: translateY(-2px to -3px), stronger shadow.

Specific:

- `.hero-video-card`: larger radius ($24$ px), thumbnail/video inside.
- `.why-card`: small illustration/thumb on top, concise text.
- `.who-card`: image block + title + caption; strong hover state.

### 5.4 Inputs

Class reference: `.book-input`

- Background: `#ffffff`
- Text: `#383838`
- Placeholder: `#a1a1a1` (if used)
- Border: `1px solid #dcdcdc`
- Radius: `12px`
- Padding: `11px 12px`
- Font: $14$ px, $fw:400$
- Focus:
  - Border: `#2ba5ff`
  - Shadow: `0 0 0 3px rgba(43,165,255,0.18)`

### 5.5 Checkboxes

Custom checkboxes in book form.

- Hidden `<input>` + styled box `.md-check-box`
- Box:
  - Size: $16 \times 16$ px
  - Radius: $5$ px
  - Border: `1px solid #383838`
  - Background: `#ffffff`
- Checked:
  - Background: `#ffde00`
- Label:
  - Font: $12$ px
  - Color: `#555555`
  - Left/right gap: $6$ px

---

## 6. Shadows

Used minimally for elevation and emphasis.

Defined:

- `--md-shadow-soft`:
  - `0 12px 32px rgba(0,0,0,0.08)` (cards, hero video)
- Buttons:
  - Primary default: `0 10px 24px rgba(0,0,0,0.16)`
  - Primary hover: `0 14px 32px rgba(0,0,0,0.20)`
  - Secondary default: `0 10px 24px rgba(0,0,0,0.12)`
  - Ghost / nav-hover: `0 8px 18px rgba(0,0,0,0.06)`
- Header / eyebrow:
  - Subtle: `0 1px 0 rgba(0,0,0,0.06)`
- Clouds / playful elements:
  - Occasionally: `0 4px 0 #383838` outline-like.

Guidelines:

- Use softer, wide shadows for large surfaces.
- Use smaller, sharper shadows for interactive, clickable UI.
- Avoid stacking multiple different shadows on same element.

---

## 7. Border Radius

Soft, friendly rounding across all components.

Tokens:

- `--md-radius-lg`: $18$ px
- `--md-radius-md`: $14$ px
- `--md-radius-sm`: $10$ px
- `--md-radius-pill`: $999$ px (pills, buttons)

Usage:

- Cards: $18$–$24$ px
- Images/thumbnails: $14$ px
- Inputs: $12$ px (near `--md-radius-md`)
- Checkboxes: $5$ px (tighter, still soft)
- Pills / buttons / nav chips: `--md-radius-pill` for full round.

---

## 8. Layout Grid & Breakpoints

### Container

- `.md-container` (or equivalent main containers):
  - `max-width: 1200px` (content core)
  - For some header / hero: up to `1320px` to align with nav / banner.
  - Horizontal padding:
    - Desktop: $24$–$32$ px
    - Tablet: $20$–$24$ px
    - Mobile: $16$–$24$ px

### Sections

- Hero:
  - Two-column grid:
    - Left: text (approx $1.6$ fr)
    - Right: media (approx $1.5$ fr)
  - Centered within `max-width:1200px`
- "Why it's better":
  - 2-column: text (left) + 2x2 card grid (right)
- "Who is it for?":
  - 3-column card grid on desktop.
- Footer:
  - 4-column grid on desktop (2fr + 1fr + 1fr + 1fr).

### Breakpoints

From responsive rules in the replica:

1. Large / Desktop:
   - $\ge 1024$ px
   - Full nav visible; hero 2-column; cards in 3-row/2-row layouts.

2. Medium / Tablet:
   - $\le 1024$ px:
     - Slightly adjusted hero grid but still two-column where possible.
     - Fonts scaled down (hero to $56$ px).

3. Small / Mobile:
   - $\le 860$ px:
     - Collapsed nav (`.md-menu-toggle` visible, nav/CTA hidden).
     - Hero stacks: media above text.
     - Book banner, why-section: 1 column.
     - Who cards: 1 column.
     - Footer: 1–2 columns.

4. Extra Small:
   - $\le 560$ px:
     - Tighter paddings.
     - Hero H1: $32$–$36$ px.
     - Single-column footer.

Guidelines:

- Always center content within the container widths.
- Use CSS Grid / Flexbox for clean alignments.
- Keep vertical rhythm consistent using spacing tokens.

---

This `styles.md` describes the visual system that underpins the MotherDuck replica HTML. Use these tokens and patterns as the single source of truth when extending or implementing new pages to maintain pixel-perfect consistency.
```