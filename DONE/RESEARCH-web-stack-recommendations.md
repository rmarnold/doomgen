# DoomGen Web Stack Research -- Technology Recommendations

**Date**: 2026-02-10
**Status**: Complete
**Scope**: Full-stack technology selection for an interactive ASCII art logo generator web application with a DOOM-inspired dark theme.

---

## Executive Summary

After extensive research across official documentation, community benchmarks, npm download trends, and real-world usage patterns in 2025-2026, the recommended stack is:

**Svelte 5 + SvelteKit (SPA mode) + Vite + Tailwind CSS v4 + HTML Canvas (primary) + GSAP + figlet.js**

This stack provides the best balance of raw rendering performance, minimal bundle size, excellent developer experience, and a mature ecosystem for building a highly interactive, visually rich ASCII art generator with DOOM-themed aesthetics.

---

## 1. Frontend Framework -- Svelte 5 with SvelteKit

### Recommendation: Svelte 5 (v5.50.x) via SvelteKit in SPA mode

**Confidence Level**: High

### Why Svelte 5 Over Alternatives

| Criterion          | Svelte 5           | SolidJS 1.9       | React 19           | Vue 3.5            |
|---------------------|--------------------|--------------------|--------------------|--------------------|
| Bundle Size         | ~15 KB             | ~7 KB              | ~45 KB             | ~33 KB             |
| Runtime Perf        | Excellent          | Best-in-class      | Good               | Good               |
| Ecosystem Size      | Growing rapidly    | Small              | Massive            | Large              |
| DX / Learning Curve | Best               | Moderate           | Moderate           | Good               |
| Component Libraries | 40+ (shadcn-svelte)| Limited            | 200+ (shadcn/ui)   | 100+               |
| Canvas Integration  | Native, clean      | Good               | Ref-heavy          | Good               |
| Hiring Pool (2026)  | Growing            | Small              | Largest            | Large              |

**Key Rationale**:

1. **Compiled output, no virtual DOM**: Svelte compiles to imperative DOM updates at build time. For an app that will heavily manipulate canvas and DOM elements for ASCII art rendering, this eliminates the overhead of a reconciliation layer (React's VDOM, Vue's VDOM). Direct DOM access is cleaner and faster.

2. **Runes API ($state, $derived, $effect)**: Svelte 5's runes provide explicit, fine-grained reactivity that is ideal for real-time parameter changes (font size, color, glow intensity) that need to immediately trigger canvas redraws. The `$effect` rune is particularly well-suited for "render to canvas when state changes" patterns.

3. **Smallest meaningful bundle**: At ~15 KB, Svelte's runtime is lighter than React (45 KB) or Vue (33 KB). SolidJS is smaller at ~7 KB, but its ecosystem is too thin for a full application -- fewer component libraries, fewer UI kits, less community tooling.

4. **SvelteKit SPA mode**: SvelteKit provides file-based routing, built-in Vite integration, and can be configured as a pure SPA with `adapter-static` and a fallback page. This gives you a zero-SSR, single-page deployment while retaining SvelteKit's project structure and tooling.

5. **Ecosystem maturity in 2026**: Svelte now has shadcn-svelte (40+ components), Flowbite-Svelte (60+ components), Skeleton UI, and specialized libraries like svelte-asciiart (SVG-based ASCII rendering) and SvelTTY (terminal emulation).

**Why NOT SolidJS**: Despite superior raw benchmarks (40% faster rendering in synthetic tests), SolidJS has a much smaller ecosystem. No equivalent to shadcn-svelte, fewer animation library integrations, smaller community. The performance gap is negligible for this use case (we are rendering text, not thousands of DOM nodes).

**Why NOT React 19**: React's VDOM overhead is unnecessary for an app that primarily renders to canvas. The ecosystem advantage (massive library count) does not outweigh the performance and bundle-size costs. React 19's compiler improvements help, but Svelte's compiled approach is architecturally more efficient for real-time interactive rendering.

### Current Stable Versions (as of 2026-02-10)

- Svelte: 5.50.1
- SvelteKit: latest stable (2.x series)
- Vite (via SvelteKit): 6.x

### Setup Command

```bash
npx sv create doomgen --template minimal --types ts
```

### References

- https://svelte.dev/docs/svelte/getting-started
- https://svelte.dev/docs/kit/single-page-apps
- https://svelte.dev/blog/svelte-5-is-alive

