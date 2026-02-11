# DOOMGEN

ASCII art generator with DOOM aesthetics. Transform text into stylized ASCII art with authentic DOOM color palettes and visual effects.

## Features

- Real-time ASCII art generation using Figlet fonts
- Authentic DOOM color palettes (DOOM1, DOOM2, TNT, Plutonia)
- Visual effects: Glow, Drip, Distress, Drop Shadow, Pixelation, CRT Monitor (scanlines, phosphor, curvature, flicker), Screen Shake, Color Shifting
- Per-character color customization with gradient directions and brightness normalization
- Export to PNG, SVG, ANSI, Shell Banner, HTML, and JSON (with import)
- Mobile-responsive design with floating export bar
- GSAP-powered page entrance and screen shake animations
- Accessibility: respects `prefers-reduced-motion`

## Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

## Building

Create production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Testing

Run build tests:

```bash
bash UNITTEST/test-build.sh
```

Full test cycle:

```bash
bash TOOLS/full_test_cycle.sh
```

## Deployment

Deployed to GitHub Pages via GitHub Actions. Push to `main` branch triggers automatic deployment.

## Tech Stack

- SvelteKit 5 (Runes API)
- TypeScript
- Tailwind CSS v4
- Figlet.js
- GSAP
- html-to-image
- chroma-js

## License

MIT
