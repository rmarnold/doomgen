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

  const figletOptions = {
    font: options.fontId as figlet.Fonts,
    horizontalLayout: options.layout as figlet.KerningMethods,
    verticalLayout: 'default' as figlet.KerningMethods,
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

/**
 * Preload the default Doom font on app startup.
 */
export async function preloadDefaultFont(): Promise<void> {
  await loadFont('Doom');
}