---

## 2. Canvas / Rendering Strategy -- Hybrid Canvas + DOM

### Recommendation: HTML Canvas 2D (primary rendering) + DOM overlays (UI controls)

**Confidence Level**: High

### Rendering Architecture

```
+------------------------------------------------------+
|  DOM Layer (Svelte components)                       |
|  - Controls, sliders, pickers, menus                |
|  +------------------------------------------------+  |
|  |  HTML Canvas (2D context)                      |  |
|  |  - ASCII art text rendering                    |  |
|  |  - Color fills, gradients, glow effects        |  |
|  |  - Shadow rendering via shadowBlur/shadowColor |  |
|  +------------------------------------------------+  |
|  Optional: SVG overlay for vector export             |
+------------------------------------------------------+
```

### Why Canvas 2D (not SVG, not WebGL)

| Criterion             | Canvas 2D         | SVG                | WebGL              |
|------------------------|--------------------|--------------------|--------------------|
| Text rendering         | Native, fast       | Native, scalable   | Requires SDF/atlas |
| Glow/shadow effects    | Built-in API       | CSS filters        | Custom shaders     |
| Color gradients        | createLinearGrad   | SVG gradients      | Fragment shaders   |
| Export to PNG          | toDataURL()        | Needs conversion   | readPixels()       |
| Export to SVG          | Needs conversion   | Native             | Not practical      |
| Complexity             | Low                | Low-Medium         | High               |
| Perf (< 10K elements) | 60 FPS             | 60 FPS             | 60 FPS             |
| Perf (> 10K elements) | 30-60 FPS          | < 30 FPS           | 60 FPS             |

**Key Rationale**:

1. **Canvas 2D has native text rendering**: `ctx.fillText()` with `ctx.font` supports any loaded web font. No glyph atlases, no SDF generation, no shader complexity. For ASCII art, this is the simplest and most correct approach.

2. **Built-in glow and shadow effects**: Canvas 2D context provides `shadowBlur`, `shadowColor`, `shadowOffsetX/Y` which directly implement the neon glow effect aesthetic without any external library.

3. **Gradient text is straightforward**: `ctx.createLinearGradient()` or `ctx.createRadialGradient()` applied as `fillStyle` before `fillText()` produces gradient-colored text with zero overhead.

4. **Direct PNG export**: `canvas.toDataURL('image/png')` or `canvas.toBlob()` provides one-line image export. No DOM-to-image conversion needed.

5. **ASCII art does not need WebGL**: The element count for ASCII art logos is typically 50-500 characters, not 10,000+ elements. Canvas 2D maintains 60 FPS effortlessly at this scale. WebGL would add massive complexity (shader programming, SDF font rendering via troika-three-text) for zero perceptible performance gain.

6. **SVG as secondary export format**: For users who want vector output, we can generate SVG programmatically (create `<text>` elements with the same styling) as an export option, without using SVG as the primary rendering layer.

### Canvas API Usage Pattern in Svelte 5

```svelte
<script>
  let canvas = $state(null);
  let text = $state('DOOM');
  let fontSize = $state(48);
  let glowColor = $state('#ff0000');

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px 'JetBrains Mono'`;
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = glowColor;
    ctx.fillText(text, 50, 100);
  });
</script>

