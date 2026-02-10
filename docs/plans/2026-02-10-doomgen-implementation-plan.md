# DOOMGEN Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web-based ASCII art logo generator styled after DOOM, hosted on GitHub Pages.

**Architecture:** SvelteKit 2 + Svelte 5 SPA with adapter-static. figlet.js generates ASCII art, chroma-js handles OKLCH color gradients, DOM-based rendering with per-character `<span>` elements for CSS glow effects. Tailwind CSS v4 for styling with DOOM @theme. GSAP for animations. Export via html-to-image and programmatic SVG/ANSI generation.

**Tech Stack:** SvelteKit 2, Svelte 5 (Runes), Tailwind CSS v4, figlet.js, chroma-js, GSAP, html-to-image, ansi_up, TypeScript 5

**Design Document:** `docs/plans/2026-02-10-doomgen-design.md`

---

## Phase 1: Foundation

### Task 1: Scaffold SvelteKit Project

**Files:**
- Create: `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `src/app.html`, `src/routes/+page.svelte`, `src/routes/+layout.svelte`, `src/app.css`

**Step 1: Create SvelteKit project**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npx sv create . --template minimal --types ts --no-add-ons
```

If prompted about existing files, proceed (design docs are outside `src/`).

Expected: SvelteKit project scaffolded with TypeScript.

**Step 2: Verify dev server starts**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm install && npm run dev -- --open
```

Expected: Dev server starts at `http://localhost:5173`, browser opens showing "Welcome to SvelteKit".

**Step 3: Stop dev server and commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add package.json package-lock.json svelte.config.js vite.config.ts tsconfig.json src/ static/ .npmrc
git commit -m "feat: scaffold SvelteKit project with TypeScript"
```

---

### Task 2: Configure adapter-static for GitHub Pages

**Files:**
- Modify: `svelte.config.js`
- Modify: `src/routes/+layout.ts` (create if not exists)

**Step 1: Install adapter-static**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm install -D @sveltejs/adapter-static
```

Expected: Package added to devDependencies.

**Step 2: Configure svelte.config.js**

Replace the contents of `svelte.config.js` with:

```javascript
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

**Step 3: Enable SPA prerendering**

Create `src/routes/+layout.ts`:

```typescript
export const prerender = true;
export const ssr = false;
```

**Step 4: Verify build succeeds**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run build
```

Expected: Build completes, `build/` directory created with `index.html`.

**Step 5: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add svelte.config.js src/routes/+layout.ts package.json package-lock.json
git commit -m "feat: configure adapter-static for GitHub Pages SPA"
```

---

### Task 3: Set Up Tailwind CSS v4 with DOOM Theme

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/app.css`
- Modify: `src/routes/+layout.svelte`

**Step 1: Install Tailwind CSS v4**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm install tailwindcss @tailwindcss/vite
```

**Step 2: Add Tailwind Vite plugin**

Replace `vite.config.ts` with:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()]
});
```

**Step 3: Create app.css with DOOM @theme**

Replace `src/app.css` with:

```css
@import "tailwindcss";

@theme {
  /* Backgrounds */
  --color-doom-black: oklch(0.10 0.00 0);
  --color-doom-dark: oklch(0.15 0.01 30);
  --color-doom-surface: oklch(0.20 0.02 30);

  /* Primary Accents */
  --color-doom-red: oklch(0.60 0.25 25);
  --color-doom-glow: oklch(0.65 0.28 25);
  --color-doom-fire: oklch(0.70 0.20 55);
  --color-doom-yellow: oklch(0.85 0.18 90);

  /* Status */
  --color-doom-green: oklch(0.65 0.20 145);
  --color-doom-blue: oklch(0.55 0.20 260);

  /* Text */
  --color-doom-text: oklch(0.90 0.01 90);
  --color-doom-text-muted: oklch(0.55 0.01 90);

  /* Font Families */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

/* ── Global Resets ────────────────────────────── */
html {
  background-color: var(--color-doom-black);
  color: var(--color-doom-text);
}

/* ── Signature CSS Effects ────────────────────── */

.doom-glow {
  text-shadow:
    0 0 7px var(--color-doom-glow),
    0 0 10px var(--color-doom-glow),
    0 0 21px var(--color-doom-glow),
    0 0 42px var(--color-doom-red),
    0 0 82px var(--color-doom-red);
}

.metal-text {
  background: linear-gradient(180deg,
    #BAC7C4 0%, #7f7f7f 30%, #3b3b3b 50%,
    #cb5e29 70%, #874307 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

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
  z-index: 10;
}

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
  z-index: 50;
}
```

**Step 4: Update +layout.svelte**

Replace `src/routes/+layout.svelte` with:

```svelte
<script>
  import '../app.css';
  let { children } = $props();
</script>

<div class="vignette min-h-screen bg-doom-black font-mono text-doom-text">
  {@render children()}
</div>
```

**Step 5: Verify Tailwind works**

Replace `src/routes/+page.svelte` with:

```svelte
<main class="flex min-h-screen flex-col items-center justify-center">
  <h1 class="metal-text text-6xl font-bold">DOOMGEN</h1>
  <p class="mt-4 text-doom-text-muted">ASCII Art Logo Generator</p>
</main>
```

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run dev
```

Expected: Dark page with metal gradient "DOOMGEN" title, vignette overlay visible at edges.

**Step 6: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add vite.config.ts src/app.css src/routes/+layout.svelte src/routes/+page.svelte package.json package-lock.json
git commit -m "feat: add Tailwind CSS v4 with DOOM color theme and effects"
```

---

### Task 4: Self-Host Web Fonts

**Files:**
- Create: `static/fonts/JetBrainsMono-Variable.woff2`
- Create: `static/fonts/FiraCode-Variable.woff2`
- Modify: `src/app.css`

**Step 1: Download JetBrains Mono variable font**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
mkdir -p static/fonts
curl -L -o /tmp/JetBrainsMono.zip "https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip"
unzip -o /tmp/JetBrainsMono.zip -d /tmp/JetBrainsMono
cp /tmp/JetBrainsMono/fonts/variable/JetBrainsMono\[wght\].woff2 static/fonts/JetBrainsMono-Variable.woff2
```

Expected: `static/fonts/JetBrainsMono-Variable.woff2` exists (~90KB).

**Step 2: Download Fira Code variable font**

Run:
```bash
curl -L -o /tmp/FiraCode.zip "https://github.com/tonsky/FiraCode/releases/download/6.2/Fira_Code_v6.2.zip"
unzip -o /tmp/FiraCode.zip -d /tmp/FiraCode
cp /tmp/FiraCode/woff2/FiraCode-VF.woff2 static/fonts/FiraCode-Variable.woff2
```

Expected: `static/fonts/FiraCode-Variable.woff2` exists (~120KB).

**Step 3: Add @font-face declarations to app.css**

Add at the TOP of `src/app.css` (before `@import "tailwindcss"`):

```css
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

Note: In production with base path `/doomgen`, SvelteKit handles static asset paths automatically.

**Step 4: Verify fonts load**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run dev
```

Open browser DevTools > Network tab. Verify `.woff2` files load. The "DOOMGEN" title should render in the system font (not JetBrains Mono — that's for ASCII output later). The font-mono class will pick up JetBrains Mono for monospace contexts.

**Step 5: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add static/fonts/ src/app.css
git commit -m "feat: self-host JetBrains Mono and Fira Code variable fonts"
```

---

