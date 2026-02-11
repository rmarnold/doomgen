import { toPng } from 'html-to-image';
import chroma from 'chroma-js';
import { base } from '$app/paths';
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
 * Freeze CSS animations on the target and its descendants by computing
 * current animated values and setting them as inline styles with animation: none.
 * Returns a restore function to undo the freeze.
 */
function freezeAnimations(target: HTMLElement): () => void {
  const frozen: { el: HTMLElement; origStyle: string }[] = [];
  const els = [target, ...Array.from(target.querySelectorAll('*'))] as HTMLElement[];

  for (const el of els) {
    const computed = getComputedStyle(el);
    if (computed.animationName && computed.animationName !== 'none') {
      const origStyle = el.getAttribute('style') || '';
      frozen.push({ el, origStyle });

      // Capture current computed values for animated properties
      const filter = computed.filter;
      const opacity = computed.opacity;
      el.style.animation = 'none';
      if (filter && filter !== 'none') el.style.filter = filter;
      if (opacity !== '1') el.style.opacity = opacity;
    }
  }

  return () => {
    for (const { el, origStyle } of frozen) {
      el.setAttribute('style', origStyle);
    }
  };
}

/**
 * Capture preview DOM element as PNG and copy to clipboard.
 */
export async function copyImage(element: HTMLElement, options?: PngExportOptions): Promise<void> {
  const transparent = options?.transparentBg ?? false;
  const bg = options?.bgColor ?? '#0a0a0a';
  const target = resolveTarget(element);
  const restore = freezeAnimations(target);
  try {
    const dataUrl = await toPng(target, {
      pixelRatio: window.devicePixelRatio * 2,
      backgroundColor: transparent ? undefined : bg,
    });
    const cropped = await cropToContent(dataUrl, transparent ? undefined : bg);
    const blob = await (await fetch(cropped)).blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
  } finally {
    restore();
  }
}

/**
 * Download preview DOM element as PNG file.
 */
export async function downloadPng(element: HTMLElement, filename: string, options?: PngExportOptions): Promise<void> {
  const transparent = options?.transparentBg ?? false;
  const bg = options?.bgColor ?? '#0a0a0a';
  const target = resolveTarget(element);
  const restore = freezeAnimations(target);
  try {
    const dataUrl = await toPng(target, {
      pixelRatio: window.devicePixelRatio * 2,
      backgroundColor: transparent ? undefined : bg,
    });
    const cropped = await cropToContent(dataUrl, transparent ? undefined : bg);
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = cropped;
    link.click();
  } finally {
    restore();
  }
}

/**
 * Download preview DOM element as optimized WebP file.
 */
export async function downloadWebp(element: HTMLElement, filename: string, options?: PngExportOptions): Promise<void> {
  const transparent = options?.transparentBg ?? false;
  const bg = options?.bgColor ?? '#0a0a0a';
  const target = resolveTarget(element);
  const restore = freezeAnimations(target);
  try {
    const dataUrl = await toPng(target, {
      pixelRatio: window.devicePixelRatio * 2,
      backgroundColor: transparent ? undefined : bg,
    });
    const cropped = await cropToContent(dataUrl, transparent ? undefined : bg);

    // Convert PNG data URL to WebP via canvas
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = cropped;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    if (!transparent) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('WebP conversion failed'))),
        'image/webp',
        0.9,
      );
    });

    const link = document.createElement('a');
    link.download = `${filename}.webp`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } finally {
    restore();
  }
}

/**
 * Options for animated WebP export.
 */
export interface AnimatedExportOptions {
  bgColor: string;
  colorShiftSpeed: number;
  crtEnabled: boolean;
  crtFlicker: number;
  transparentBg?: boolean;
}

/**
 * Lazy WebPXMux singleton - loads WASM library on first use.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let xMuxInstance: any = null;
let xMuxLoading: Promise<any> | null = null;

async function getWebPXMux() {
  if (xMuxInstance) return xMuxInstance;
  if (xMuxLoading) return xMuxLoading;
  xMuxLoading = (async () => {
    // Use the browser-targeted UMD dist build (not CJS lib which pulls in Node.js 'ws' module)
    const mod = await import('webpxmux/dist/webpxmux');
    const create = typeof mod.default === 'function' ? mod.default : mod.default?.default;
    if (typeof create !== 'function') throw new Error('webpxmux: failed to resolve factory function');
    const inst = create(`${base}/webpxmux.wasm`);
    await inst.waitRuntime();
    xMuxInstance = inst;
    return inst;
  })();
  return xMuxLoading;
}

/**
 * Convert canvas RGBA byte array to Uint32Array in 0xRRGGBBAA format.
 */