<canvas bind:this={canvas} width={800} height={400}></canvas>
```

### Optional 3D Text Effects (Future Enhancement)

If 3D text effects are desired later, troika-three-text (via Three.js) can be layered in as a separate rendering mode. It uses SDF font rendering in a web worker and supports any .ttf/.otf/.woff font with proper kerning, ligatures, and bidirectional text.

- troika-three-text: https://protectwise.github.io/troika/troika-three-text/
- ASCII shader approach: https://tympanus.net/codrops/2024/11/13/creating-an-ascii-shader-using-ogl/

### References

- https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

## 3. Animation Libraries -- GSAP (Primary) + CSS Animations (Secondary)

### Recommendation: GSAP 3.x (now fully free) + native CSS @keyframes for simple effects

**Confidence Level**: High

### Why GSAP

| Criterion         | GSAP 3             | Motion (Framer)    | Anime.js           | CSS Only           |
|--------------------|--------------------|--------------------|--------------------|--------------------|
| Framework agnostic | Yes                | React-first*       | Yes                | Yes                |
| Timeline control   | Professional       | Basic              | Good               | None               |
| Text animation     | SplitText plugin   | Manual             | Manual             | Manual             |
| Canvas animation   | Excellent          | DOM only           | DOM only           | DOM only           |
| ScrollTrigger      | Built-in           | Basic scroll        | None               | scroll-timeline    |
| Performance        | Best (batched RAF) | Good               | Good               | Best (GPU)         |
| Bundle size        | ~78 KB             | ~85 KB             | ~17 KB             | 0 KB               |
| License (2025+)    | Free (Webflow)     | MIT                | MIT                | N/A                |
| Svelte support     | Native (no wrapper)| Needs wrapper      | Native             | Native             |

*Motion (formerly Framer Motion) v12 now supports vanilla JS, but its API and ecosystem are still React-centric.

**Key Rationale**:

1. **GSAP is now completely free**: As of 2025, Webflow acquired GreenSock and released GSAP under a free license. All plugins including ScrollTrigger, SplitText, MorphSVG, and DrawSVG are available at no cost. This removes the primary historical objection to GSAP.

2. **Framework agnostic**: GSAP works directly with DOM elements and canvas -- no React wrapper needed. In Svelte, you simply import gsap and use it in `$effect` or `onMount`. This is cleaner than Motion, which requires a React-like component API.

3. **SplitText for character-level animation**: GSAP's SplitText plugin splits text into individual characters/words/lines, each as a separate DOM element that can be independently animated. This is perfect for letter-by-letter DOOM-style reveal effects, glitch animations, and staggered color transitions.

4. **Canvas animation support**: GSAP can tween any JavaScript object property. For canvas rendering, you create a proxy object, tween its properties with GSAP, and redraw on each frame. This enables smooth easing on canvas-rendered text (e.g., animating glow intensity, font size, position).

5. **Timeline sequencing**: GSAP timelines allow precise sequencing of multi-step animation sequences (e.g., "fade in background, then reveal text letter by letter, then pulse glow"). No other library matches GSAP's timeline control.

### Usage Pattern -- GSAP with Svelte 5 Canvas

```javascript
import gsap from 'gsap';

// Animate canvas-rendered properties
let animState = { glowIntensity: 0, textOpacity: 0 };

gsap.timeline()
  .to(animState, { glowIntensity: 30, duration: 0.8, ease: 'power2.out' })
  .to(animState, { textOpacity: 1, duration: 0.5 }, '-=0.3');

// In the render loop, use animState.glowIntensity and animState.textOpacity
```

### CSS Animations for Simple Effects

For hover states, button transitions, and UI micro-interactions, use Tailwind CSS v4's built-in transition utilities and `@keyframes`. Reserve GSAP for complex, sequenced, or canvas-based animations.

### Specific GSAP Plugins to Include

- **gsap** (core): Timeline, tweening, easing
- **ScrollTrigger**: If scroll-based reveal effects are desired
- **SplitText**: Character-level text animation on DOM-rendered previews
- **TextPlugin**: Typewriter/text-replacement effects

### Installation

```bash
npm install gsap
```

### References

- https://gsap.com/docs/v3/
- https://gsap.com/pricing/ (now free)
- https://github.com/greensock/GSAP

---

## 4. Styling / UI Toolkit -- Tailwind CSS v4 + shadcn-svelte

### Recommendation: Tailwind CSS v4 + shadcn-svelte + custom DOOM theme

**Confidence Level**: High

### Why Tailwind CSS v4

| Feature                    | Tailwind v4        | Tailwind v3        | Plain CSS          |
|----------------------------|--------------------|--------------------|--------------------|
| Build speed (full)         | 5x faster          | Baseline           | Instant            |
| Build speed (incremental)  | 100x faster (5ms)  | Baseline (44ms)    | Instant            |
| Color space                | OKLCH (default)    | sRGB               | Any                |
| Container queries          | Built-in           | Plugin             | Native CSS         |
| 3D transforms              | Built-in utilities | Custom             | Manual             |
| Config file                | CSS-only (@theme)  | tailwind.config.js | N/A                |
| Cascade layers             | @layer support     | No                 | Manual             |

**Key Rationale**:

1. **OKLCH colors by default**: Tailwind v4 uses OKLCH color space, which produces perceptually uniform gradients -- no muddy midpoints in color transitions. This is critical for neon glow effects and gradient text where color transitions must look smooth and vibrant.

2. **CSS-only configuration**: Tailwind v4 eliminates tailwind.config.js in favor of CSS-native @theme directives. Simpler setup, faster builds.

3. **100x faster incremental builds**: During development, style changes rebuild in ~5ms. Combined with Vite's HMR, this provides near-instant feedback when adjusting theme colors and layout.

4. **Built-in 3D transform utilities**: `rotate-x-*`, `rotate-y-*`, `scale-z-*`, `translate-z-*` are now first-class utilities. Useful for 3D text perspective effects on UI elements.

### shadcn-svelte for Component Primitives

shadcn-svelte provides 40+ accessible, unstyled-by-default components (Button, Dialog, Select, Slider, Tabs, Tooltip, etc.) that are:

- Copy-pasted into your project (not a dependency)
- Fully customizable via Tailwind classes
- Built on Bits UI and Melt UI (Svelte-native accessibility primitives)
- Compatible with Tailwind v4 and Svelte 5

### DOOM Theme Implementation

```css
/* app.css -- DOOM-inspired dark theme using Tailwind v4 @theme */
@import "tailwindcss";