### Task 5: Create DOOM-Styled Page Layout Shell

**Files:**
- Modify: `src/routes/+page.svelte`
- Create: `static/favicon.svg`

**Step 1: Create DOOM favicon**

Create `static/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#0a0a0a"/>
  <text x="16" y="24" font-family="monospace" font-size="24" font-weight="bold" fill="#ff3f3f" text-anchor="middle">D</text>
</svg>
```

**Step 2: Build the page layout shell**

Replace `src/routes/+page.svelte` with:

```svelte
<script lang="ts">
  // Placeholder state — will be replaced with stores in Task 9
  let text = $state('DOOM');
</script>

<svelte:head>
  <title>DOOMGEN — ASCII Art Logo Generator</title>
  <meta name="description" content="Generate DOOM-styled ASCII art logos with color gradients, glow effects, and multiple export formats." />
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">

  <!-- Header -->
  <header class="flex items-center justify-between pb-6">
    <h1 class="metal-text text-4xl font-bold tracking-wider sm:text-5xl">DOOMGEN</h1>
    <a
      href="https://github.com/rarnold/doomgen"
      target="_blank"
      rel="noopener noreferrer"
      class="text-doom-text-muted transition-colors hover:text-doom-glow"
      aria-label="View on GitHub"
    >
      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    </a>
  </header>

  <!-- Preview Area -->
  <section class="scanlines relative mb-6 flex-1 overflow-auto rounded-lg border border-doom-surface bg-doom-dark p-6">
    <pre class="font-mono text-sm leading-tight text-doom-text">
      <!-- ASCII preview will render here -->
      <span class="doom-glow text-doom-red">PLACEHOLDER — figlet output goes here</span>
    </pre>
  </section>

  <!-- Controls -->
  <section class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">

    <!-- Input Controls -->
    <div class="space-y-4 rounded-lg border border-doom-surface bg-doom-dark p-4">
      <h2 class="text-sm font-bold uppercase tracking-widest text-doom-text-muted">Input</h2>
      <label class="block">
        <span class="mb-1 block text-sm text-doom-text-muted">Text</span>
        <input
          type="text"
          bind:value={text}
          placeholder="Enter text..."
          class="w-full rounded border border-doom-surface bg-doom-black px-3 py-2 font-mono text-doom-text placeholder-doom-text-muted focus:border-doom-red focus:outline-none"
        />
      </label>
      <!-- Font and Layout selectors will be added in Phase 2 -->
    </div>

    <!-- Style Controls -->
    <div class="space-y-4 rounded-lg border border-doom-surface bg-doom-dark p-4">
      <h2 class="text-sm font-bold uppercase tracking-widest text-doom-text-muted">Style</h2>
      <!-- Palette, Glow, Drip, Shadow, Distress controls will be added in Phase 3 -->
      <p class="text-sm text-doom-text-muted">Style controls coming in Phase 3...</p>
    </div>

  </section>

  <!-- Export Bar -->
  <footer class="flex flex-wrap gap-3 rounded-lg border border-doom-surface bg-doom-dark p-4">
    <!-- Export buttons will be added in Phase 4 -->
    <span class="text-sm text-doom-text-muted">Export options coming in Phase 4...</span>
  </footer>

</div>
```

**Step 3: Verify layout**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run dev
```

Expected: Dark themed page with metal gradient "DOOMGEN" title, GitHub icon link, scanlined preview area, two control panels, and export bar. Vignette overlay at page edges.

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add static/favicon.svg src/routes/+page.svelte
git commit -m "feat: add DOOM-styled page layout shell with header, preview, controls, export bar"
```

---

### Task 6: Set Up GitHub Actions Deploy Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create workflow file**

Create `.github/workflows/deploy.yml`:

```yaml
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

**Step 2: Verify build still works**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run build
```

Expected: Build succeeds. The `build/` directory contains `index.html`, `_app/` assets, and font files.

**Step 3: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

## Phase 2: Core Engine

### Task 7: Install Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install all runtime dependencies**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm install figlet chroma-js gsap html-to-image ansi_up
```

**Step 2: Install TypeScript type definitions**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm install -D @types/figlet
```

Note: `chroma-js` v3 ships its own types. `gsap`, `html-to-image`, and `ansi_up` have built-in TypeScript support.

**Step 3: Verify installation**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm ls figlet chroma-js gsap html-to-image ansi_up
```

Expected: All five packages listed at expected versions.

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add package.json package-lock.json
git commit -m "feat: install core dependencies (figlet, chroma-js, gsap, html-to-image, ansi_up)"
```

---

### Task 8: Build figlet-renderer.ts (ASCII Engine Wrapper)

**Files:**
- Create: `src/lib/engine/figlet-renderer.ts`
- Create: `src/lib/theme/fonts.ts`

**Step 1: Create the font metadata file**

Create `src/lib/theme/fonts.ts`:

```typescript
export interface FontMeta {
  id: string;
  label: string;
  description: string;
}

export const DOOM_FONTS: FontMeta[] = [
  { id: 'Doom', label: 'Doom', description: 'Classic DOOM angular blocks' },
  { id: 'ANSI Shadow', label: 'ANSI Shadow', description: 'Bold block with shadow' },
  { id: 'Bloody', label: 'Bloody', description: 'Horror dripping letters' },
  { id: 'Gothic', label: 'Gothic', description: 'Dark medieval letterforms' },
  { id: '3-D', label: '3-D', description: 'Three-dimensional depth' },
  { id: 'Block', label: 'Block', description: 'Solid block characters' },
  { id: 'Banner3-D', label: 'Banner3-D', description: 'Large 3D banner' },
  { id: 'Poison', label: 'Poison', description: 'Toxic drip variant' },
  { id: 'Ghost', label: 'Ghost', description: 'Ethereal/spooky' },
  { id: 'Graffiti', label: 'Graffiti', description: 'Street art style' },
  { id: 'Alligator', label: 'Alligator', description: 'Large aggressive letters' },
  { id: 'Isometric1', label: 'Isometric1', description: 'Isometric 3D perspective' },
];
```

**Step 2: Create the figlet renderer**

Create `src/lib/engine/figlet-renderer.ts`:

```typescript
import figlet from 'figlet';
import type { FontMeta } from '$lib/theme/fonts';

const loadedFonts = new Set<string>();

/**
 * Dynamically import and register a FIGlet font.
 * Fonts are cached after first load.
 */
async function loadFont(fontId: string): Promise<void> {
  if (loadedFonts.has(fontId)) return;

  // Dynamic import from figlet's importable-fonts
  const fontModule = await import(
    /* @vite-ignore */
    `figlet/importable-fonts/${fontId}.js`
  );
  figlet.parseFont(fontId, fontModule.default);
  loadedFonts.add(fontId);
}

export type LayoutMode = 'default' | 'full' | 'fitted';

export interface RenderOptions {
  text: string;
  fontId: string;
  layout: LayoutMode;
}

export interface RenderResult {
  text: string;
  lines: string[];
  width: number;
  height: number;
}

/**
 * Render text to ASCII art using figlet.js.
 * Returns the raw ASCII string and metadata.
 */
export async function renderAscii(options: RenderOptions): Promise<RenderResult> {
  await loadFont(options.fontId);

  const figletOptions: figlet.Options = {
    font: options.fontId as figlet.Fonts,
    horizontalLayout: options.layout,
    verticalLayout: 'default',
  };

  return new Promise((resolve, reject) => {
    figlet.text(options.text, figletOptions, (err, result) => {
      if (err || !result) {
        reject(err ?? new Error('figlet returned empty result'));
        return;
      }
      const lines = result.split('\n');
      const width = Math.max(...lines.map((l) => l.length));
      const height = lines.length;
      resolve({ text: result, lines, width, height });
    });
  });
}

/**
 * Render a short preview of a font (for font selector).
 */
export async function renderFontPreview(fontId: string): Promise<string> {
  const result = await renderAscii({ text: 'Abc', fontId, layout: 'fitted' });
  return result.text;
}
```

