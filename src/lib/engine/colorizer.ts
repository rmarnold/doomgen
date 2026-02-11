import chroma from 'chroma-js';
import type { Palette } from '$lib/theme/palettes';
import type { GradientDirection } from '$lib/stores/state.svelte';

export interface ColoredChar {
  char: string;
  color: string;
}

export type ColoredLine = ColoredChar[];

export interface ColorizeOptions {
  direction: GradientDirection;
  normalizeBrightness?: boolean;
  paletteStart?: number;   // 0-100
  paletteEnd?: number;     // 0-100
}

/**
 * Apply color gradient to ASCII art lines.
 * Returns a 2D array of { char, color } objects.
 */
export function colorize(
  lines: string[],
  palette: Palette,
  options: ColorizeOptions
): ColoredLine[] {
  const { direction, normalizeBrightness = false, paletteStart = 0, paletteEnd = 100 } = options;
  const scale = chroma.scale(palette.colors).mode('oklch');
  const height = lines.length;
  const width = Math.max(...lines.map((l) => l.length));

  const start = paletteStart / 100;
  const end = paletteEnd / 100;
  const range = end - start;

  // Pre-compute target lightness for normalization (max lightness in visible range)
  let targetL = 0;
  if (normalizeBrightness && range > 0) {
    for (let i = 0; i <= 10; i++) {
      const sample = start + (i / 10) * range;
      const [l] = scale(sample).oklch();
      if (l > targetL) targetL = l;
    }
  }

  return lines.map((line, row) =>
    Array.from(line).map((char, col) => {
      if (char === ' ') {
        return { char, color: 'transparent' };
      }
      const rawT = getGradientT(row, col, height, width, direction);
      const t = range > 0 ? start + rawT * range : start;
      let color = scale(t);

      if (normalizeBrightness && targetL > 0) {
        const [, c, h] = color.oklch();
        color = chroma.oklch(targetL, c, h || 0);
      }

      return { char, color: color.hex() };
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
    case 'none':
      return 0;
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