@theme {
  /* Background palette */
  --color-doom-black: oklch(0.10 0.00 0);
  --color-doom-dark: oklch(0.15 0.01 30);
  --color-doom-surface: oklch(0.20 0.02 30);

  /* Accent colors -- neon/fire palette */
  --color-doom-red: oklch(0.60 0.25 25);
  --color-doom-orange: oklch(0.70 0.20 55);
  --color-doom-yellow: oklch(0.85 0.18 90);
  --color-doom-green: oklch(0.65 0.20 145);

  /* Neon glow variants */
  --color-doom-glow-red: oklch(0.55 0.30 25);
  --color-doom-glow-cyan: oklch(0.70 0.15 195);

  /* Text */
  --color-doom-text: oklch(0.90 0.01 90);
  --color-doom-text-muted: oklch(0.55 0.01 90);

  /* Font families */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Glow/Neon CSS Technique

```css
/* Neon text glow effect via layered text-shadow */
.doom-glow {
  text-shadow:
    0 0 7px var(--color-doom-glow-red),
    0 0 10px var(--color-doom-glow-red),
    0 0 21px var(--color-doom-glow-red),
    0 0 42px var(--color-doom-red),
    0 0 82px var(--color-doom-red);
}

/* Gradient text via background-clip */
.doom-gradient-text {
  background: linear-gradient(
    90deg,
    var(--color-doom-red),
    var(--color-doom-orange),
    var(--color-doom-yellow)
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### References

- https://tailwindcss.com/blog/tailwindcss-v4
- https://ui.shadcn.com/docs/tailwind-v4
- https://shadcn-svelte.com/

---

## 5. Build Tools -- Vite 6 (via SvelteKit)

### Recommendation: Vite 6.x (bundled with SvelteKit)

**Confidence Level**: High

### Why Vite (not Next.js, not standalone Webpack)

| Criterion          | Vite 6 (SvelteKit) | Next.js 15         | Webpack 5          |
|---------------------|--------------------|--------------------|--------------------|
| Dev server start    | < 500ms            | 1-3s               | 3-10s              |
| HMR speed           | < 50ms             | 100-500ms          | 200-2000ms         |
| Framework lock-in   | Any (Svelte, etc.) | React only         | Any                |
| SSR needed?         | Optional (SPA ok)  | Default/expected   | Manual             |
| Config complexity   | Minimal            | Moderate           | High               |
| Tree shaking        | Rollup (excellent) | Webpack (good)     | Good               |
| Production bundler  | Rolldown (Rust)    | Webpack/Turbopack  | Webpack            |

**Key Rationale**:

1. **SvelteKit uses Vite natively**: No additional configuration. SvelteKit's `vite.config.ts` is the single build configuration file for the entire project.

2. **SPA mode eliminates SSR complexity**: For a client-side ASCII art generator, SSR provides no benefit (no SEO needed for a tool app, no server-rendered content). SvelteKit in SPA mode via `adapter-static` produces a simple static build that can be hosted on any CDN (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

3. **Instant HMR**: Vite's module-level hot replacement updates only the changed module. Combined with Tailwind v4's 5ms rebuild, the feedback loop from code change to visual update is effectively instantaneous.

4. **Next.js is overkill**: Next.js is React-only and optimized for SSR/SSG web applications with SEO requirements. An interactive tool like DoomGen has no SSR requirements, no API routes (client-only), and no SEO needs. Next.js would add unnecessary complexity and force React adoption.

### SvelteKit SPA Configuration

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      fallback: 'index.html' // SPA mode: all routes serve index.html
    })
  }
};
```

### References

- https://svelte.dev/docs/kit/single-page-apps
- https://svelte.dev/docs/kit/project-types

---

## 6. Export / Download Capabilities

### Recommendation: Native Canvas API (PNG) + html-to-image (DOM) + Clipboard API + programmatic SVG generation

**Confidence Level**: High

### Export Strategy Matrix

| Export Format | Method                          | Library            | Complexity |
|---------------|----------------------------------|--------------------|------------|
| PNG (canvas)  | canvas.toBlob()                  | None (native)      | Low        |
| PNG (DOM)     | html-to-image toPng()            | html-to-image      | Low        |
| SVG           | Programmatic SVG string gen      | None (custom)      | Medium     |
| Plain text    | Direct string from figlet.js     | None               | Low        |
| ANSI text     | ANSI escape codes from palette   | ansi_up (reverse)  | Low        |
| Clipboard     | navigator.clipboard.write()      | None (native)      | Low        |

### Implementation Details

**PNG Export (Primary -- from Canvas)**:
```javascript
function downloadPNG(canvas, filename = 'doomgen.png') {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
```

**Copy to Clipboard**:
```javascript
async function copyImageToClipboard(canvas) {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
}

async function copyTextToClipboard(asciiText) {
  await navigator.clipboard.writeText(asciiText);
}
```

**SVG Export (Programmatic)**:
```javascript
function generateSVG(asciiLines, options) {
  const { fontFamily, fontSize, colors, glowColor } = options;
  const lineHeight = fontSize * 1.2;
  const height = asciiLines.length * lineHeight + 40;
  const width = Math.max(...asciiLines.map(l => l.length)) * fontSize * 0.6 + 40;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
  svg += `<defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>`;
  svg += `<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  svg += `<rect width="100%" height="100%" fill="#1a1a1a"/>`;

  asciiLines.forEach((line, i) => {
    svg += `<text x="20" y="${20 + (i + 1) * lineHeight}" `;
    svg += `font-family="${fontFamily}" font-size="${fontSize}" `;
    svg += `fill="${colors[i % colors.length]}" filter="url(#glow)">${escapeXml(line)}</text>`;
  });

  svg += `</svg>`;
  return svg;
}
```

**html-to-image (for DOM preview screenshots)**:
```bash
npm install html-to-image
```
Use for capturing styled DOM previews that include CSS effects (text-shadow glows, gradient text) that are harder to replicate on canvas.

### Library Versions

- html-to-image: ^1.11.x (1.6M+ monthly downloads, zero dependencies, TypeScript support)
- html2canvas: NOT recommended (heavier, less reliable with modern CSS like OKLCH gradients)
- Clipboard API: Native (supported in all modern browsers)

### References

- https://www.npmjs.com/package/html-to-image
- https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API

---

## 7. Font Rendering -- Monospace Fonts for ASCII Art

### Recommendation: JetBrains Mono (primary) + Fira Code (secondary) + system fallbacks. Self-hosted as WOFF2.

**Confidence Level**: High

### Font Selection Matrix

| Font              | Ligatures | Variable | WOFF2 Size | License     | ASCII Art Quality |
|--------------------|-----------|----------|------------|-------------|-------------------|
| JetBrains Mono     | Yes       | Yes      | ~90 KB     | OFL (free)  | Excellent         |
| Fira Code          | Yes       | Yes      | ~120 KB    | OFL (free)  | Excellent         |
| Source Code Pro     | No        | Yes      | ~70 KB     | OFL (free)  | Very Good         |
| IBM Plex Mono      | No        | Yes      | ~80 KB     | OFL (free)  | Good              |
| Berkeley Mono      | Yes       | No       | ~60 KB     | Commercial  | Excellent         |
| Monaspace (GitHub)  | Yes       | Yes      | ~100 KB    | OFL (free)  | Good              |

### Why JetBrains Mono as Primary

1. **Designed for extended reading**: Taller characters with increased letter height reduce eye strain. ASCII art logos are dense character grids -- readability matters.

2. **Variable font support**: A single .woff2 file contains all weights (100-800). This means one HTTP request for the entire weight range, enabling animated weight transitions via CSS `font-variation-settings`.

3. **Excellent character alignment**: Every character occupies exactly the same width cell. This is non-negotiable for ASCII art where alignment is the entire aesthetic.

4. **Free and open source**: SIL Open Font License. No licensing concerns for any use.

5. **Coding ligatures**: While not critical for ASCII art output, ligatures enhance the UI controls and code editor components of the application.

### Font Loading Strategy

```css
/* Self-hosted, WOFF2 only, with font-display: swap */
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Variable.woff2') format('woff2');
  font-weight: 100 800;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Fira Code';
  src: url('/fonts/FiraCode-Variable.woff2') format('woff2');
  font-weight: 300 700;
  font-style: normal;
  font-display: swap;
}
```

### Font Loading in Canvas Context

```javascript
// Ensure font is loaded before first canvas render
async function ensureFontsLoaded() {
  await document.fonts.load('400 16px "JetBrains Mono"');
  await document.fonts.load('400 16px "Fira Code"');
}

