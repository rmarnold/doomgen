import figlet from 'figlet';

const loadedFonts = new Set<string>();

// Static import map so Vite can bundle each font as a lazy chunk
const fontImports: Record<string, () => Promise<{ default: string }>> = {
  'Doom': () => import('figlet/importable-fonts/Doom.js'),
  'ANSI Shadow': () => import('figlet/importable-fonts/ANSI Shadow.js'),
  'Bloody': () => import('figlet/importable-fonts/Bloody.js'),
  'Gothic': () => import('figlet/importable-fonts/Gothic.js'),
  '3-D': () => import('figlet/importable-fonts/3-D.js'),
  'Block': () => import('figlet/importable-fonts/Block.js'),
  'Banner3-D': () => import('figlet/importable-fonts/Banner3-D.js'),
  'Poison': () => import('figlet/importable-fonts/Poison.js'),
  'Ghost': () => import('figlet/importable-fonts/Ghost.js'),
  'Graffiti': () => import('figlet/importable-fonts/Graffiti.js'),
  'Alligator': () => import('figlet/importable-fonts/Alligator.js'),
  'Isometric1': () => import('figlet/importable-fonts/Isometric1.js'),
  'Chunky': () => import('figlet/importable-fonts/Chunky.js'),
  'Slant': () => import('figlet/importable-fonts/Slant.js'),
  'Standard': () => import('figlet/importable-fonts/Standard.js'),
  'Big': () => import('figlet/importable-fonts/Big.js'),
  'Star Wars': () => import('figlet/importable-fonts/Star Wars.js'),
  'Cyberlarge': () => import('figlet/importable-fonts/Cyberlarge.js'),
  'Larry 3D': () => import('figlet/importable-fonts/Larry 3D.js'),
  'Ogre': () => import('figlet/importable-fonts/Ogre.js'),
  'Colossal': () => import('figlet/importable-fonts/Colossal.js'),
  'Small Slant': () => import('figlet/importable-fonts/Small Slant.js'),
  'Elite': () => import('figlet/importable-fonts/Elite.js'),
  'DOS Rebel': () => import('figlet/importable-fonts/DOS Rebel.js'),
  'Rectangles': () => import('figlet/importable-fonts/Rectangles.js'),
  'Calvin S': () => import('figlet/importable-fonts/Calvin S.js'),
};

/**
 * Dynamically import and register a FIGlet font.
 * Fonts are cached after first load.
 */
async function loadFont(fontId: string): Promise<void> {
  if (loadedFonts.has(fontId)) return;

  const loader = fontImports[fontId];
  if (!loader) throw new Error(`Unknown font: ${fontId}`);

  const fontModule = await loader();
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
  await loadFont('Banner3-D');
}
