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