// Use in Svelte
import { onMount } from 'svelte';

onMount(async () => {
  await ensureFontsLoaded();
  renderCanvas(); // Safe to render now
});
```

### Performance Optimization

- **Self-host fonts** (do not use Google Fonts CDN): Eliminates third-party DNS lookup, connection, and CORS overhead. In 2025-2026, self-hosting is faster because browsers no longer share cache across domains.
- **WOFF2 only**: ~60% smaller than TTF. All modern browsers support WOFF2.
- **Variable fonts**: One file replaces 6-8 individual weight files.
- **Subset if needed**: Use `pyftsubset` or `glyphhanger` to strip unused Unicode ranges for ASCII-only usage (Latin subset: ~30 KB).

### References

- https://www.jetbrains.com/lp/mono/
- https://github.com/tonsky/FiraCode
- https://pangrampangram.com/blogs/journal/best-monospace-fonts-2025

---

## 8. Color / Theme Systems

### Recommendation: OKLCH color space (via Tailwind v4) + chroma.js + ansi_up + CSS custom properties

**Confidence Level**: High

### Architecture

```
OKLCH Theme Variables (CSS @theme)
        |
        v
  +-----+-----+
  |             |
  v             v
Tailwind v4    Canvas API
(DOM UI)       (Art rendering)
  |             |
  v             v
