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
  const charWidth = 9.6;
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
