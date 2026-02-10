# DOOMGEN -- Design Document

**Project:** DOOMGEN -- Web-Based ASCII Art Logo Generator in the Style of DOOM
**Date:** 2026-02-10
**Status:** Approved for implementation

---

## 1. Overview

DOOMGEN is a web-based ASCII art logo generator that renders user text into highly detailed, DOOM-styled ASCII art with color gradients, glow effects, dripping animations, and multiple export formats. The application is a fully static single-page app hosted on GitHub Pages with zero backend dependencies.

### Goals

- Generate professional-quality ASCII art logos from user text input
- Apply the DOOM franchise visual aesthetic (fire gradients, red glow, metal textures, drip effects)
- Provide real-time preview with interactive controls
- Export in multiple formats (PNG, SVG, plain text, ANSI, clipboard)
- Host as a static site on GitHub Pages

### Non-Goals

- Image-to-ASCII conversion (text input only)
- User accounts or saved sessions
- Server-side rendering or API endpoints
- Custom font upload (curated list only)

---

## 2. Architecture

### 2.1 Tech Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | SvelteKit + Svelte 5 | ^2.x / ^5.50 | Smallest runtime (~15KB), Runes reactivity, Vite built-in |
| Build | Vite 6 (via SvelteKit) | ^6.x | <500ms dev start, <50ms HMR |
| Deployment | adapter-static | ^3.x | Pure static output for GitHub Pages |
| Styling | Tailwind CSS v4 | ^4.x | OKLCH colors, 100x faster incremental builds, CSS-only config |
| UI Components | shadcn-svelte | latest | 40+ accessible components, Tailwind-native, copy-paste model |
| ASCII Engine | figlet.js | ^1.10 | 400+ FIGlet fonts, TypeScript, browser-native, MIT |
| Color | chroma-js | ^3.1 | OKLCH gradient generation, perceptually uniform scales |
| Animation | GSAP | ^3.12 | Free (Webflow acquisition), best timeline control, canvas support |
| Export | html-to-image | ^1.11 | DOM-to-PNG, zero dependencies, TypeScript |
| ANSI Rendering | ansi_up | ^7.x | ANSI-to-HTML conversion, zero dependencies |
| Language | TypeScript | ^5.x | Type safety across the codebase |

### 2.2 Bundle Budget

| Component | Size (gzipped) |
|-----------|---------------|
| Svelte runtime | ~15 KB |
| GSAP core | ~78 KB |
| figlet core | ~30 KB |
| chroma-js | ~14 KB |
| html-to-image | ~12 KB |
| ansi_up | ~8 KB |
| App code + styles | ~30-50 KB |
| **Total** | **~187-207 KB** |

Target: under 300 KB gzipped total. Well within Google's "good" performance threshold.

### 2.3 Rendering Approach

**DOM-based rendering** using per-character `<span>` elements with inline CSS color.

Rationale:
- CSS `text-shadow` provides native glow effects (the signature DOOM look) for free
- CSS `background-clip: text` enables gradient text without custom rendering
- Native copy-paste support for text content
- `html-to-image` captures the styled DOM directly for PNG export
- Simpler to build and maintain than Canvas 2D
- Better accessibility (screen readers can access text content)

### 2.4 Data Flow

```
User Input (text, font, palette, effects)
        |
        v
  figlet.js renders text -> ASCII string (lines of characters)
        |
        v
  Colorizer applies palette -> array of { char, color } per position
        |
        v
  Effects processor -> adds drip chars, distress, shadow offsets
        |
        v
  DOM Renderer -> <pre> containing colored <span> elements
        |
        v
  CSS applies -> text-shadow glow, scanline overlay, vignette
        |
        v
  Export layer -> text / PNG / SVG / ANSI on user action
```

---

## 3. Visual Design

### 3.1 Design Pillars

1. **Aggressive Darkness** -- Near-black backgrounds, minimal light surfaces
2. **Infernal Warmth** -- Red and orange accents against cold steel
3. **Industrial Weight** -- Heavy typography, dense visual elements
4. **Battle-Worn Texture** -- Distressed, scratched, damaged surfaces
5. **Technical Precision** -- Clean geometric layout despite aggressive aesthetic