CSS classes    chroma.js color
& variables    manipulation
                |
                v
         ansi_up (ANSI <-> HTML
         color conversion)
```

### Core Color Libraries

**chroma.js** (~14 KB gzipped):
- Color manipulation, interpolation, and scale generation
- Supports OKLCH, OKLAB, RGB, HSL, LAB, LCH color spaces
- Generates perceptually uniform color scales for gradient text
- Creates accessible color palettes with proper contrast ratios

```bash
npm install chroma-js
```

```javascript
import chroma from 'chroma-js';

// Generate a DOOM fire gradient scale
const fireScale = chroma.scale(['#1a0000', '#ff0000', '#ff6600', '#ffff00'])
  .mode('oklch')
  .colors(10);

// Per-character coloring for ASCII art
function colorizeAsciiArt(lines, scale) {
  return lines.map((line, row) => {
    return [...line].map((char, col) => {
      const t = (row + col) / (lines.length + line.length);
      return { char, color: scale(t).hex() };
    });
  });
}
```

**ansi_up** (~8 KB):
- Converts ANSI escape codes to HTML `<span>` elements with color classes
- Zero dependencies
- Supports 256-color and true-color (24-bit) ANSI codes
- Essential for rendering terminal-style colored output in the browser

```bash
npm install ansi_up
```

```javascript
import AnsiUp from 'ansi_up';

