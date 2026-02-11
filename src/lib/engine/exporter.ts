import { toPng } from 'html-to-image';
import chroma from 'chroma-js';
import type { ColoredLine } from './colorizer';

export interface PngExportOptions {
  transparentBg?: boolean;
  bgColor?: string;
}

/**
 * Auto-crop a PNG data URL to its content bounding box.
 * In opaque mode, crops pixels matching bgColor; in transparent mode, crops fully transparent pixels.
 */
function cropToContent(dataUrl: string, bgColor?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;

      // Parse bgColor into RGB if provided
      let bgR = 0, bgG = 0, bgB = 0;
      if (bgColor) {
        const [r, g, b] = chroma(bgColor).rgb();
        bgR = r; bgG = g; bgB = b;
      }

      let top = height, left = width, bottom = 0, right = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

          let isContent: boolean;
          if (bgColor) {
            // Opaque mode: content is any pixel that differs from bgColor
            isContent = !(Math.abs(r - bgR) <= 2 && Math.abs(g - bgG) <= 2 && Math.abs(b - bgB) <= 2);
          } else {
            // Transparent mode: content is any pixel with alpha > 0
            isContent = a > 0;
          }

          if (isContent) {
            if (y < top) top = y;
            if (y > bottom) bottom = y;
            if (x < left) left = x;
            if (x > right) right = x;
          }
        }
      }

      // No content found — return original
      if (top > bottom || left > right) {
        resolve(dataUrl);
        return;
      }

      // Add comfortable padding around the content
      const pad = 24;
      top = Math.max(0, top - pad);
      left = Math.max(0, left - pad);
      bottom = Math.min(height - 1, bottom + pad);
      right = Math.min(width - 1, right + pad);

      const cropW = right - left + 1;
      const cropH = bottom - top + 1;

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      const cropCtx = cropCanvas.getContext('2d')!;
      cropCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);

      resolve(cropCanvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image for cropping'));
    img.src = dataUrl;
  });
}

/**
 * Copy plain ASCII text to clipboard (no color).
 */
export async function copyText(lines: string[]): Promise<void> {
  const text = lines.join('\n');
  await navigator.clipboard.writeText(text);
}

/**
 * Resolve the best capture target: prefer the inner <pre> for a tight crop,
 * fall back to the container if no <pre> is found.
 */
function resolveTarget(element: HTMLElement): HTMLElement {
  return element.querySelector('pre') ?? element;
}

/**
 * Capture preview DOM element as PNG and copy to clipboard.
 */
export async function copyImage(element: HTMLElement, options?: PngExportOptions): Promise<void> {
  const transparent = options?.transparentBg ?? false;
  const bg = options?.bgColor ?? '#0a0a0a';
  const target = resolveTarget(element);
  const dataUrl = await toPng(target, {
    pixelRatio: window.devicePixelRatio * 2,
    backgroundColor: transparent ? undefined : bg,
  });
  const cropped = await cropToContent(dataUrl, transparent ? undefined : bg);
  const blob = await (await fetch(cropped)).blob();
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob }),
  ]);
}

/**
 * Download preview DOM element as PNG file.
 */
export async function downloadPng(element: HTMLElement, filename: string, options?: PngExportOptions): Promise<void> {
  const transparent = options?.transparentBg ?? false;
  const bg = options?.bgColor ?? '#0a0a0a';
  const target = resolveTarget(element);
  const dataUrl = await toPng(target, {
    pixelRatio: window.devicePixelRatio * 2,
    backgroundColor: transparent ? undefined : bg,
  });
  const cropped = await cropToContent(dataUrl, transparent ? undefined : bg);
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = cropped;
  link.click();
}

/**
 * Generate and download SVG file.
 */
export function downloadSvg(coloredLines: ColoredLine[], filename: string, bgColor = '#0a0a0a'): void {
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
  <rect width="100%" height="100%" fill="${bgColor}"/>
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

/**
 * Generate and download a shell script that prints colored ASCII art as a terminal banner.
 */
export function downloadBanner(coloredLines: ColoredLine[], filename: string): void {
  const printfLines = coloredLines.map((line) => {
    const escaped = line
      .map((cell) => {
        if (cell.char === ' ' || cell.color === 'transparent') return cell.char;
        const [r, g, b] = chroma(cell.color).rgb();
        return `\\e[38;2;${r};${g};${b}m${cell.char}\\e[0m`;
      })
      .join('');
    // Escape single quotes for shell safety: ' → '\''
    const safe = escaped.replace(/'/g, "'\\''");
    return `printf '${safe}\\n'`;
  });

  const script = `#!/usr/bin/env bash
# DOOMGEN Terminal Banner
# Add to your shell config:
#   source ~/.doomgen-banner.sh

${printfLines.join('\n')}
`;

  const blob = new Blob([script], { type: 'text/x-shellscript' });
  const link = document.createElement('a');
  link.download = `${filename}-banner.sh`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