**Step 3: Verify TypeScript compiles**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npx svelte-check
```

Expected: No errors in the new files (warnings about unused imports in +page.svelte are OK for now).

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/engine/figlet-renderer.ts src/lib/theme/fonts.ts
git commit -m "feat: add figlet-renderer engine with on-demand font loading"
```

---

### Task 9: Create Global State Store (Svelte 5 Runes)

**Files:**
- Create: `src/lib/stores/state.svelte.ts`

**Step 1: Create the global state store**

Create `src/lib/stores/state.svelte.ts`:

```typescript
import type { LayoutMode } from '$lib/engine/figlet-renderer';

export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial';

export interface AppState {
  // Input
  text: string;
  fontId: string;
  layout: LayoutMode;

  // Color
  paletteId: string;
  gradientDirection: GradientDirection;

  // Effects
  glowIntensity: number;   // 0-100
  dripDensity: number;      // 0-100
  shadowOffset: number;     // 0-6
  distressIntensity: number; // 0-50

  // Animations
  animationsEnabled: boolean;
}

const defaults: AppState = {
  text: 'DOOM',
  fontId: 'Doom',
  layout: 'default',
  paletteId: 'hellfire',
  gradientDirection: 'horizontal',
  glowIntensity: 60,
  dripDensity: 0,
  shadowOffset: 0,
  distressIntensity: 0,
  animationsEnabled: true,
};

function createAppState() {
  let text = $state(defaults.text);
  let fontId = $state(defaults.fontId);
  let layout = $state<LayoutMode>(defaults.layout);
  let paletteId = $state(defaults.paletteId);
  let gradientDirection = $state<GradientDirection>(defaults.gradientDirection);
  let glowIntensity = $state(defaults.glowIntensity);
  let dripDensity = $state(defaults.dripDensity);
  let shadowOffset = $state(defaults.shadowOffset);
  let distressIntensity = $state(defaults.distressIntensity);
  let animationsEnabled = $state(defaults.animationsEnabled);

  return {
    get text() { return text; },
    set text(v: string) { text = v; },

    get fontId() { return fontId; },
    set fontId(v: string) { fontId = v; },

    get layout() { return layout; },
    set layout(v: LayoutMode) { layout = v; },

    get paletteId() { return paletteId; },
    set paletteId(v: string) { paletteId = v; },

    get gradientDirection() { return gradientDirection; },
    set gradientDirection(v: GradientDirection) { gradientDirection = v; },

    get glowIntensity() { return glowIntensity; },
    set glowIntensity(v: number) { glowIntensity = v; },

    get dripDensity() { return dripDensity; },
    set dripDensity(v: number) { dripDensity = v; },

    get shadowOffset() { return shadowOffset; },
    set shadowOffset(v: number) { shadowOffset = v; },

    get distressIntensity() { return distressIntensity; },
    set distressIntensity(v: number) { distressIntensity = v; },

    get animationsEnabled() { return animationsEnabled; },
    set animationsEnabled(v: boolean) { animationsEnabled = v; },

    reset() {
      text = defaults.text;
      fontId = defaults.fontId;
      layout = defaults.layout;
      paletteId = defaults.paletteId;
      gradientDirection = defaults.gradientDirection;
      glowIntensity = defaults.glowIntensity;
      dripDensity = defaults.dripDensity;
      shadowOffset = defaults.shadowOffset;
      distressIntensity = defaults.distressIntensity;
      animationsEnabled = defaults.animationsEnabled;
    },
  };
}

export const appState = createAppState();
```

**Step 2: Verify TypeScript compiles**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npx svelte-check
```

Expected: No errors.

**Step 3: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/stores/state.svelte.ts
git commit -m "feat: add Svelte 5 runes global state store"
```

---

### Task 10: Build AsciiPreview Component

**Files:**
- Create: `src/lib/components/AsciiPreview.svelte`
- Modify: `src/routes/+page.svelte`

**Step 1: Create the preview component**

Create `src/lib/components/AsciiPreview.svelte`:

```svelte
<script lang="ts">
  import { renderAscii, type RenderResult } from '$lib/engine/figlet-renderer';
  import { appState } from '$lib/stores/state.svelte';

  let asciiResult = $state<RenderResult | null>(null);
  let error = $state<string | null>(null);
  let loading = $state(false);

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout>;

  // Re-render when inputs change
  $effect(() => {
    const { text, fontId, layout } = appState;

    clearTimeout(debounceTimer);
    if (!text.trim()) {
      asciiResult = null;
      error = null;
      return;
    }

    loading = true;
    debounceTimer = setTimeout(async () => {
      try {
        asciiResult = await renderAscii({ text, fontId, layout });
        error = null;
      } catch (e) {
        error = e instanceof Error ? e.message : 'Render failed';
        asciiResult = null;
      } finally {
        loading = false;
      }
    }, 150);
  });
</script>

<div class="scanlines relative h-full min-h-[200px] overflow-auto rounded-lg border border-doom-surface bg-doom-dark p-6">
  {#if loading}
    <p class="animate-pulse text-doom-text-muted">Rendering...</p>
  {:else if error}
    <p class="text-doom-red">{error}</p>
  {:else if asciiResult}
    <pre
      class="whitespace-pre font-mono text-xs leading-none text-doom-text sm:text-sm"
      style="text-shadow: 0 0 {appState.glowIntensity * 0.07}px var(--color-doom-glow),
                          0 0 {appState.glowIntensity * 0.2}px var(--color-doom-glow),
                          0 0 {appState.glowIntensity * 0.42}px var(--color-doom-red),
                          0 0 {appState.glowIntensity * 0.82}px var(--color-doom-red);"
    >{asciiResult.text}</pre>
  {:else}
    <p class="text-doom-text-muted">Type something to generate ASCII art...</p>
  {/if}
</div>
```

**Step 2: Wire into +page.svelte**

Replace `src/routes/+page.svelte` with:

```svelte
<script lang="ts">
  import AsciiPreview from '$lib/components/AsciiPreview.svelte';
  import { appState } from '$lib/stores/state.svelte';
  import { DOOM_FONTS } from '$lib/theme/fonts';
</script>

<svelte:head>
  <title>DOOMGEN — ASCII Art Logo Generator</title>
  <meta name="description" content="Generate DOOM-styled ASCII art logos with color gradients, glow effects, and multiple export formats." />
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">

  <!-- Header -->
  <header class="flex items-center justify-between pb-6">
    <h1 class="metal-text text-4xl font-bold tracking-wider sm:text-5xl">DOOMGEN</h1>
    <a
      href="https://github.com/rarnold/doomgen"
      target="_blank"
      rel="noopener noreferrer"
      class="text-doom-text-muted transition-colors hover:text-doom-glow"
      aria-label="View on GitHub"
    >
      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    </a>
  </header>

  <!-- Preview Area -->
  <section class="mb-6 flex-1">
    <AsciiPreview />
  </section>

  <!-- Controls -->
  <section class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">

    <!-- Input Controls -->
    <div class="space-y-4 rounded-lg border border-doom-surface bg-doom-dark p-4">
      <h2 class="text-sm font-bold uppercase tracking-widest text-doom-text-muted">Input</h2>

      <label class="block">
        <span class="mb-1 block text-sm text-doom-text-muted">Text</span>
        <input
          type="text"
          bind:value={appState.text}
          placeholder="Enter text..."
          maxlength="30"
          class="w-full rounded border border-doom-surface bg-doom-black px-3 py-2 font-mono text-doom-text placeholder-doom-text-muted focus:border-doom-red focus:outline-none"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-sm text-doom-text-muted">Font</span>
        <select
          bind:value={appState.fontId}
          class="w-full rounded border border-doom-surface bg-doom-black px-3 py-2 font-mono text-doom-text focus:border-doom-red focus:outline-none"
        >
          {#each DOOM_FONTS as font}
            <option value={font.id}>{font.label} — {font.description}</option>
          {/each}
        </select>
      </label>

      <label class="block">
        <span class="mb-1 block text-sm text-doom-text-muted">Layout</span>
        <select
          bind:value={appState.layout}
          class="w-full rounded border border-doom-surface bg-doom-black px-3 py-2 font-mono text-doom-text focus:border-doom-red focus:outline-none"
        >
          <option value="default">Default</option>
          <option value="full">Full</option>
          <option value="fitted">Fitted</option>
        </select>
      </label>
    </div>

    <!-- Style Controls -->
    <div class="space-y-4 rounded-lg border border-doom-surface bg-doom-dark p-4">
      <h2 class="text-sm font-bold uppercase tracking-widest text-doom-text-muted">Style</h2>

      <label class="block">
        <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
          <span>Glow</span>
          <span>{appState.glowIntensity}%</span>
        </span>
        <input
          type="range"
          min="0"
          max="100"
          bind:value={appState.glowIntensity}
          class="w-full accent-doom-red"
        />
      </label>

      <!-- Palette, Direction, Drip, Shadow, Distress controls will be added in Phase 3 -->
      <p class="text-sm text-doom-text-muted">More style controls coming in Phase 3...</p>
    </div>

  </section>

  <!-- Export Bar -->
  <footer class="flex flex-wrap gap-3 rounded-lg border border-doom-surface bg-doom-dark p-4">
    <span class="text-sm text-doom-text-muted">Export options coming in Phase 4...</span>
  </footer>

</div>
```

**Step 3: Verify in browser**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run dev
```

Expected: The page shows "DOOM" rendered in figlet's Doom font with red glow. Changing the text input updates the preview in real-time. Changing the font dropdown re-renders with a different figlet font. The glow slider adjusts the text-shadow intensity.

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/components/AsciiPreview.svelte src/routes/+page.svelte
git commit -m "feat: add AsciiPreview component with real-time figlet rendering and glow"
```

---

## Phase 3: Color & Effects

### Task 11: Build Color Palette System

**Files:**
- Create: `src/lib/theme/palettes.ts`
- Create: `src/lib/engine/colorizer.ts`

**Step 1: Create palette definitions**

Create `src/lib/theme/palettes.ts`:

```typescript
export interface Palette {
  id: string;
  label: string;
  description: string;
  colors: string[];
}

export const DOOM_PALETTES: Palette[] = [
  {
    id: 'hellfire',
    label: 'Hellfire',
    description: 'Hell fire, lava',
    colors: ['#1a0000', '#8b0000', '#ff0000', '#ff4500', '#ff6600', '#ffa500', '#ffff00'],
  },
  {
    id: 'cyberdemon',
    label: 'Cyberdemon',
    description: 'Cyberdemon energy',
    colors: ['#0a0a2e', '#1a1a4e', '#4040ff', '#00ffff', '#ffffff'],
  },
  {
    id: 'toxic-waste',
    label: 'Toxic Waste',
    description: 'Radiation barrels',
    colors: ['#001a00', '#003300', '#006600', '#00cc00', '#00ff00', '#88ff88'],
  },
  {
    id: 'cacodemon',
    label: 'Cacodemon',
    description: 'Cacodemon purple',
    colors: ['#0a001a', '#1a0033', '#3300ff', '#6600ff', '#9933ff', '#cc66ff'],
  },
  {
    id: 'bfg-9000',
    label: 'BFG 9000',
    description: 'BFG energy blast',
    colors: ['#001a00', '#00ff00', '#33ff33', '#66ff66', '#ccffcc', '#ffffff'],
  },
  {
    id: 'baron',
    label: 'Baron',
    description: 'Baron of Hell',
    colors: ['#1a0a00', '#4d1a00', '#993300', '#cc4400', '#ff6600', '#ffaa00'],
  },
];

export function getPaletteById(id: string): Palette {
  return DOOM_PALETTES.find((p) => p.id === id) ?? DOOM_PALETTES[0];
}
```

**Step 2: Create the colorizer engine**

Create `src/lib/engine/colorizer.ts`:

```typescript
import chroma from 'chroma-js';
import type { Palette } from '$lib/theme/palettes';
import type { GradientDirection } from '$lib/stores/state.svelte';

export interface ColoredChar {
  char: string;
  color: string;
}

export type ColoredLine = ColoredChar[];

/**
 * Apply color gradient to ASCII art lines.
 * Returns a 2D array of { char, color } objects.
 */
export function colorize(
  lines: string[],
  palette: Palette,
  direction: GradientDirection
): ColoredLine[] {
  const scale = chroma.scale(palette.colors).mode('oklch');
  const height = lines.length;
  const width = Math.max(...lines.map((l) => l.length));

  return lines.map((line, row) =>
    Array.from(line).map((char, col) => {
      if (char === ' ') {
        return { char, color: 'transparent' };
      }
      const t = getGradientT(row, col, height, width, direction);
      return { char, color: scale(t).hex() };
    })
  );
}

function getGradientT(
  row: number,
  col: number,
  height: number,
  width: number,
  direction: GradientDirection
): number {
  switch (direction) {
    case 'horizontal':
      return width > 1 ? col / (width - 1) : 0;
    case 'vertical':
      return height > 1 ? row / (height - 1) : 0;
    case 'diagonal':
      return width + height > 2 ? (col + row) / (width + height - 2) : 0;
    case 'radial': {
      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
      return maxDist > 0 ? dist / maxDist : 0;
    }
  }
}

/**
 * Get the glow color for a palette (brightest stop).
 */
export function getGlowColor(palette: Palette): string {
  const brightest = palette.colors.reduce((a, b) =>
    chroma(a).luminance() > chroma(b).luminance() ? a : b
  );
  return brightest;
}
```

**Step 3: Verify TypeScript compiles**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npx svelte-check
```

Expected: No errors in the new files.

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/theme/palettes.ts src/lib/engine/colorizer.ts
git commit -m "feat: add DOOM color palette system and per-character colorizer engine"
```

---

### Task 12: Build Effects Engine

**Files:**
- Create: `src/lib/engine/effects.ts`

**Step 1: Create the effects processor**

Create `src/lib/engine/effects.ts`:

```typescript
import type { ColoredLine } from './colorizer';

/**
 * Apply drip effect below the ASCII art.
 * Appends drip lines below characters at the bottom edge.
 */
export function applyDrip(lines: ColoredLine, density: number): ColoredLine[] {
  if (density <= 0 || lines.length === 0) return [];

  const lastLine = lines[lines.length - 1];
  const dripChars = ['|', ':', ';', '.'];
  const maxDripLength = 5;
  const dripLines: ColoredLine[] = [];

  // Initialize drip columns
  const dripColumns: { color: string; length: number }[] = lastLine.map((cell) => {
    if (cell.char !== ' ' && cell.color !== 'transparent' && Math.random() * 100 < density) {
      return { color: cell.color, length: Math.floor(Math.random() * maxDripLength) + 1 };
    }
    return { color: 'transparent', length: 0 };
  });

  const maxLen = Math.max(...dripColumns.map((d) => d.length), 0);

  for (let row = 0; row < maxLen; row++) {
    const dripLine: ColoredLine[number][] = dripColumns.map((col) => {
      if (row < col.length) {
        const charIndex = Math.min(row, dripChars.length - 1);
        return { char: dripChars[charIndex], color: col.color };
      }
      return { char: ' ', color: 'transparent' };
    });
    dripLines.push(dripLine);
  }

  return dripLines;
}

/**
 * Apply distress effect to ASCII art.
 * Randomly removes characters to create a battle-damaged look.
 */
export function applyDistress(lines: ColoredLine[], intensity: number): ColoredLine[] {
  if (intensity <= 0) return lines;

  return lines.map((line) =>
    line.map((cell) => {
      if (cell.char === ' ' || cell.color === 'transparent') return cell;
      if (Math.random() * 100 < intensity) {
        return { char: ' ', color: 'transparent' };
      }
      return cell;
    })
  );
}
```

**Step 2: Verify TypeScript compiles**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npx svelte-check
```

Expected: No errors.

**Step 3: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/engine/effects.ts
git commit -m "feat: add drip and distress effects engine"
```

---

### Task 13: Build PaletteSelector and EffectControls Components

**Files:**
- Create: `src/lib/components/PaletteSelector.svelte`
- Create: `src/lib/components/EffectControls.svelte`

**Step 1: Create PaletteSelector**

Create `src/lib/components/PaletteSelector.svelte`:

```svelte
<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import { DOOM_PALETTES } from '$lib/theme/palettes';
</script>

<div class="space-y-2">
  <span class="mb-1 block text-sm text-doom-text-muted">Palette</span>
  <div class="grid grid-cols-2 gap-2">
    {#each DOOM_PALETTES as palette}
      <button
        class="flex items-center gap-2 rounded border px-3 py-2 text-left text-sm transition-colors {appState.paletteId === palette.id
          ? 'border-doom-red bg-doom-surface text-doom-text'
          : 'border-doom-surface bg-doom-black text-doom-text-muted hover:border-doom-red/50'}"
        onclick={() => (appState.paletteId = palette.id)}
      >
        <span
          class="inline-flex h-4 w-8 shrink-0 rounded"
          style="background: linear-gradient(90deg, {palette.colors.join(', ')});"
        ></span>
        <span class="truncate">{palette.label}</span>
      </button>
    {/each}
  </div>
</div>
```

**Step 2: Create EffectControls**

Create `src/lib/components/EffectControls.svelte`:

```svelte
<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import type { GradientDirection } from '$lib/stores/state.svelte';

  const directions: { value: GradientDirection; label: string }[] = [
    { value: 'horizontal', label: 'H' },
    { value: 'vertical', label: 'V' },
    { value: 'diagonal', label: 'D' },
    { value: 'radial', label: 'R' },
  ];
</script>

<div class="space-y-4">
  <!-- Gradient Direction -->
  <div>
    <span class="mb-1 block text-sm text-doom-text-muted">Direction</span>
    <div class="flex gap-2">
      {#each directions as dir}
        <button
          class="rounded border px-3 py-1 text-sm font-mono transition-colors {appState.gradientDirection === dir.value
            ? 'border-doom-red bg-doom-surface text-doom-text'
            : 'border-doom-surface bg-doom-black text-doom-text-muted hover:border-doom-red/50'}"
          onclick={() => (appState.gradientDirection = dir.value)}
        >
          {dir.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Glow -->
  <label class="block">
    <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
      <span>Glow</span>
      <span>{appState.glowIntensity}%</span>
    </span>
    <input type="range" min="0" max="100" bind:value={appState.glowIntensity} class="w-full accent-doom-red" />
  </label>

  <!-- Drip -->
  <label class="block">
    <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
      <span>Drip</span>
      <span>{appState.dripDensity}%</span>
    </span>
    <input type="range" min="0" max="100" bind:value={appState.dripDensity} class="w-full accent-doom-red" />
  </label>

  <!-- Shadow -->
  <label class="block">
    <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
      <span>Shadow</span>
      <span>{appState.shadowOffset}px</span>
    </span>
    <input type="range" min="0" max="6" bind:value={appState.shadowOffset} class="w-full accent-doom-red" />
  </label>

  <!-- Distress -->
  <label class="block">
    <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
      <span>Distress</span>
      <span>{appState.distressIntensity}%</span>
    </span>
    <input type="range" min="0" max="50" bind:value={appState.distressIntensity} class="w-full accent-doom-red" />
  </label>
</div>
```

**Step 3: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/components/PaletteSelector.svelte src/lib/components/EffectControls.svelte
git commit -m "feat: add PaletteSelector and EffectControls components"
```

---

### Task 14: Upgrade AsciiPreview to Colored Per-Character Rendering

**Files:**
- Modify: `src/lib/components/AsciiPreview.svelte`
- Modify: `src/routes/+page.svelte`

**Step 1: Rewrite AsciiPreview with colorizer and effects**

Replace `src/lib/components/AsciiPreview.svelte` with:

```svelte
<script lang="ts">
  import { renderAscii, type RenderResult } from '$lib/engine/figlet-renderer';
  import { colorize, getGlowColor, type ColoredLine } from '$lib/engine/colorizer';
  import { applyDrip, applyDistress } from '$lib/engine/effects';
  import { appState } from '$lib/stores/state.svelte';
  import { getPaletteById } from '$lib/theme/palettes';

  let asciiResult = $state<RenderResult | null>(null);
  let coloredLines = $state<ColoredLine[]>([]);
  let glowColor = $state('#ff3f3f');
  let error = $state<string | null>(null);
  let loading = $state(false);

  let previewEl: HTMLDivElement;
  let debounceTimer: ReturnType<typeof setTimeout>;

  // Re-render when inputs change
  $effect(() => {
    const { text, fontId, layout } = appState;

    clearTimeout(debounceTimer);
    if (!text.trim()) {
      asciiResult = null;
      coloredLines = [];
      error = null;
      return;
    }

    loading = true;
    debounceTimer = setTimeout(async () => {
      try {
        asciiResult = await renderAscii({ text, fontId, layout });
        error = null;
      } catch (e) {
        error = e instanceof Error ? e.message : 'Render failed';
        asciiResult = null;
        coloredLines = [];
      } finally {
        loading = false;
      }
    }, 150);
  });

  // Re-colorize when palette/direction/effects change
  $effect(() => {
    if (!asciiResult) {
      coloredLines = [];
      return;
    }
    const palette = getPaletteById(appState.paletteId);
    glowColor = getGlowColor(palette);

    let lines = colorize(asciiResult.lines, palette, appState.gradientDirection);

    // Apply distress
    if (appState.distressIntensity > 0) {
      lines = applyDistress(lines, appState.distressIntensity);
    }

    // Apply drip
    if (appState.dripDensity > 0) {
      const dripLines = applyDrip(lines, appState.dripDensity);
      lines = [...lines, ...dripLines];
    }

    coloredLines = lines;
  });

  export function getPreviewElement(): HTMLDivElement {
    return previewEl;
  }
