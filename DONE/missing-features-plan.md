# Implement Missing Features: Pixelation, CRT, Screen Shake, Color Shifting, GSAP Animations, HTML/JSON Export

## Context

The README lists features that were never implemented. This plan adds them all. The app is a SvelteKit 5 static site on GitHub Pages — everything must be client-side. GSAP (`^3.14.2`) is already installed and used for page entry animations in `+layout.svelte`.

---

## Step 1: State — Add New Fields

**File**: `src/lib/stores/state.svelte.ts`

Add to `AppState` interface, `defaults`, `$state()` declarations, getters/setters, and `reset()`:

| Field | Type | Default | Range |
|-------|------|---------|-------|
| `pixelation` | `number` | `0` | 0-10 (0 = off) |
| `crtEnabled` | `boolean` | `false` | toggle |
| `crtCurvature` | `number` | `50` | 0-100 |
| `crtFlicker` | `number` | `30` | 0-100 |
| `screenShake` | `boolean` | `false` | momentary trigger |
| `colorShiftSpeed` | `number` | `0` | 0-100 (0 = off) |

---

## Step 2: CSS Effects

**File**: `src/app.css`

### CRT Classes
- `.crt-curvature` — `border-radius` from `--crt-curve` var + `overflow: hidden`
- `.crt-scanlines::before` — finer repeating gradient (2px pitch, 30% opacity)
- `.crt-phosphor::after` — RGB sub-pixel vertical stripes
- `.crt-vignette` — `box-shadow: inset 0 0 80px 20px rgba(0,0,0,0.5)`
- `.crt-flicker` — animation toggling opacity via `--crt-flicker-opacity` var

### Color Shift
- `.color-shift` — `animation: color-shift-cycle` using `--color-shift-duration` var
- `@keyframes color-shift-cycle` — `hue-rotate(0deg)` to `hue-rotate(360deg)`

### Pixelation
- `.ascii-pixelated` — `filter: url(#doomgen-pixelate)` referencing inline SVG filter

All animations auto-disabled by existing `@media (prefers-reduced-motion: reduce)` rule.

---

## Step 3: AsciiPreview — Apply Visual Effects

**File**: `src/lib/components/AsciiPreview.svelte`

### Pixelation
Add inline SVG `<filter id="doomgen-pixelate">` using `feGaussianBlur` + `feComponentTransfer` with discrete table values. Apply on `<pre>` when `appState.pixelation > 0`.

### CRT
On the preview container div, conditionally add CRT classes when `appState.crtEnabled`. Replace default `scanlines` class with CRT-specific scanlines. Set `--crt-curve`, `--crt-flicker-speed`, `--crt-flicker-opacity` via inline style.

### Color Shift
Wrap `<pre>` in a `<div>` that gets the `.color-shift` class and `--color-shift-duration` variable when `appState.colorShiftSpeed > 0`. Separate div avoids filter conflicts with pixelation/drop-shadow on the `<pre>`.

### Screen Shake (GSAP)
New `$effect` block: when `appState.screenShake` becomes true, immediately reset to false, check `prefers-reduced-motion` and `animationsEnabled`, then dynamically `import('gsap')` and run a diminishing oscillation timeline on `preRef`.

### Filter stacking
Combine pixelation + drop-shadow as space-separated values in the `<pre>` style's `filter` property.

---

## Step 4: Effect Controls UI

**File**: `src/lib/components/EffectControls.svelte`

Add throttled handlers: `onPixelation`, `onCrtCurvature`, `onCrtFlicker`, `onColorShift`.

New controls (add inside the existing sliders grid or as new sections):
- **Pixelation** slider (0-10)
- **Color Shift** slider (0-100, "Off" when 0)
- **CRT Monitor** checkbox + conditional sub-sliders for Curvature and Flicker
- **Screen Shake** button (`doom-btn`, sets `appState.screenShake = true`)

---

## Step 5: GSAP Page Animations — Add a11y Guard

**File**: `src/routes/+layout.svelte`

Import `appState`. Before running GSAP `from()`, check:
```
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion || !appState.animationsEnabled) {
  // Set all targets visible immediately
  return;
}
```

---

## Step 6: HTML Export

**File**: `src/lib/engine/exporter.ts`

New function `downloadHtml(coloredLines, filename, options)`:
- Generates standalone HTML with embedded CSS
- Includes JetBrains Mono via Google Fonts import
- Per-character `<span style="color:...">` inside `<pre>`
- Embeds bgColor, glow text-shadow, drop-shadow, CRT scanlines if enabled
- Downloads as `{filename}.html`

Options: `{ bgColor, glowIntensity, glowColor, shadowOffset, crtEnabled }`

---

## Step 7: JSON Export + Import

**File**: `src/lib/engine/exporter.ts`

### `downloadJson(coloredLines, filename)`
- Serializes full `AppState` + `coloredLines` into `DoomgenSave` object (version: 1)
- Downloads as `{filename}.doomgen.json`
- Never persists `screenShake` (always false in save)

### `importJson(file: File): Promise<boolean>`
- Reads file, parses JSON, validates version
- Applies each field to `appState` if present (forward-compatible with missing fields)
- Returns success/failure boolean

---

## Step 8: Export Bar UI

**Files**: `src/lib/components/ExportBar.svelte` + `FloatingExportBar.svelte`

Both files:
- Import new functions (`downloadHtml`, `downloadJson`, `importJson`)
- Import `getPaletteById` + `getGlowColor` to compute glow color in HTML export handler
- Add `handleDownloadHtml`, `handleDownloadJson`, `handleImportJson` handlers
- Add buttons: HTML, JSON, Import
- Add hidden `<input type="file" accept=".json,.doomgen.json">` for import
- FloatingExportBar uses SVG icon buttons matching existing style

---

## Step 9: Update README

**File**: `README.md`

Update features list, tech stack, and export formats to match actual implementation.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/stores/state.svelte.ts` | 6 new state fields |
| `src/app.css` | CRT, color-shift, pixelation CSS classes |
| `src/lib/components/AsciiPreview.svelte` | SVG filter, CRT classes, color-shift wrapper, GSAP shake |
| `src/lib/components/EffectControls.svelte` | Pixelation/CRT/ColorShift/Shake controls |
| `src/routes/+layout.svelte` | a11y guard on GSAP page animations |
| `src/lib/engine/exporter.ts` | `downloadHtml()`, `downloadJson()`, `importJson()` |
| `src/lib/components/ExportBar.svelte` | HTML, JSON, Import buttons |
| `src/lib/components/FloatingExportBar.svelte` | HTML, JSON, Import icon buttons |
| `README.md` | Update to match actual features |

No new files. No new npm dependencies.

---

## Verification

1. `npx svelte-check` — 0 errors
2. `npm run build` — succeeds
3. `bash TOOLS/full_test_cycle.sh` — all pass
4. Toggle CRT — curvature, scanlines, phosphor, vignette, flicker visible
5. Drag pixelation slider — text becomes blocky
6. Drag color shift slider — hue rotates continuously
7. Click Screen Shake — preview shakes briefly
8. Page load — sections animate in with GSAP stagger
9. Set `prefers-reduced-motion: reduce` — all animations disabled
10. Export HTML — standalone file opens in browser with correct colors/effects
11. Export JSON then Import — state fully restored
12. Deploy to GitHub Pages — all features work client-side
