import { toPng } from 'html-to-image';
import chroma from 'chroma-js';
import type { ColoredLine } from './colorizer';
import { appState } from '$lib/stores/state.svelte';

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
 * Resolve the best capture target: prefer the export-target wrapper (includes CRT/effects),
 * fall back to <pre> for tight crop, then the container itself.
 */
function resolveTarget(element: HTMLElement): HTMLElement {
  return element.querySelector('[data-export-target]') ?? element.querySelector('pre') ?? element;
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
 * SVG export options for including visual effects.
 */
export interface SvgExportOptions {
  bgColor: string;
  glowIntensity: number;
  glowColor: string;
  shadowOffset: number;
  crtEnabled: boolean;
  crtCurvature: number;
}

/**
 * Generate and download SVG file with visual effects.
 */
export function downloadSvg(coloredLines: ColoredLine[], filename: string, options: SvgExportOptions): void {
  const { bgColor, glowIntensity, glowColor, shadowOffset, crtEnabled, crtCurvature } = options;
  const lineHeight = 16;
  const charWidth = 9.6;
  const width = Math.max(...coloredLines.map((l) => l.length)) * charWidth + 40;
  const height = coloredLines.length * lineHeight + 40;

  // Build SVG filter definitions
  const filterParts: string[] = [];
  let textFilterId = '';

  if (glowIntensity > 0 || shadowOffset > 0) {
    textFilterId = 'textEffects';
    const parts: string[] = [];

    if (glowIntensity > 0) {
      const glowRadius = glowIntensity * 0.5;
      parts.push(`    <feGaussianBlur in="SourceGraphic" stdDeviation="${glowRadius}" result="glow"/>`);
      parts.push(`    <feFlood flood-color="${glowColor}" flood-opacity="0.8" result="glowColor"/>`);
      parts.push(`    <feComposite in="glowColor" in2="glow" operator="in" result="coloredGlow"/>`);
    }

    if (shadowOffset > 0) {
      parts.push(`    <feOffset in="SourceGraphic" dx="${shadowOffset}" dy="${shadowOffset}" result="shadowOffset"/>`);
      parts.push(`    <feFlood flood-color="rgba(0,0,0,0.8)" result="shadowColor"/>`);
      parts.push(`    <feComposite in="shadowColor" in2="shadowOffset" operator="in" result="shadow"/>`);
    }

    // Merge layers: shadow (back), glow, original text (front)
    const mergeNodes: string[] = [];
    if (shadowOffset > 0) mergeNodes.push('      <feMergeNode in="shadow"/>');
    if (glowIntensity > 0) mergeNodes.push('      <feMergeNode in="coloredGlow"/>');
    mergeNodes.push('      <feMergeNode in="SourceGraphic"/>');
    parts.push(`    <feMerge>\n${mergeNodes.join('\n')}\n    </feMerge>`);

    filterParts.push(`  <filter id="${textFilterId}" x="-50%" y="-50%" width="200%" height="200%">\n${parts.join('\n')}\n  </filter>`);
  }

  // CRT scanlines pattern
  if (crtEnabled) {
    filterParts.push(`  <pattern id="crtScanlines" patternUnits="userSpaceOnUse" width="1" height="2">
    <rect width="1" height="1" fill="rgba(0,0,0,0.3)"/>
  </pattern>`);
  }

  const defsSection = filterParts.length > 0
    ? `<defs>\n${filterParts.join('\n')}\n</defs>`
    : '';

  // Clip path for CRT curvature
  const borderRadius = crtEnabled && crtCurvature > 0 ? crtCurvature * 0.12 : 0;
  const clipPathDef = borderRadius > 0
    ? `\n  <clipPath id="crtClip"><rect width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}"/></clipPath>`
    : '';
  const clipAttr = borderRadius > 0 ? ' clip-path="url(#crtClip)"' : '';

  if (clipPathDef && defsSection) {
    // Insert clip path into existing defs
  }

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

  const textFilterAttr = textFilterId ? ` filter="url(#${textFilterId})"` : '';

  // CRT overlays
  const crtOverlays: string[] = [];
  if (crtEnabled) {
    // Scanlines
    crtOverlays.push(`  <rect width="${width}" height="${height}" fill="url(#crtScanlines)" opacity="1"/>`);
    // Vignette (radial gradient darkening at edges)
    crtOverlays.push(`  <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
    <stop offset="0%" stop-color="transparent"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0.5)"/>
  </radialGradient>
  <rect width="${width}" height="${height}" fill="url(#vignette)"/>`);
  }

  // Build full defs including clip path
  const allDefs: string[] = [];
  if (filterParts.length > 0 || clipPathDef) {
    allDefs.push('<defs>');
    allDefs.push(...filterParts);
    if (clipPathDef) allDefs.push(`  <clipPath id="crtClip"><rect width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}"/></clipPath>`);
    allDefs.push('</defs>');
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${allDefs.join('\n  ')}
  <g${clipAttr}>
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <g${textFilterAttr}>
      ${textElements}
    </g>
    ${crtOverlays.join('\n  ')}
  </g>
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

/**
 * HTML export options.
 */
export interface HtmlExportOptions {
  bgColor: string;
  glowIntensity: number;
  glowColor: string;
  shadowOffset: number;
  crtEnabled: boolean;
  crtCurvature: number;
  crtFlicker: number;
  pixelation: number;
  colorShiftSpeed: number;
}

/**
 * Generate and download standalone HTML file with embedded CSS and all visual effects.
 */
export function downloadHtml(coloredLines: ColoredLine[], filename: string, options: HtmlExportOptions): void {
  const { bgColor, glowIntensity, glowColor, shadowOffset, crtEnabled, crtCurvature, crtFlicker, pixelation, colorShiftSpeed } = options;

  const glowCss = glowIntensity > 0
    ? `text-shadow: 0 0 ${glowIntensity * 0.15}px ${glowColor}, 0 0 ${glowIntensity * 0.5}px ${glowColor};`
    : '';

  // Build filter list for pre (pixelation + shadow)
  const preFilters: string[] = [];
  if (pixelation > 0) preFilters.push('url(#doomgen-pixelate)');
  if (shadowOffset > 0) preFilters.push(`drop-shadow(${shadowOffset}px ${shadowOffset}px 0px rgba(0,0,0,0.8))`);
  const filterCss = preFilters.length > 0 ? `filter: ${preFilters.join(' ')};` : '';

  // CRT effect CSS
  let crtCss = '';
  if (crtEnabled) {
    const curvatureRadius = crtCurvature * 0.12;
    const flickerSpeed = Math.max(0.05, 0.2 - crtFlicker * 0.0015);
    const flickerOpacity = 1 - crtFlicker * 0.003;

    crtCss = `
    .container {
      ${curvatureRadius > 0 ? `border-radius: ${curvatureRadius}px; overflow: hidden;` : ''}
      box-shadow: inset 0 0 80px 20px rgba(0,0,0,0.5), 0 0 10px rgba(255,50,30,0.2), inset 0 2px 4px rgba(0,0,0,0.5);
    }
    .container::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3) 1px, transparent 1px, transparent 2px);
      pointer-events: none;
      z-index: 10;
    }
    .container::after {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.03) 1px, rgba(0,0,255,0.03) 2px, transparent 3px);
      pointer-events: none;
      z-index: 11;
    }${crtFlicker > 0 ? `
    .container {
      animation: crt-flicker ${flickerSpeed}s infinite;
    }
    @keyframes crt-flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: ${flickerOpacity}; }
    }` : ''}`;
  }

  // Color shift CSS
  let colorShiftCss = '';
  if (colorShiftSpeed > 0) {
    const duration = Math.max(0.5, 10 - colorShiftSpeed * 0.095);
    colorShiftCss = `
    .color-shift {
      animation: color-shift-cycle ${duration}s linear infinite;
    }
    @keyframes color-shift-cycle {
      from { filter: hue-rotate(0deg); }
      to { filter: hue-rotate(360deg); }
    }`;
  }

  // Pixelation SVG filter
  const pixelationSvg = pixelation > 0
    ? `<svg width="0" height="0" style="position:absolute"><filter id="doomgen-pixelate"><feGaussianBlur stdDeviation="${pixelation}" in="SourceGraphic" result="blurred"/><feComponentTransfer in="blurred"><feFuncR type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1"/><feFuncG type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1"/><feFuncB type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1"/></feComponentTransfer></filter></svg>`
    : '';

  const spans = coloredLines
    .map((line) => {
      const lineHtml = line
        .map((cell) => {
          const escaped = cell.char
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          if (cell.color === 'transparent' || cell.char === ' ') return escaped;
          return `<span style="color:${cell.color}">${escaped}</span>`;
        })
        .join('');
      return lineHtml;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${filename} - DOOMGEN</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');
  body {
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: ${bgColor};
  }
  .container {
    position: relative;
    padding: 2rem;
  }${crtCss}${colorShiftCss}
  pre {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    line-height: 1;
    white-space: pre;
    margin: 0;
    ${glowCss}
    ${filterCss}
  }
</style>
</head>
<body>
${pixelationSvg}
<div class="container">
${colorShiftSpeed > 0 ? '<div class="color-shift">' : ''}
<pre>${spans}</pre>
${colorShiftSpeed > 0 ? '</div>' : ''}
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.download = `${filename}.html`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * DoomgenSave format for JSON export/import.
 */
interface DoomgenSave {
  version: 1;
  state: Record<string, unknown>;
  coloredLines: ColoredLine[];
}

/**
 * Generate and download JSON save file with full state + colored lines.
 */
export function downloadJson(coloredLines: ColoredLine[], filename: string): void {
  const state: Record<string, unknown> = {
    text: appState.text,
    fontId: appState.fontId,
    layout: appState.layout,
    paletteId: appState.paletteId,
    gradientDirection: appState.gradientDirection,
    normalizeBrightness: appState.normalizeBrightness,
    paletteStart: appState.paletteStart,
    paletteEnd: appState.paletteEnd,
    glowIntensity: appState.glowIntensity,
    dripDensity: appState.dripDensity,
    shadowOffset: appState.shadowOffset,
    distressIntensity: appState.distressIntensity,
    pixelation: appState.pixelation,
    crtEnabled: appState.crtEnabled,
    crtCurvature: appState.crtCurvature,
    crtFlicker: appState.crtFlicker,
    screenShake: false,
    colorShiftSpeed: appState.colorShiftSpeed,
    removeBlack: appState.removeBlack,
    zoom: appState.zoom,
    bgColor: appState.bgColor,
    animationsEnabled: appState.animationsEnabled,
  };

  const save: DoomgenSave = { version: 1, state, coloredLines };
  const json = JSON.stringify(save, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = `${filename}.doomgen.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Import a DoomgenSave JSON file and restore state.
 */
export async function importJson(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const save: DoomgenSave = JSON.parse(text);
    if (save.version !== 1) return false;

    const s = save.state;
    if (s.text !== undefined) appState.text = s.text as string;
    if (s.fontId !== undefined) appState.fontId = s.fontId as string;
    if (s.layout !== undefined) appState.layout = s.layout as 'default' | 'full' | 'fitted';
    if (s.paletteId !== undefined) appState.paletteId = s.paletteId as string;
    if (s.gradientDirection !== undefined) appState.gradientDirection = s.gradientDirection as typeof appState.gradientDirection;
    if (s.normalizeBrightness !== undefined) appState.normalizeBrightness = s.normalizeBrightness as boolean;
    if (s.paletteStart !== undefined) appState.paletteStart = s.paletteStart as number;
    if (s.paletteEnd !== undefined) appState.paletteEnd = s.paletteEnd as number;
    if (s.glowIntensity !== undefined) appState.glowIntensity = s.glowIntensity as number;
    if (s.dripDensity !== undefined) appState.dripDensity = s.dripDensity as number;
    if (s.shadowOffset !== undefined) appState.shadowOffset = s.shadowOffset as number;
    if (s.distressIntensity !== undefined) appState.distressIntensity = s.distressIntensity as number;
    if (s.pixelation !== undefined) appState.pixelation = s.pixelation as number;
    if (s.crtEnabled !== undefined) appState.crtEnabled = s.crtEnabled as boolean;
    if (s.crtCurvature !== undefined) appState.crtCurvature = s.crtCurvature as number;
    if (s.crtFlicker !== undefined) appState.crtFlicker = s.crtFlicker as number;
    if (s.colorShiftSpeed !== undefined) appState.colorShiftSpeed = s.colorShiftSpeed as number;
    if (s.removeBlack !== undefined) appState.removeBlack = s.removeBlack as boolean;
    if (s.zoom !== undefined) appState.zoom = s.zoom as number;
    if (s.bgColor !== undefined) appState.bgColor = s.bgColor as string;
    if (s.animationsEnabled !== undefined) appState.animationsEnabled = s.animationsEnabled as boolean;

    return true;
  } catch {
    return false;
  }
}
