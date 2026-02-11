#!/usr/bin/env node
/**
 * Generate banner.svg from a doomgen JSON export.
 * Includes CSS animations matching the live preview (color shift, CRT flicker).
 * Usage: node TOOLS/generate-banner.mjs path/to/export.json
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: node TOOLS/generate-banner.mjs <doomgen-export.json>');
  process.exit(1);
}

const data = JSON.parse(readFileSync(resolve(jsonPath), 'utf-8'));
const { state, coloredLines } = data;

const bgColor = state.bgColor || '#0a0a0a';
const glowIntensity = state.glowIntensity ?? 0;
const shadowOffset = state.shadowOffset ?? 0;
const crtEnabled = state.crtEnabled ?? false;
const crtCurvature = state.crtCurvature ?? 0;
const crtFlicker = state.crtFlicker ?? 0;
const colorShiftSpeed = state.colorShiftSpeed ?? 0;
const pixelation = state.pixelation ?? 0;

// Hellfire palette glow color
const glowColor = '#ffff00';

const lineHeight = 16;
const charWidth = 9.6;
const maxLineLen = coloredLines.reduce((max, l) => Math.max(max, l.length), 0);
const width = maxLineLen * charWidth + 40;
const height = coloredLines.length * lineHeight + 40;

// Build defs
const defs = [];

if (glowIntensity > 0 || shadowOffset > 0) {
  const filterParts = [];
  if (shadowOffset > 0) {
    filterParts.push(
      `      <feOffset in="SourceGraphic" dx="${shadowOffset}" dy="${shadowOffset}" result="off"/>`,
      `      <feFlood flood-color="#000000" flood-opacity="0.8" result="sc"/>`,
      `      <feComposite in="sc" in2="off" operator="in" result="shadow"/>`
    );
  }
  if (glowIntensity > 0) {
    const r = glowIntensity * 0.5;
    filterParts.push(
      `      <feGaussianBlur in="SourceGraphic" stdDeviation="${r}" result="blur"/>`,
      `      <feFlood flood-color="${glowColor}" flood-opacity="0.8" result="gc"/>`,
      `      <feComposite in="gc" in2="blur" operator="in" result="glow"/>`
    );
  }
  const mergeNodes = [];
  if (shadowOffset > 0) mergeNodes.push('        <feMergeNode in="shadow"/>');
  if (glowIntensity > 0) mergeNodes.push('        <feMergeNode in="glow"/>');
  mergeNodes.push('        <feMergeNode in="SourceGraphic"/>');
  filterParts.push(`      <feMerge>\n${mergeNodes.join('\n')}\n      </feMerge>`);
  defs.push(`    <filter id="fx" x="-50%" y="-50%" width="200%" height="200%">\n${filterParts.join('\n')}\n    </filter>`);
}

if (crtEnabled) {
  defs.push(`    <pattern id="scan" patternUnits="userSpaceOnUse" width="1" height="2">\n      <rect width="1" height="1" fill="#000" fill-opacity="0.3"/>\n    </pattern>`);
  defs.push(`    <radialGradient id="vig" cx="50%" cy="50%" r="70%">\n      <stop offset="0%" stop-color="#000" stop-opacity="0"/>\n      <stop offset="100%" stop-color="#000" stop-opacity="0.5"/>\n    </radialGradient>`);
}

// Pixelation filter (matches preview's SVG filter)
if (pixelation > 0) {
  defs.push(`    <filter id="px"><feGaussianBlur stdDeviation="${pixelation}" in="SourceGraphic" result="b"/><feComponentTransfer in="b"><feFuncR type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/><feFuncG type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/><feFuncB type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/></feComponentTransfer></filter>`);
}

const borderRadius = crtEnabled && crtCurvature > 0 ? crtCurvature * 0.12 : 0;
if (borderRadius > 0) {
  defs.push(`    <clipPath id="clip"><rect width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}"/></clipPath>`);
}

const defsBlock = defs.length > 0 ? `  <defs>\n${defs.join('\n')}\n  </defs>\n` : '';
const clipAttr = borderRadius > 0 ? ' clip-path="url(#clip)"' : '';

// Build filter attribute — pixelation wraps the text group, glow/shadow on inner group
const hasFx = glowIntensity > 0 || shadowOffset > 0;
const filterAttr = hasFx ? ' filter="url(#fx)"' : '';
const pxFilterAttr = pixelation > 0 ? ' filter="url(#px)"' : '';

// Build CSS animations (matches preview exactly)
const cssRules = [];

// Color shift animation: hue-rotate cycle
if (colorShiftSpeed > 0) {
  const duration = Math.max(0.5, 10 - colorShiftSpeed * 0.095);
  cssRules.push(`    @keyframes color-shift-cycle { from { filter: hue-rotate(0deg); } to { filter: hue-rotate(360deg); } }`);
  cssRules.push(`    .color-shift { animation: color-shift-cycle ${duration}s linear infinite; }`);
}

// CRT flicker animation: opacity pulse
if (crtEnabled && crtFlicker > 0) {
  const flickerSpeed = Math.max(0.05, 0.2 - crtFlicker * 0.0015);
  const flickerOpacity = 1 - crtFlicker * 0.003;
  cssRules.push(`    @keyframes crt-flicker-anim { 0%, 100% { opacity: 1; } 50% { opacity: ${flickerOpacity.toFixed(3)}; } }`);
  cssRules.push(`    .crt-flicker { animation: crt-flicker-anim ${flickerSpeed}s infinite; }`);
}

// Reduced motion support
if (cssRules.length > 0) {
  cssRules.push(`    @media (prefers-reduced-motion: reduce) { .color-shift, .crt-flicker { animation: none !important; } }`);
}

const styleBlock = cssRules.length > 0 ? `  <style>\n${cssRules.join('\n')}\n  </style>\n` : '';

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

const overlays = [];
if (crtEnabled) {
  overlays.push(`    <rect width="${width}" height="${height}" fill="url(#scan)"/>`);
  overlays.push(`    <rect width="${width}" height="${height}" fill="url(#vig)"/>`);
}

// Determine animation wrapper classes
const contentClasses = [];
if (colorShiftSpeed > 0) contentClasses.push('color-shift');
const flickerClass = (crtEnabled && crtFlicker > 0) ? ' class="crt-flicker"' : '';
const contentClassAttr = contentClasses.length > 0 ? ` class="${contentClasses.join(' ')}"` : '';

// Build text content block — flicker > pixelation > glow/shadow > text
// Flicker wraps only the text content, NOT the background
const innerGroup = `<g${filterAttr}${contentClassAttr}>\n${textElements}\n      </g>`;
let textBlock;
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

const outPath = resolve(process.cwd(), 'banner.svg');
writeFileSync(outPath, svg, 'utf-8');
console.log(`Banner written to ${outPath} (${width}x${height})`);
console.log(`Effects: pixelation=${pixelation > 0 ? 'on' : 'off'}, color-shift=${colorShiftSpeed > 0 ? 'on' : 'off'}, crt-flicker=${crtEnabled && crtFlicker > 0 ? 'on' : 'off'}`);