const ansiUp = new AnsiUp();
ansiUp.use_classes = true; // Use CSS classes instead of inline styles
const html = ansiUp.ansi_to_html(ansiColoredText);
```

### ANSI Color Export

For users who want to copy ANSI-colored text (for terminals, Discord, etc.):

```javascript
function toAnsiEscapes(coloredChars) {
  return coloredChars.map(({ char, color }) => {
    const [r, g, b] = chroma(color).rgb();
    return `\x1b[38;2;${r};${g};${b}m${char}`;
  }).join('') + '\x1b[0m';
}
```

### Predefined DOOM Color Palettes

```javascript
const DOOM_PALETTES = {
  hellfire:  ['#1a0000', '#8b0000', '#ff0000', '#ff4500', '#ff6600', '#ffa500', '#ffff00'],
  cyberdemon:['#0a0a2e', '#1a1a4e', '#4040ff', '#00ffff', '#ffffff'],
  toxicWaste:['#001a00', '#003300', '#006600', '#00cc00', '#00ff00', '#88ff88'],
  cacoBlue:  ['#0a001a', '#1a0033', '#3300ff', '#6600ff', '#9933ff', '#cc66ff'],
  bfg9000:   ['#001a00', '#00ff00', '#33ff33', '#66ff66', '#ccffcc', '#ffffff'],
  baron:     ['#1a0a00', '#4d1a00', '#993300', '#cc4400', '#ff6600', '#ffaa00'],
};
```

### References

- https://gka.github.io/chroma.js/
- https://github.com/drudru/ansi_up
- https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
- https://oklch.fyi/

---

## 9. ASCII Art Generation -- figlet.js

### Recommendation: figlet.js v1.10.x

**Confidence Level**: High

This is the core engine for converting user text input into ASCII art patterns.

### Why figlet.js

- Full implementation of the FIGfont specification in JavaScript
- Works in browser and Node.js
- 300+ built-in FIGlet fonts
- Supports layout modes: default, full, fitted, controlled smushing, universal smushing
- Actively maintained (v1.10.0 released 2025-12-25)
- MIT licensed

```bash
npm install figlet
```

```javascript
import figlet from 'figlet';