</script>

<div
  bind:this={previewEl}
  class="scanlines relative h-full min-h-[200px] overflow-auto rounded-lg border border-doom-surface bg-doom-dark p-6"
>
  {#if loading}
    <p class="animate-pulse text-doom-text-muted">Rendering...</p>
  {:else if error}
    <p class="text-doom-red">{error}</p>
  {:else if coloredLines.length > 0}
    <pre
      class="whitespace-pre font-mono text-xs leading-none sm:text-sm"
      style={appState.shadowOffset > 0
        ? `filter: drop-shadow(${appState.shadowOffset}px ${appState.shadowOffset}px 0px rgba(0,0,0,0.8));`
        : ''}
    >{#each coloredLines as line}{#each line as cell}<span
          style="color: {cell.color};{cell.color !== 'transparent' && appState.glowIntensity > 0
            ? ` text-shadow: 0 0 ${appState.glowIntensity * 0.07}px ${glowColor}, 0 0 ${appState.glowIntensity * 0.2}px ${glowColor}, 0 0 ${appState.glowIntensity * 0.42}px ${glowColor}, 0 0 ${appState.glowIntensity * 0.82}px ${glowColor};`
            : ''}"
        >{cell.char}</span>{/each}
{/each}</pre>
  {:else}
    <p class="text-doom-text-muted">Type something to generate ASCII art...</p>
  {/if}
</div>
```

Note: The `{#each}` and `<span>` tags are intentionally on the same line with no whitespace to prevent extra spaces in the ASCII output. The newline after `{/each}` for lines produces the actual line breaks.

**Step 2: Wire PaletteSelector and EffectControls into +page.svelte**

In `src/routes/+page.svelte`, replace the Style Controls section:

Replace:
```svelte
    <!-- Style Controls -->
    <div class="space-y-4 rounded-lg border border-doom-surface bg-doom-dark p-4">
      <h2 class="text-sm font-bold uppercase tracking-widest text-doom-text-muted">Style</h2>

      <label class="block">
        <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
          <span>Glow</span>
          <span>{appState.glowIntensity}%</span>
        </span>
        <input
          type="range"
          min="0"
          max="100"
          bind:value={appState.glowIntensity}
          class="w-full accent-doom-red"
        />
      </label>

      <!-- Palette, Direction, Drip, Shadow, Distress controls will be added in Phase 3 -->
      <p class="text-sm text-doom-text-muted">More style controls coming in Phase 3...</p>
    </div>
```

With:
```svelte
    <!-- Style Controls -->
    <div class="space-y-4 rounded-lg border border-doom-surface bg-doom-dark p-4">
      <h2 class="text-sm font-bold uppercase tracking-widest text-doom-text-muted">Style</h2>
      <PaletteSelector />
      <EffectControls />
    </div>
```

And add the imports at the top of the script:
```svelte
<script lang="ts">
  import AsciiPreview from '$lib/components/AsciiPreview.svelte';
  import PaletteSelector from '$lib/components/PaletteSelector.svelte';
  import EffectControls from '$lib/components/EffectControls.svelte';
  import { appState } from '$lib/stores/state.svelte';
  import { DOOM_FONTS } from '$lib/theme/fonts';
</script>
```

**Step 3: Verify in browser**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run dev
```

Expected: ASCII art now renders with color gradients from the selected palette. Palette buttons show gradient swatches and switch the color scheme. Direction buttons change gradient orientation (H/V/D/R). Glow slider adjusts per-character text-shadow. Drip slider adds descending characters below the art. Shadow slider adds drop-shadow depth. Distress slider randomly removes characters.

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/components/AsciiPreview.svelte src/routes/+page.svelte src/lib/components/PaletteSelector.svelte src/lib/components/EffectControls.svelte
git commit -m "feat: add colored per-character rendering with palettes, gradients, and effects"
```

---

## Phase 4: Export

### Task 15: Build Export Engine

**Files:**
- Create: `src/lib/engine/exporter.ts`

**Step 1: Create the exporter**

Create `src/lib/engine/exporter.ts`:

```typescript
import { toPng } from 'html-to-image';
import chroma from 'chroma-js';
import type { ColoredLine } from './colorizer';

/**
 * Copy plain ASCII text to clipboard (no color).
 */
export async function copyText(lines: string[]): Promise<void> {
  const text = lines.join('\n');
  await navigator.clipboard.writeText(text);
}

/**
 * Capture preview DOM element as PNG and copy to clipboard.
 */
export async function copyImage(element: HTMLElement): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: window.devicePixelRatio * 2,
    backgroundColor: '#0a0a0a',
  });
  const blob = await (await fetch(dataUrl)).blob();
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob }),
  ]);
}

/**
 * Download preview DOM element as PNG file.
 */
export async function downloadPng(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: window.devicePixelRatio * 2,
    backgroundColor: '#0a0a0a',
  });
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Generate and download SVG file.
 */
export function downloadSvg(coloredLines: ColoredLine[], filename: string): void {
  const lineHeight = 16;
  const charWidth = 9.6; // approximate for monospace at 16px
  const width = Math.max(...coloredLines.map((l) => l.length)) * charWidth + 40;
  const height = coloredLines.length * lineHeight + 40;

  const textElements = coloredLines
    .map((line, row) => {
      const spans = line
        .map((cell, col) => {
          if (cell.char === ' ' || cell.color === 'transparent') return '';
          const x = col * charWidth + 20;
          const escaped = cell.char
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          return `<tspan x="${x}" fill="${cell.color}">${escaped}</tspan>`;
        })
        .filter(Boolean)
        .join('');
      const y = row * lineHeight + 20 + lineHeight;
      return `<text y="${y}" font-family="'JetBrains Mono', monospace" font-size="14">${spans}</text>`;
    })
    .join('\n  ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  ${textElements}
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.download = `${filename}.svg`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Generate and download ANSI-colored text file.
 */
export function downloadAnsi(coloredLines: ColoredLine[], filename: string): void {
  const reset = '\x1b[0m';
  const ansiLines = coloredLines.map((line) =>
    line
      .map((cell) => {
        if (cell.char === ' ' || cell.color === 'transparent') return cell.char;
        const [r, g, b] = chroma(cell.color).rgb();
        return `\x1b[38;2;${r};${g};${b}m${cell.char}${reset}`;
      })
      .join('')
  );

  const text = ansiLines.join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = `${filename}.ans`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
```

**Step 2: Verify TypeScript compiles**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npx svelte-check
```

Expected: No errors.

**Step 3: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/engine/exporter.ts
git commit -m "feat: add export engine (PNG, SVG, ANSI, clipboard text/image)"
```

---

### Task 16: Build ExportBar Component

**Files:**
- Create: `src/lib/components/ExportBar.svelte`
- Modify: `src/routes/+page.svelte`

**Step 1: Create ExportBar**

Create `src/lib/components/ExportBar.svelte`:

```svelte
<script lang="ts">
  import { copyText, copyImage, downloadPng, downloadSvg, downloadAnsi } from '$lib/engine/exporter';
  import type { ColoredLine } from '$lib/engine/colorizer';

  interface Props {
    asciiLines: string[];
    coloredLines: ColoredLine[];
    previewElement: HTMLElement | null;
    filename: string;
  }

  let { asciiLines, coloredLines, previewElement, filename }: Props = $props();

  let feedback = $state<string | null>(null);
  let feedbackTimer: ReturnType<typeof setTimeout>;

  function showFeedback(msg: string) {
    feedback = msg;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => (feedback = null), 2000);
  }

  async function handleCopyText() {
    try {
      await copyText(asciiLines);
      showFeedback('Text copied!');
    } catch {
      showFeedback('Copy failed');
    }
  }

  async function handleCopyImage() {
    if (!previewElement) return;
    try {
      await copyImage(previewElement);
      showFeedback('Image copied!');
    } catch {
      showFeedback('Copy failed');
    }
  }

  async function handleDownloadPng() {
    if (!previewElement) return;
    try {
      await downloadPng(previewElement, filename);
      showFeedback('PNG downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadSvg() {
    try {
      downloadSvg(coloredLines, filename);
      showFeedback('SVG downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadAnsi() {
    try {
      downloadAnsi(coloredLines, filename);
      showFeedback('ANSI downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  const btnClass = 'rounded border border-doom-surface bg-doom-black px-4 py-2 text-sm font-mono text-doom-text-muted transition-colors hover:border-doom-red hover:text-doom-text active:bg-doom-surface';
</script>

<div class="flex flex-wrap items-center gap-3">
  <button class={btnClass} onclick={handleCopyText}>Copy Text</button>
  <button class={btnClass} onclick={handleCopyImage} disabled={!previewElement}>Copy Image</button>
  <button class={btnClass} onclick={handleDownloadPng} disabled={!previewElement}>PNG</button>
  <button class={btnClass} onclick={handleDownloadSvg}>SVG</button>
  <button class={btnClass} onclick={handleDownloadAnsi}>ANSI</button>

  {#if feedback}
    <span class="text-sm text-doom-green">{feedback}</span>
  {/if}
</div>
```

**Step 2: Wire ExportBar into +page.svelte**

In `src/routes/+page.svelte`:

1. Add import: `import ExportBar from '$lib/components/ExportBar.svelte';`
2. Add a reference to the AsciiPreview component to get its DOM element. This requires refactoring to pass data up. Add these state variables in the script block:

```typescript
let previewComponent: AsciiPreview;
let previewElement: HTMLElement | null = $state(null);

// Derived from appState for export
$effect(() => {
  // After preview renders, grab the DOM element
  if (previewComponent) {
    previewElement = previewComponent.getPreviewElement();
  }
});
```

3. Update the AsciiPreview usage:
```svelte
<AsciiPreview bind:this={previewComponent} />
```

4. Replace the export footer:
```svelte
  <footer class="rounded-lg border border-doom-surface bg-doom-dark p-4">
    <ExportBar
      asciiLines={[]}
      coloredLines={[]}
      previewElement={previewElement}
      filename={appState.text.toLowerCase().replace(/\s+/g, '-') || 'doomgen'}
    />
  </footer>
```

Note: We'll need to expose `asciiLines` and `coloredLines` from AsciiPreview. Add these as bindable exports from AsciiPreview or lift the render state up to +page.svelte. The simpler approach is to expose them from AsciiPreview via exported getters or $bindable props. The exact wiring will be adjusted during implementation — the key pattern is:

- AsciiPreview exposes `asciiResult.lines` and `coloredLines` via exported properties
- +page.svelte reads them and passes to ExportBar

**Step 3: Verify in browser**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run dev
```

Expected: Five export buttons appear at the bottom. "Copy Text" copies plain ASCII to clipboard. "Copy Image" captures the styled preview as PNG to clipboard. "PNG" downloads a PNG file. "SVG" downloads an SVG file. "ANSI" downloads a `.ans` file. Brief green feedback text appears after each action.

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/components/ExportBar.svelte src/routes/+page.svelte src/lib/components/AsciiPreview.svelte
git commit -m "feat: add export bar with copy text/image, download PNG/SVG/ANSI"
```

---

## Phase 5: Animation & Polish

### Task 17: Add GSAP Animations

**Files:**
- Modify: `src/lib/components/AsciiPreview.svelte`
- Modify: `src/routes/+layout.svelte`

**Step 1: Add page load animation to +layout.svelte**

In `src/routes/+layout.svelte`, add GSAP page entrance:

```svelte
<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  let { children } = $props();
  let container: HTMLDivElement;

  onMount(() => {
    gsap.from(container, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
</script>

<div bind:this={container} class="vignette min-h-screen bg-doom-black font-mono text-doom-text">
  {@render children()}
</div>
```

**Step 2: Add letter reveal animation to AsciiPreview**

In `AsciiPreview.svelte`, after the colored lines render, add a GSAP stagger animation on the `<span>` elements. Add to the script block:

```typescript
import gsap from 'gsap';
import { tick } from 'svelte';

// After coloredLines updates, animate new spans
$effect(() => {
  if (coloredLines.length > 0 && appState.animationsEnabled) {
    tick().then(() => {
      if (!previewEl) return;
      const spans = previewEl.querySelectorAll('pre span');
      gsap.fromTo(
        spans,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.02,
          stagger: 0.001,
          ease: 'none',
        }
      );
    });
  }
});
```

**Step 3: Verify animations**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run dev
```

Expected: Page fades in on load. ASCII art characters appear with a rapid stagger animation when text changes. Animations are subtle and fast — they should feel like a CRT display lighting up.

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/routes/+layout.svelte src/lib/components/AsciiPreview.svelte
git commit -m "feat: add GSAP page load and letter reveal animations"
```

---

### Task 18: Mobile Responsive Layout

**Files:**
- Modify: `src/routes/+page.svelte`
- Modify: `src/lib/components/ExportBar.svelte`

**Step 1: Ensure responsive breakpoints**

The layout already uses `md:grid-cols-2` for the controls grid, which stacks on mobile. Verify and adjust:

- Preview area: Add `overflow-x-auto` (already has `overflow-auto`)
- On small screens, reduce font size of ASCII: `text-[0.5rem] sm:text-xs md:text-sm`
- Export bar on mobile: Show "Copy" and "PNG" prominently, put others behind a "More" dropdown

Update ExportBar to show only essential buttons on mobile:

```svelte
<div class="flex flex-wrap items-center gap-3">
  <button class="{btnClass}" onclick={handleCopyText}>Copy Text</button>
  <button class="{btnClass}" onclick={handleDownloadPng} disabled={!previewElement}>PNG</button>
  <button class="{btnClass} hidden sm:inline-flex" onclick={handleCopyImage} disabled={!previewElement}>Copy Image</button>
  <button class="{btnClass} hidden sm:inline-flex" onclick={handleDownloadSvg}>SVG</button>
  <button class="{btnClass} hidden sm:inline-flex" onclick={handleDownloadAnsi}>ANSI</button>
  <!-- Mobile: show all in a dropdown or just show them all on wrap -->

  {#if feedback}
    <span class="text-sm text-doom-green">{feedback}</span>
  {/if}
</div>
```

**Step 2: Test at mobile viewport**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run dev
```

Open browser DevTools, toggle device toolbar, test at 375px width (iPhone SE). Verify controls stack vertically, preview is horizontally scrollable, export buttons wrap.

**Step 3: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/routes/+page.svelte src/lib/components/ExportBar.svelte src/lib/components/AsciiPreview.svelte
git commit -m "feat: add mobile responsive layout with stacked controls and scrollable preview"
```

---

### Task 19: Performance Optimization

**Files:**
- Modify: `src/lib/components/AsciiPreview.svelte`
- Modify: `src/lib/engine/figlet-renderer.ts`

**Step 1: Preload the Doom font**

In `src/lib/engine/figlet-renderer.ts`, add an initialization function:

```typescript
/**
 * Preload the default Doom font on app startup.
 */
export async function preloadDefaultFont(): Promise<void> {
  await loadFont('Doom');
}
```

Call this in `+layout.svelte` on mount:

```typescript
import { preloadDefaultFont } from '$lib/engine/figlet-renderer';

onMount(() => {
  preloadDefaultFont();
  // ... existing animation code
});
```

**Step 2: Debounce input and add font loading check**

The 150ms debounce in AsciiPreview already handles rapid input. Verify the JetBrains Mono font loads before first render. In `+layout.svelte`:

```typescript
onMount(async () => {
  await document.fonts.load('16px "JetBrains Mono"');
  preloadDefaultFont();
  // ... animation
});
```

**Step 3: Verify build size**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
npm run build
```

Check `build/_app/` for JS chunk sizes. Total gzipped should be under 300KB.

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add src/lib/engine/figlet-renderer.ts src/routes/+layout.svelte
git commit -m "perf: preload default font and verify web font loading"
```

---

## Phase 6: Ship

### Task 20: Final Build Verification and Testing

**Files:**
- Create: `UNITTEST/test-build.sh`
- Create: `TOOLS/full_test_cycle.sh`

**Step 1: Create build test script**

Create `UNITTEST/test-build.sh`:

```bash
#!/bin/bash
set -e
echo "=== DOOMGEN Build Test ==="

cd /Users/rarnold/Projects/doomgen

echo "1. Running svelte-check..."
npx svelte-check
echo "   ✓ Type check passed"

echo "2. Running production build..."
npm run build
echo "   ✓ Build succeeded"

echo "3. Verifying build output..."
if [ -f build/index.html ]; then
  echo "   ✓ index.html exists"
else
  echo "   ✗ index.html missing!" && exit 1
fi

if [ -d build/_app ]; then
  echo "   ✓ _app directory exists"
else
  echo "   ✗ _app directory missing!" && exit 1
fi

if [ -f build/fonts/JetBrainsMono-Variable.woff2 ]; then
  echo "   ✓ JetBrains Mono font exists"
else
  echo "   ✗ JetBrains Mono font missing!" && exit 1
fi

echo "4. Checking bundle size..."
TOTAL=$(du -sh build/ | cut -f1)
echo "   Total build size: $TOTAL"

echo ""
echo "=== All tests passed ==="
```

**Step 2: Create full test cycle script**

Create `TOOLS/full_test_cycle.sh`:

```bash
#!/bin/bash
set -e
echo "=== DOOMGEN Full Test Cycle ==="

cd /Users/rarnold/Projects/doomgen

echo "Step 1: Clean install"
rm -rf node_modules
npm ci

echo "Step 2: Type check"
npx svelte-check

echo "Step 3: Build"
npm run build

echo "Step 4: Run unit tests"
bash UNITTEST/test-build.sh

echo "Step 5: Preview build"
echo "Starting preview server on port 4173..."
echo "Visit http://localhost:4173/doomgen/ to verify"
echo "Press Ctrl+C to stop"
npm run preview

echo ""
echo "=== Full test cycle complete ==="
```

**Step 3: Make scripts executable and run**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
chmod +x UNITTEST/test-build.sh TOOLS/full_test_cycle.sh
bash UNITTEST/test-build.sh
```

Expected: All checks pass.

**Step 4: Commit**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add UNITTEST/test-build.sh TOOLS/full_test_cycle.sh
git commit -m "test: add build test and full test cycle scripts"
```

---

### Task 21: Add .gitignore and Clean Up

**Files:**
- Create: `.gitignore` (if not already present)

**Step 1: Ensure .gitignore is correct**

Verify `.gitignore` contains at minimum:

```
node_modules/
build/
.svelte-kit/
.env
.env.*
!.env.example
dist/
*.local
```

**Step 2: Verify git status is clean**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git status
```

Expected: Working tree clean (or only untracked files that should be in .gitignore).

**Step 3: Commit if needed**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git add .gitignore
git commit -m "chore: update .gitignore"
```

---

### Task 22: Final Commit and Tag

**Step 1: Verify everything builds**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
bash UNITTEST/test-build.sh
```

Expected: All tests pass.

**Step 2: Tag the release**

Run:
```bash
cd /Users/rarnold/Projects/doomgen
git tag -a v0.1.0 -m "DOOMGEN v0.1.0 — Initial release with ASCII art generation, DOOM palettes, effects, and export"
```

**Step 3: Summary**

At this point DOOMGEN is a fully functional ASCII art logo generator with:
- 12 curated FIGlet fonts
- 6 DOOM-themed color palettes
- 4 gradient directions (H, V, D, R)
- 4 effects (glow, drip, shadow, distress)
- 5 export formats (copy text, copy image, PNG, SVG, ANSI)
- GSAP animations
- Mobile responsive layout
- GitHub Pages deployment ready

---

## Summary of All Tasks

| # | Task | Phase | Description |
|---|------|-------|-------------|
| 1 | Scaffold SvelteKit Project | Foundation | Create project with `npx sv create`, verify dev server |
| 2 | Configure adapter-static | Foundation | Install and configure for GitHub Pages SPA |
| 3 | Set Up Tailwind CSS v4 | Foundation | Install, configure Vite plugin, create DOOM @theme |
| 4 | Self-Host Web Fonts | Foundation | Download and configure JetBrains Mono + Fira Code |
| 5 | Page Layout Shell | Foundation | Create DOOM-styled header, preview, controls, export bar |
| 6 | GitHub Actions Workflow | Foundation | Create deploy.yml for GitHub Pages |
| 7 | Install Dependencies | Core Engine | Install figlet, chroma-js, gsap, html-to-image, ansi_up |
| 8 | figlet-renderer.ts | Core Engine | Build ASCII engine wrapper with on-demand font loading |
| 9 | Global State Store | Core Engine | Create Svelte 5 runes state with all app settings |
| 10 | AsciiPreview Component | Core Engine | Build real-time preview with figlet rendering + glow |
| 11 | Color Palette System | Color & Effects | Create palettes.ts and colorizer.ts with OKLCH gradients |
| 12 | Effects Engine | Color & Effects | Build drip and distress effects processors |
| 13 | UI Controls | Color & Effects | Build PaletteSelector and EffectControls components |
| 14 | Colored Rendering | Color & Effects | Upgrade preview to per-character colored `<span>` rendering |
| 15 | Export Engine | Export | Build exporter.ts with PNG/SVG/ANSI/clipboard support |
| 16 | ExportBar Component | Export | Build export UI with feedback and wire to preview |
| 17 | GSAP Animations | Polish | Add page load fade and letter reveal stagger |
| 18 | Mobile Responsive | Polish | Ensure controls stack, preview scrolls, buttons wrap |
| 19 | Performance | Polish | Preload fonts, verify bundle size under 300KB |
| 20 | Testing | Ship | Create build test and full test cycle scripts |
| 21 | Clean Up | Ship | Verify .gitignore, clean working tree |
| 22 | Release Tag | Ship | Final build verification, tag v0.1.0 |