### 3.2 Color System (OKLCH via Tailwind v4 @theme)

```css
@theme {
  /* Backgrounds */
  --color-doom-black: oklch(0.10 0.00 0);       /* #0a0a0a */
  --color-doom-dark: oklch(0.15 0.01 30);        /* ~#1b1b1b */
  --color-doom-surface: oklch(0.20 0.02 30);     /* ~#232323 */

  /* Primary Accents */
  --color-doom-red: oklch(0.60 0.25 25);         /* ~#cb0000 */
  --color-doom-glow: oklch(0.65 0.28 25);        /* ~#ff3f3f */
  --color-doom-fire: oklch(0.70 0.20 55);        /* ~#cb5e29 */
  --color-doom-yellow: oklch(0.85 0.18 90);      /* ~#ebdb57 */

  /* Status */
  --color-doom-green: oklch(0.65 0.20 145);      /* ~#53af47 */
  --color-doom-blue: oklch(0.55 0.20 260);       /* ~#5353ff */

  /* Text */
  --color-doom-text: oklch(0.90 0.01 90);        /* ~#efefef */
  --color-doom-text-muted: oklch(0.55 0.01 90);  /* ~#6b6b6b */

  /* Font Families */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 3.3 Signature CSS Effects

**Red Glow (interactive elements):**
```css
.doom-glow {
  text-shadow:
    0 0 7px var(--color-doom-glow),
    0 0 10px var(--color-doom-glow),
    0 0 21px var(--color-doom-glow),
    0 0 42px var(--color-doom-red),
    0 0 82px var(--color-doom-red);
}
```

**Metal Gradient Text (app title):**
```css
.metal-text {
  background: linear-gradient(180deg,
    #BAC7C4 0%, #7f7f7f 30%, #3b3b3b 50%,
    #cb5e29 70%, #874307 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Scanline Overlay (preview area):**
```css
.scanlines::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
}
```

**Vignette (page edges):**
```css
.vignette::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 60%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
}
```

### 3.4 Typography

| Use | Font | Loading |
|-----|------|---------|
| App title | Metal gradient on system bold sans-serif | No load required |
| UI controls | System sans-serif | No load required |
| ASCII output | JetBrains Mono (variable) | Self-hosted WOFF2, ~90KB, font-display: swap |
| ASCII fallback | Fira Code (variable) | Self-hosted WOFF2, ~120KB, font-display: swap |

Font loading strategy:
- Self-hosted WOFF2 only (no Google Fonts CDN)
- Variable fonts (single file per family for all weights)
- `font-display: swap` to prevent invisible text during load
- `document.fonts.load()` check before first render

---

## 4. Features

### 4.1 ASCII Art Engine

**figlet.js integration** with curated font list:

| Font | Style | Character |
|------|-------|-----------|
| Doom | Classic DOOM angular blocks | Aggressive, readable |
| ANSI Shadow | Bold block with shadow | High impact |
| Bloody | Horror dripping letters | Gore aesthetic |
| Gothic | Dark medieval letterforms | Dark fantasy |
| 3-D | Three-dimensional depth | Dimensional weight |
| Block | Solid block characters | Maximum density |
| Banner3-D | Large 3D banner | Commanding presence |
| Poison | Toxic drip variant | Chemical horror |
| Ghost | Ethereal/spooky | Supernatural |
| Graffiti | Street art style | Urban aggression |
| Alligator | Large aggressive letters | Monster aesthetic |
| Isometric1 | Isometric 3D perspective | Tech/architectural |

Fonts are loaded on-demand using figlet.js ES module imports:
```typescript
import doomFont from 'figlet/importable-fonts/Doom.js';
figlet.parseFont('Doom', doomFont);
```

Layout modes exposed to user: `default`, `full`, `fitted`.

### 4.2 Color Palettes

Six predefined DOOM-themed palettes, generated via chroma.js in OKLCH mode:

| Palette | Colors (gradient stops) | Inspiration |
|---------|------------------------|-------------|
| Hellfire | `#1a0000` -> `#8b0000` -> `#ff0000` -> `#ff4500` -> `#ff6600` -> `#ffa500` -> `#ffff00` | Hell fire, lava |
| Cyberdemon | `#0a0a2e` -> `#1a1a4e` -> `#4040ff` -> `#00ffff` -> `#ffffff` | Cyberdemon energy |
| Toxic Waste | `#001a00` -> `#003300` -> `#006600` -> `#00cc00` -> `#00ff00` -> `#88ff88` | Radiation barrels |
| Cacodemon | `#0a001a` -> `#1a0033` -> `#3300ff` -> `#6600ff` -> `#9933ff` -> `#cc66ff` | Cacodemon purple |
| BFG 9000 | `#001a00` -> `#00ff00` -> `#33ff33` -> `#66ff66` -> `#ccffcc` -> `#ffffff` | BFG energy blast |
| Baron | `#1a0a00` -> `#4d1a00` -> `#993300` -> `#cc4400` -> `#ff6600` -> `#ffaa00` | Baron of Hell |

Gradient directions: horizontal, vertical, diagonal (↘), radial (center-out).

Per-character coloring via chroma.js scale interpolation:
```typescript
const scale = chroma.scale(palette.colors).mode('oklch');
const t = position / totalPositions; // 0.0 to 1.0
const color = scale(t).hex();
```

### 4.3 Visual Effects

**Glow (CSS text-shadow)**
- Adjustable intensity: 0% (off) to 100% (full)
- Color derived from active palette's brightest stop
- Multi-layer shadow for realistic bloom:
  - Layer 1: 5px blur (tight inner glow)
  - Layer 2: 20px blur (medium glow)
  - Layer 3: 40px blur (wide outer glow)
  - Layer 4: 80px blur (atmospheric glow)

**Drip Effect (programmatic)**
- Analyzes the bottom edge of the rendered ASCII art
- Below random non-space character positions, appends descending characters
- Taper sequence: `|` -> `:` -> `;` -> `.` (decreasing density)
- Adjustable density: 0% (off) to 100% (every position drips)
- Drip length: random 1-5 characters per position

**Shadow/Depth (CSS offset)**
- Darker copy of the entire text positioned behind via CSS transform
- Adjustable offset: 0px to 6px (x and y)
- Shadow color: darkened variant of the background palette color

**Distress (programmatic)**
- Randomly replaces fill characters with spaces or lighter characters
- Creates a "battle-damaged" look within the ASCII art
- Adjustable intensity: 0% (clean) to 50% (heavily damaged)

### 4.4 Animations (GSAP)

| Animation | Trigger | Method |
|-----------|---------|--------|
| Letter reveal | Text input change | GSAP stagger on individual `<span>` opacity |
| Glow pulse | Continuous (optional) | GSAP timeline loop on text-shadow blur values |
| Drip descent | On drip toggle | GSAP stagger on drip character Y positions |
| Palette morph | Palette switch | GSAP tween on color values via chroma.js |
| Page load | Initial visit | GSAP timeline: fade background -> reveal title -> show UI |

All animations are optional and can be toggled off for performance or preference.

### 4.5 Export Formats

| Format | Method | Output |
|--------|--------|--------|
| Copy Text | `navigator.clipboard.writeText()` | Plain ASCII string (no color) |
| Copy Image | `html-to-image` -> `navigator.clipboard.write()` | PNG to clipboard |
| Download PNG | `html-to-image` -> download blob | High-res PNG with all effects |
| Download SVG | Programmatic SVG generation | SVG with `<text>`, colors, and `<filter>` glow |
| Download ANSI | chroma.js -> ANSI escape codes | Colored text for terminals/Discord |

PNG export captures the full styled DOM preview including CSS glow effects, gradients, and background. SVG export generates a standalone SVG file with embedded font references and SVG filter-based glow.

---

## 5. App Layout

### 5.1 Desktop Layout

```
┌──────────────────────────────────────────────────┐
│  DOOMGEN  (metal gradient title)        [GitHub] │
├──────────────────────────────────────────────────┤
│                                                  │
│              ASCII ART PREVIEW                   │
│         (scanline overlay, glow effects,         │
│          dark background, monospace font)         │
│                                                  │
├────────────────────────┬─────────────────────────┤
│   INPUT CONTROLS       │   STYLE CONTROLS        │
│                        │                         │
│  Text: [_____________] │  Palette: [Hellfire ▾]  │
│  Font: [Doom        ▾] │  Direction: [H] [V] [D] │
│  Layout: [Default   ▾] │  Glow: [────●────] 60% │
│                        │  Drip: [────●────] 30% │
│                        │  Shadow: [──●──────] 2px│
│                        │  Distress: [●────] off  │
├────────────────────────┴─────────────────────────┤
│  [Copy Text] [Copy Image] [PNG] [SVG] [ANSI]    │
└──────────────────────────────────────────────────┘
```

### 5.2 Mobile Layout

```
┌──────────────────────┐
│  DOOMGEN             │
├──────────────────────┤
│                      │
│   ASCII PREVIEW      │
│   (horizontally      │
│    scrollable)       │
│                      │
├──────────────────────┤
│ Text: [____________] │
│ Font: [Doom       ▾] │
│ Palette: [Hellfire▾] │
│ Glow: [────●────]   │
│ Drip: [────●────]   │
│ Shadow: [──●──────]  │
├──────────────────────┤
│ [Copy] [PNG] [More▾] │
└──────────────────────┘
```

### 5.3 Interaction Model

- **Real-time preview:** Every change to text, font, palette, or effects updates the preview immediately
- **Font preview:** Font selector dropdown shows a small ASCII sample of each font
- **Palette preview:** Color swatches shown inline next to palette name
- **Keyboard:** Enter in text field focuses the preview; Escape blurs
- **Responsive:** Below 768px, controls stack vertically; preview becomes horizontally scrollable

---

## 6. File Structure

```
doomgen/
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Pages deployment
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── AsciiPreview.svelte   # Main preview with effects
│   │   │   ├── TextInput.svelte      # Text input control
│   │   │   ├── FontSelector.svelte   # Font picker with previews
│   │   │   ├── PaletteSelector.svelte# Color palette picker
│   │   │   ├── EffectControls.svelte # Glow, drip, shadow sliders
│   │   │   └── ExportBar.svelte      # Export action buttons
│   │   ├── engine/
│   │   │   ├── figlet-renderer.ts    # figlet.js wrapper, font loading
│   │   │   ├── colorizer.ts          # Per-character color application
│   │   │   ├── effects.ts            # Drip, distress, shadow generators
│   │   │   └── exporter.ts           # PNG/SVG/ANSI export logic
│   │   ├── theme/
│   │   │   ├── palettes.ts           # DOOM color palette definitions
│   │   │   └── fonts.ts              # Curated font list and metadata
│   │   └── stores/
│   │       └── state.svelte.ts       # Svelte 5 runes global state
│   ├── routes/
│   │   ├── +layout.svelte            # Root layout (vignette, scanlines)
│   │   └── +page.svelte              # Single page app entry
│   └── app.css                       # Tailwind v4 @theme + DOOM styles
├── static/
│   ├── fonts/
│   │   ├── JetBrainsMono-Variable.woff2
│   │   └── FiraCode-Variable.woff2
│   └── favicon.svg                   # DOOM-styled favicon
├── docs/
│   └── plans/
│       └── 2026-02-10-doomgen-design.md  # This document
├── TASKS/                            # Implementation plans
├── UNITTEST/                         # Validation scripts
├── TOOLS/                            # Utility scripts
├── svelte.config.js                  # adapter-static, base path
├── vite.config.ts                    # Vite configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 7. Deployment -- GitHub Pages

### 7.1 SvelteKit Configuration

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      strict: false
    }),
    paths: {
      base: process.argv.includes('dev') ? '' : '/doomgen'
    }
  }
};
```

### 7.2 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 7.3 Live URL

```
https://<username>.github.io/doomgen/
```

---

## 8. Implementation Phases

### Phase 1: Foundation
- Initialize SvelteKit project with TypeScript
- Configure adapter-static and GitHub Pages base path
- Set up Tailwind CSS v4 with DOOM @theme
- Self-host JetBrains Mono and Fira Code WOFF2
- Create basic page layout with vignette and scanline effects
- Set up GitHub Actions deploy workflow

### Phase 2: Core Engine
- Integrate figlet.js with on-demand font loading
- Build the figlet-renderer.ts wrapper
- Create the AsciiPreview component with monospace `<pre>` output
- Implement TextInput with real-time preview updates
- Implement FontSelector with curated font list and previews

### Phase 3: Color & Effects
- Implement chroma.js color palette system
- Build the colorizer.ts per-character coloring engine
- Create PaletteSelector with 6 DOOM presets
- Add gradient direction controls (H, V, D, R)
- Implement CSS glow effect with intensity slider
- Implement drip effect generator with density slider
- Implement shadow/depth controls
- Implement distress effect

### Phase 4: Export
- Plain text copy to clipboard
- PNG export via html-to-image
- Image copy to clipboard via Clipboard API
- SVG export with programmatic generation
- ANSI text export with escape codes

### Phase 5: Animation & Polish
- GSAP letter-by-letter reveal animation
- Glow pulse breathing animation
- Palette transition morph
- Page load reveal sequence
- Mobile responsive layout
- shadcn-svelte UI component polish
- Performance optimization (lazy font loading, debounced input)

### Phase 6: Ship
- README.md with usage instructions
- Final GitHub Pages deployment
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile testing

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Svelte 5 ecosystem less mature than React | shadcn-svelte covers core UI; custom components fill gaps |
| figlet.js font loading is async/large | Lazy-load fonts on demand; preload Doom font on page load |
| Monospace rendering varies by OS/browser | Self-hosted web fonts with font-display:swap; test cross-browser |
| GSAP API changes after Webflow acquisition | Pin version in package.json; GSAP team committed to backward compat |
| OKLCH not supported in older browsers | Tailwind v4 provides sRGB fallbacks automatically |
| html-to-image export quality on high-DPI | Use devicePixelRatio scaling on export |
| GitHub Pages 404 on direct URL access | adapter-static fallback: 'index.html' handles SPA routing |
| Large ASCII art overflows on mobile | Horizontal scroll on preview; font-size scaling via responsive CSS |

---

## 10. Research References

Full research documents available in the TASKS directory:
- `TASKS/RESEARCH-web-stack-recommendations.md` -- Framework, library, and tooling research
- `TASKS/DOOM_VISUAL_DESIGN_RESEARCH.md` -- DOOM aesthetic, color palettes, and design system research

### Key Sources

**ASCII Art & Libraries:**
- [figlet.js (GitHub)](https://github.com/patorjk/figlet.js)
- [TAAG - Text to ASCII Art Generator](https://patorjk.com/software/taag/)
- [ASCII Rendering Deep Dive (Alex Harri)](https://alexharri.com/blog/ascii-rendering)
- [DOOM FIGlet Font](https://www.gamers.org/~fpv/doomfont.html)
- [xero/figlet-fonts Collection](https://github.com/xero/figlet-fonts)

**DOOM Visual Design:**
- [DOOM Logo History (DesignYourWay)](https://www.designyourway.net/blog/doom-logo/)
- [DOOM PLAYPAL Palette (Lospec)](https://lospec.com/palette-list/playpal)
- [How DOOM Renders Colors](https://www.ryanthomson.net/articles/how-doom-renders-colors/)
- [DOOM Color Codes (Brand Palettes)](https://brandpalettes.com/doom-color-codes/)
- [Game UI Database - DOOM 2016](https://www.gameuidatabase.com/gameData.php?id=37)

**Web Technologies:**
- [Svelte 5 Release](https://svelte.dev/blog/svelte-5-is-alive)
- [SvelteKit SPA Mode](https://svelte.dev/docs/kit/single-page-apps)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [OKLCH in CSS (Evil Martians)](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [GSAP Documentation](https://gsap.com/docs/v3/)
- [chroma.js API](https://gka.github.io/chroma.js/)
- [html-to-image (npm)](https://www.npmjs.com/package/html-to-image)