// Browser usage with dynamic font loading
const text = await figlet.text('DOOM', {
  font: 'ANSI Shadow',
  horizontalLayout: 'default',
  verticalLayout: 'default',
  width: 80,
  whitespaceBreak: true
});
```

### DOOM-Appropriate FIGlet Fonts

| Font Name      | Style                     | Example Width |
|-----------------|---------------------------|---------------|
| ANSI Shadow     | Block shadow, bold         | Wide          |
| Bloody          | Horror dripping            | Medium        |
| Doom            | Classic DOOM game font     | Wide          |
| Gothic          | Medieval/dark              | Medium        |
| Poison          | Toxic/dripping             | Medium        |
| 3D-ASCII        | Three-dimensional          | Wide          |
| Block           | Solid block characters     | Wide          |
| Banner3-D       | 3D banner style            | Very Wide     |

### References

- https://github.com/patorjk/figlet.js
- https://www.npmjs.com/package/figlet

---

## Complete Dependency List

### Production Dependencies

| Package           | Version   | Size (gzip) | Purpose                              |
|--------------------|-----------|-------------|--------------------------------------|
| svelte             | ^5.50.0   | ~15 KB      | UI framework                         |
| @sveltejs/kit      | ^2.x      | Included    | App framework, routing               |
| tailwindcss        | ^4.x      | Build-only  | Utility CSS                          |
| gsap               | ^3.12     | ~78 KB      | Animation engine                     |
| figlet             | ^1.10     | ~30 KB*     | ASCII art text generation            |
| chroma-js          | ^3.1      | ~14 KB      | Color manipulation                   |
| ansi_up            | ^7.x      | ~8 KB       | ANSI-to-HTML color rendering         |
| html-to-image      | ^1.11     | ~12 KB      | DOM-to-image export                  |

*figlet fonts are loaded on demand; core library is ~30 KB.

### Dev Dependencies

| Package                    | Version   | Purpose                          |
|-----------------------------|-----------|----------------------------------|
| @sveltejs/adapter-static    | ^3.x      | SPA static build                 |
| vite                        | ^6.x      | Build tool (via SvelteKit)       |
| typescript                  | ^5.x      | Type safety                      |
| @types/figlet               | ^1.x      | figlet TypeScript types          |

### Total Production Bundle Estimate

| Component          | Size (gzip)  |
|---------------------|-------------|
| Svelte runtime      | ~15 KB      |
| GSAP core           | ~78 KB      |
| figlet (core)       | ~30 KB      |
| chroma-js           | ~14 KB      |
| html-to-image       | ~12 KB      |
| ansi_up             | ~8 KB       |
| App code + styles   | ~30-50 KB   |
| **Total**           | **~187-207 KB** |

This is well under the 300 KB budget that Google recommends for "good" load performance.

---

## Risk Mitigation

| Risk                                      | Mitigation                                              |
|--------------------------------------------|---------------------------------------------------------|
| Svelte 5 ecosystem less mature than React  | shadcn-svelte covers core UI; custom components fill gaps|
| figlet.js font loading is async/large      | Lazy-load fonts on demand; preload popular fonts         |
| Canvas text rendering varies by OS         | Use web fonts with font-display:swap; test cross-browser |
| GSAP API changes after Webflow acquisition | Pin version; GSAP team committed to backward compat      |
| OKLCH not supported in very old browsers   | Tailwind v4 provides sRGB fallbacks automatically        |
| Canvas export quality on high-DPI          | Use devicePixelRatio scaling on canvas                   |

---

## Alternative Stack (If Team Prefers React)

If React experience on the team makes Svelte adoption impractical:

- **React 19** + **Vite 6** (not Next.js -- no SSR needed)
- **shadcn/ui** (200+ components, massive ecosystem)
- **Motion** v12 (formerly Framer Motion, native React animation)
- **Tailwind CSS v4** (same as primary recommendation)
- All other recommendations remain the same (Canvas, GSAP for canvas animation, figlet.js, chroma.js, etc.)

This adds ~30 KB to the bundle (React runtime overhead) but provides the largest library ecosystem.

---

## Next Steps

1. Initialize the SvelteKit project with TypeScript and Tailwind CSS v4
2. Set up the DOOM theme with OKLCH color variables
3. Integrate figlet.js for ASCII art generation
4. Build the Canvas 2D rendering layer with glow/shadow effects
5. Add GSAP for reveal animations and transitions
6. Implement export functionality (PNG, SVG, text, clipboard)
7. Add color palette system with chroma.js
8. Polish UI with shadcn-svelte components

---

## Sources

- [Frontend Framework Comparison 2025-2026](https://www.frontendtools.tech/blog/best-frontend-frameworks-2025-comparison)
- [Best JavaScript Frameworks 2026](https://strapi.io/blog/best-javascript-frameworks)
- [SVG vs Canvas vs WebGL Performance 2025](https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025)
- [ASCII Shader Using OGL (Codrops)](https://tympanus.net/codrops/2024/11/13/creating-an-ascii-shader-using-ogl/)
- [GSAP vs Motion Comparison](https://motion.dev/docs/gsap-vs-motion)
- [Best React Animation Libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/)
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS Guide 2026](https://blog.logrocket.com/tailwind-css-guide/)
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [Vite vs Next.js 2025](https://strapi.io/blog/vite-vs-nextjs-2025-developer-framework-comparison)
- [html-to-image npm](https://www.npmjs.com/package/html-to-image)
- [Best HTML to Canvas Solutions 2025](https://portalzine.de/best-html-to-canvas-solutions-in-2025/)
- [Best Monospace Fonts 2025](https://pangrampangram.com/blogs/journal/best-monospace-fonts-2025)
- [JetBrains Mono vs Fira Code](https://firacode.com/how-does-fira-code-compare-to-jetbrains-mono/)
- [OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [chroma.js API](https://gka.github.io/chroma.js/)
- [ansi_up GitHub](https://github.com/drudru/ansi_up)
- [figlet.js GitHub](https://github.com/patorjk/figlet.js)
- [figlet npm Guide 2025](https://generalistprogrammer.com/tutorials/figlet-npm-package-guide)
- [troika-three-text](https://protectwise.github.io/troika/troika-three-text/)
- [SvelteKit SPA Mode](https://svelte.dev/docs/kit/single-page-apps)
- [Svelte 5 Release](https://svelte.dev/blog/svelte-5-is-alive)
- [CSS Neon Text Effects](https://css-tricks.com/how-to-create-neon-text-with-css/)
- [CSS Glowing Effects 2026](https://www.testmuai.com/blog/glowing-effects-in-css/)
- [Svelte Konva Canvas Library](https://konvajs.org/docs/svelte/index.html)
- [Svelte's Evolution 2026 Vision](https://medium.com/@sosohappy/sveltes-evolution-recent-breakthroughs-and-the-2026-vision-18f27cfa1afe)