function rgbaToUint32(data: Uint8ClampedArray, pixelCount: number): Uint32Array {
  const result = new Uint32Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    result[i] = (data[o] << 24) | (data[o + 1] << 16) | (data[o + 2] << 8) | data[o + 3];
  }
  return result;
}

/**
 * Convert PNG data URL to RGBA Uint32Array for webpxmux encoder.
 */
function dataUrlToRgba(dataUrl: string, bg?: string): Promise<{ rgba: Uint32Array; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      if (bg) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve({
        rgba: rgbaToUint32(imageData.data, canvas.width * canvas.height),
        width: canvas.width,
        height: canvas.height,
      });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Triangular wave function for CRT flicker opacity calculation.
 */
function flickerOpacity(t: number, duration: number, minOpacity: number): number {
  const p = (t % duration) / duration;
  return p < 0.5
    ? 1 - (1 - minOpacity) * p * 2
    : minOpacity + (1 - minOpacity) * (p - 0.5) * 2;
}

/**
 * Download preview DOM element as animated WebP file with color shift and CRT flicker effects.
 */
export async function downloadAnimatedWebp(
  element: HTMLElement,
  filename: string,
  options: AnimatedExportOptions,
  onProgress?: (frame: number, total: number) => void,
): Promise<void> {
  const { bgColor, colorShiftSpeed, crtEnabled, crtFlicker, transparentBg } = options;
  const bg = bgColor || '#0a0a0a';
  const target = resolveTarget(element);

  // Calculate animation durations (same formulas as CSS/SVG/HTML exports)
  const colorShiftDuration = colorShiftSpeed > 0 ? Math.max(0.5, 10 - colorShiftSpeed * 0.095) : 0;
  const flickerDuration = crtEnabled && crtFlicker > 0 ? Math.max(0.05, 0.2 - crtFlicker * 0.0015) : 0;
  const flickerMin = crtEnabled && crtFlicker > 0 ? 1 - crtFlicker * 0.003 : 1;

  // If no animations active, fall back to static WebP
  if (colorShiftDuration === 0 && flickerDuration === 0) {
    return downloadWebp(element, filename, { transparentBg, bgColor: bg });
  }

  const maxFrames = 30;
  const totalDuration = colorShiftDuration > 0 ? colorShiftDuration : flickerDuration;
  const fps = Math.min(10, maxFrames / totalDuration);
  const frameCount = Math.min(maxFrames, Math.ceil(totalDuration * fps));
  const frameDurationMs = Math.round((totalDuration * 1000) / frameCount);

  // Find animation elements in the DOM
  // Structure: [data-export-target].crt-flicker > .color-shift > pre
  const colorShiftEl = target.querySelector('.color-shift') as HTMLElement | null;
  const flickerEl = target.classList.contains('crt-flicker')
    ? target
    : (target.querySelector('.crt-flicker') as HTMLElement | null);

  // Save original inline styles for restoration
  const origColorShiftStyle = colorShiftEl?.getAttribute('style') || '';
  const origFlickerStyle = flickerEl?.getAttribute('style') || '';

  // Initialize WebPXMux WASM encoder
  const xMux = await getWebPXMux();

  interface FrameData {
    duration: number;
    isKeyframe: boolean;
    rgba: Uint32Array;
  }
  const frames: FrameData[] = [];
  let frameWidth = 0;
  let frameHeight = 0;

  try {
    for (let i = 0; i < frameCount; i++) {
      const t = (i / frameCount) * totalDuration;

      // Step color shift animation
      if (colorShiftEl && colorShiftDuration > 0) {
        const deg = (t / colorShiftDuration) * 360;
        colorShiftEl.style.animation = 'none';
        colorShiftEl.style.filter = `hue-rotate(${deg}deg)`;
      }

      // Step CRT flicker animation
      if (flickerEl && flickerDuration > 0) {
        const opacity = flickerOpacity(t, flickerDuration, flickerMin);
        flickerEl.style.animation = 'none';
        flickerEl.style.opacity = String(opacity);
      }

      // Let browser repaint
      await new Promise<void>(r => requestAnimationFrame(() => r()));

      // Capture frame
      const dataUrl = await toPng(target, {
        pixelRatio: 1,
        backgroundColor: transparentBg ? undefined : bg,
      });

      const { rgba, width, height } = await dataUrlToRgba(dataUrl, transparentBg ? undefined : bg);

      if (i === 0) {
        frameWidth = width;
        frameHeight = height;
      }

      frames.push({
        duration: frameDurationMs,
        isKeyframe: i === 0,
        rgba,
      });

      onProgress?.(i + 1, frameCount);
    }
  } finally {
    // Restore original styles
    if (colorShiftEl) colorShiftEl.setAttribute('style', origColorShiftStyle);
    if (flickerEl) flickerEl.setAttribute('style', origFlickerStyle);
  }

  // Encode animated WebP
  const webpData = await xMux.encodeFrames({
    frameCount: frames.length,
    width: frameWidth,
    height: frameHeight,
    loopCount: 0, // infinite loop
    bgColor: 0x00000000,
    frames,
  });

  // Download
  const blob = new Blob([new Uint8Array(webpData)], { type: 'image/webp' });
  const link = document.createElement('a');
  link.download = `${filename}.webp`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
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
  crtFlicker: number;
  pixelation: number;
  colorShiftSpeed: number;
}

/**
 * Generate and download SVG file with visual effects.
 */
export function downloadSvg(coloredLines: ColoredLine[], filename: string, options: SvgExportOptions): void {
  const { bgColor, glowIntensity, glowColor, shadowOffset, crtEnabled, crtCurvature, crtFlicker, pixelation, colorShiftSpeed } = options;
  const lineHeight = 16;
  const charWidth = 9.6;
  const maxLineLen = coloredLines.reduce((max, l) => Math.max(max, l.length), 0);
  const width = maxLineLen * charWidth + 40;
  const height = coloredLines.length * lineHeight + 40;

  // Convert glowColor to hex for SVG compatibility
  const glowHex = glowIntensity > 0 ? chroma(glowColor).hex() : '';

  // Build defs
  const defs: string[] = [];

  if (glowIntensity > 0 || shadowOffset > 0) {
    const filterParts: string[] = [];

    if (shadowOffset > 0) {
      filterParts.push(
        `      <feOffset in="SourceGraphic" dx="${shadowOffset}" dy="${shadowOffset}" result="off"/>`,
        `      <feFlood flood-color="#000000" flood-opacity="0.8" result="sc"/>`,
        `      <feComposite in="sc" in2="off" operator="in" result="shadow"/>`,
      );
    }

    if (glowIntensity > 0) {
      const r = glowIntensity * 0.5;
      filterParts.push(
        `      <feGaussianBlur in="SourceGraphic" stdDeviation="${r}" result="blur"/>`,
        `      <feFlood flood-color="${glowHex}" flood-opacity="0.8" result="gc"/>`,
        `      <feComposite in="gc" in2="blur" operator="in" result="glow"/>`,
      );
    }

    const mergeNodes: string[] = [];
    if (shadowOffset > 0) mergeNodes.push('        <feMergeNode in="shadow"/>');
    if (glowIntensity > 0) mergeNodes.push('        <feMergeNode in="glow"/>');
    mergeNodes.push('        <feMergeNode in="SourceGraphic"/>');
    filterParts.push(`      <feMerge>\n${mergeNodes.join('\n')}\n      </feMerge>`);

    defs.push(`    <filter id="fx" x="-50%" y="-50%" width="200%" height="200%">\n${filterParts.join('\n')}\n    </filter>`);
  }

  // CRT scanline pattern (use fill-opacity instead of rgba)
  if (crtEnabled) {
    defs.push(`    <pattern id="scan" patternUnits="userSpaceOnUse" width="1" height="2">\n      <rect width="1" height="1" fill="#000" fill-opacity="0.3"/>\n    </pattern>`);
    // Vignette radial gradient
    defs.push(`    <radialGradient id="vig" cx="50%" cy="50%" r="70%">\n      <stop offset="0%" stop-color="#000" stop-opacity="0"/>\n      <stop offset="100%" stop-color="#000" stop-opacity="0.5"/>\n    </radialGradient>`);
  }

  // Pixelation filter
  if (pixelation > 0) {
    defs.push(`    <filter id="px"><feGaussianBlur stdDeviation="${pixelation}" in="SourceGraphic" result="b"/><feComponentTransfer in="b"><feFuncR type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/><feFuncG type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/><feFuncB type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/></feComponentTransfer></filter>`);
  }

  // CRT curvature clip path
  const borderRadius = crtEnabled && crtCurvature > 0 ? crtCurvature * 0.12 : 0;
  if (borderRadius > 0) {
    defs.push(`    <clipPath id="clip"><rect width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}"/></clipPath>`);
  }

  const defsBlock = defs.length > 0 ? `  <defs>\n${defs.join('\n')}\n  </defs>\n` : '';
  const clipAttr = borderRadius > 0 ? ' clip-path="url(#clip)"' : '';
  const filterAttr = (glowIntensity > 0 || shadowOffset > 0) ? ' filter="url(#fx)"' : '';
  const pxFilterAttr = pixelation > 0 ? ' filter="url(#px)"' : '';

  // Build CSS animations
  const cssRules: string[] = [];
  if (colorShiftSpeed > 0) {
    const duration = Math.max(0.5, 10 - colorShiftSpeed * 0.095);
    cssRules.push(`    @keyframes color-shift-cycle { from { filter: hue-rotate(0deg); } to { filter: hue-rotate(360deg); } }`);
    cssRules.push(`    .color-shift { animation: color-shift-cycle ${duration}s linear infinite; }`);
  }
  if (crtEnabled && crtFlicker > 0) {
    const flickerSpeed = Math.max(0.05, 0.2 - crtFlicker * 0.0015);
    const flickerOpacity = 1 - crtFlicker * 0.003;
    cssRules.push(`    @keyframes crt-flicker-anim { 0%, 100% { opacity: 1; } 50% { opacity: ${flickerOpacity.toFixed(3)}; } }`);
    cssRules.push(`    .crt-flicker { animation: crt-flicker-anim ${flickerSpeed}s infinite; }`);
  }
  if (cssRules.length > 0) {
    cssRules.push(`    @media (prefers-reduced-motion: reduce) { .color-shift, .crt-flicker { animation: none !important; } }`);
  }
  const styleBlock = cssRules.length > 0 ? `  <style>\n${cssRules.join('\n')}\n  </style>\n` : '';

  const flickerClass = (crtEnabled && crtFlicker > 0) ? ' class="crt-flicker"' : '';
  const contentClassAttr = colorShiftSpeed > 0 ? ' class="color-shift"' : '';

  // Build text elements
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
      if (!spans) return '';
      const y = row * lineHeight + 20 + lineHeight;
      return `    <text y="${y}" font-family="'JetBrains Mono', monospace" font-size="14">${spans}</text>`;
    })
    .filter(Boolean)
    .join('\n');

  // CRT overlays (after text, before closing group)
  const overlays: string[] = [];
  if (crtEnabled) {
    overlays.push(`    <rect width="${width}" height="${height}" fill="url(#scan)"/>`);
    overlays.push(`    <rect width="${width}" height="${height}" fill="url(#vig)"/>`);
  }

  // Build text content block — flicker > pixelation > glow/shadow > text
  // Flicker wraps only the text content, NOT the background
  let textBlock: string;
  const innerGroup = `<g${filterAttr}${contentClassAttr}>\n${textElements}\n      </g>`;
  if (pixelation > 0) {
    textBlock = `    <g${flickerClass}>\n      <g${pxFilterAttr}>\n        ${innerGroup}\n      </g>\n    </g>`;
  } else {
    textBlock = `    <g${flickerClass}>\n      ${innerGroup}\n    </g>`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${defsBlock}${styleBlock}  <g${clipAttr}>
    <rect width="100%" height="100%" fill="${bgColor}"/>
${textBlock}
${overlays.length > 0 ? overlays.join('\n') + '\n' : ''}  </g>
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
 * Generate and download self-contained HTML file with embedded CSS + JS for all effects.
 */
export function downloadHtml(coloredLines: ColoredLine[], filename: string, options: HtmlExportOptions): void {
  const { bgColor, glowIntensity, glowColor, shadowOffset, crtEnabled, crtCurvature, crtFlicker, pixelation, colorShiftSpeed } = options;

  // Escape HTML title
  const safeTitle = filename.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Build inline text-shadow for glow
  const glowStyle = glowIntensity > 0
    ? `text-shadow:0 0 ${glowIntensity * 0.15}px ${glowColor},0 0 ${glowIntensity * 0.5}px ${glowColor};`
    : '';

  // Build filter list for pre
  const preFilters: string[] = [];
  if (pixelation > 0) preFilters.push('url(#px)');
  if (shadowOffset > 0) preFilters.push(`drop-shadow(${shadowOffset}px ${shadowOffset}px 0px rgba(0,0,0,0.8))`);
  const filterStyle = preFilters.length > 0 ? `filter:${preFilters.join(' ')};` : '';

  // CRT curvature
  const curvR = crtEnabled && crtCurvature > 0 ? crtCurvature * 0.12 : 0;

  // Build CSS
  let css = `*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:${bgColor};overflow:hidden}
.c{position:relative;padding:2rem${curvR > 0 ? `;border-radius:${curvR}px;overflow:hidden` : ''}}
pre{font-family:'JetBrains Mono',monospace;font-size:14px;line-height:1;white-space:pre;${glowStyle}${filterStyle}}`;

  // CRT effects
  if (crtEnabled) {
    css += `\n.c::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.3),rgba(0,0,0,.3) 1px,transparent 1px,transparent 2px);pointer-events:none;z-index:10}`;
    css += `\n.c::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,0,0,.03),rgba(0,255,0,.03) 1px,rgba(0,0,255,.03) 2px,transparent 3px);pointer-events:none;z-index:11}`;
    css += `\n.c{box-shadow:inset 0 0 80px 20px rgba(0,0,0,.5),inset 0 2px 4px rgba(0,0,0,.5)}`;
  }

  // Build character spans
  const spans = coloredLines
    .map((line) =>
      line
        .map((cell) => {
          const ch = cell.char
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          if (cell.color === 'transparent' || cell.char === ' ') return ch;
          return `<span style="color:${cell.color}">${ch}</span>`;
        })
        .join('')
    )
    .join('\n');

  // Pixelation SVG filter
  const pxSvg = pixelation > 0
    ? `<svg width="0" height="0" style="position:absolute"><filter id="px"><feGaussianBlur stdDeviation="${pixelation}" in="SourceGraphic" result="b"/><feComponentTransfer in="b"><feFuncR type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/><feFuncG type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/><feFuncB type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/></feComponentTransfer></filter></svg>\n`
    : '';

  // Color shift wrapper
  const csOpen = colorShiftSpeed > 0 ? '<div id="cs">' : '';
  const csClose = colorShiftSpeed > 0 ? '</div>' : '';

  // Embedded JS for animations (color shift + CRT flicker)
  const jsConfig: Record<string, number> = {};
  if (colorShiftSpeed > 0) jsConfig.colorShiftDuration = Math.max(0.5, 10 - colorShiftSpeed * 0.095);
  if (crtEnabled && crtFlicker > 0) {
    jsConfig.flickerSpeed = Math.max(0.05, 0.2 - crtFlicker * 0.0015);
    jsConfig.flickerMin = 1 - crtFlicker * 0.003;
  }

  let jsBlock = '';
  if (Object.keys(jsConfig).length > 0) {
    // Minified animation engine
    jsBlock = `<script>
(function(){var C=${JSON.stringify(jsConfig)};
${colorShiftSpeed > 0 ? `var cs=document.getElementById("cs"),deg=0,dur=C.colorShiftDuration*1000;
function hue(t){deg=(deg+t/dur*360)%360;cs.style.filter="hue-rotate("+deg+"deg)"}
var lt=performance.now();function af(t){hue(t-lt);lt=t;requestAnimationFrame(af)}requestAnimationFrame(af);` : ''}
${crtEnabled && crtFlicker > 0 ? `var c=document.querySelector(".c"),fs=C.flickerSpeed*1000,fm=C.flickerMin,fl=0;
function fk(t){fl+=t-(fk.l||t);fk.l=t;var p=(fl%fs)/fs,o=p<.5?1-(1-fm)*p*2:fm+(1-fm)*(p-.5)*2;
c.style.opacity=o;requestAnimationFrame(fk)}requestAnimationFrame(fk);` : ''}
})();
</script>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeTitle} - DOOMGEN</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
${pxSvg}<div class="c">
${csOpen}<pre>${spans}</pre>${csClose}
</div>
${jsBlock}
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
