# DOOMGEN

ASCII art generator with DOOM aesthetics. Transform text into stylized ASCII art with authentic DOOM color palettes and visual effects.

## Features

- Real-time ASCII art generation using Figlet fonts
- Authentic DOOM color palettes (DOOM1, DOOM2, TNT, Plutonia)
- Visual effects: Pixelation, Scanlines, CRT, Screen Shake, Color Shifting
- Per-character color customization
- Export to PNG, SVG, TXT, HTML, and JSON
- Mobile-responsive design
- GSAP-powered animations

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
- html2canvas

## License

MIT
