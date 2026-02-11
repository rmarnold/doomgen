#!/usr/bin/env node
/**
 * Generate banner.svg from a doomgen JSON preset file.
 * Usage: node TOOLS/gen-banner.mjs path/to/preset.doomgen.json
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: node TOOLS/gen-banner.mjs <preset.doomgen.json>');
  process.exit(1);
}

const data = JSON.parse(readFileSync(resolve(jsonPath), 'utf-8'));
const { state, coloredLines } = data;

// SVG config matching exporter.ts downloadSvg()
const lineHeight = 16;
const charWidth = 9.6;
const maxLineLen = coloredLines.reduce((max, l) => Math.max(max, l.length), 0);
const width = maxLineLen * charWidth + 40;
const height = coloredLines.length * lineHeight + 40;

const glowIntensity = state.glowIntensity ?? 0;
const glowColor = '#ffff00'; // bfg-9000 palette glow color
const shadowOffset = state.shadowOffset ?? 0;
const crtEnabled = state.crtEnabled ?? false;
const crtCurvature = state.crtCurvature ?? 0;
const crtFlicker = state.crtFlicker ?? 0;
const pixelation = state.pixelation ?? 0;
const colorShiftSpeed = state.colorShiftSpeed ?? 0;
const screenShake = state.screenShake ?? 0;
const crtPowerLoss = state.crtPowerLoss ?? 0;
const crtScreenBlip = state.crtScreenBlip ?? 0;
const bgColor = state.bgColor ?? '#170808';

// Build defs
const defs = [];

if (glowIntensity > 0 || shadowOffset > 0) {
  const filterParts = [];
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
      `      <feFlood flood-color="${glowColor}" flood-opacity="0.8" result="gc"/>`,
      `      <feComposite in="gc" in2="blur" operator="in" result="glow"/>`,
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

if (pixelation > 0) {
  defs.push(`    <filter id="px"><feGaussianBlur stdDeviation="${pixelation}" in="SourceGraphic" result="b"/><feComponentTransfer in="b"><feFuncR type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/><feFuncG type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/><feFuncB type="discrete" tableValues="0 .1 .2 .3 .4 .5 .6 .7 .8 .9 1"/></feComponentTransfer></filter>`);
}

const borderRadius = crtEnabled && crtCurvature > 0 ? crtCurvature * 0.12 : 0;
if (borderRadius > 0) {
  defs.push(`    <clipPath id="clip"><rect width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}"/></clipPath>`);
}

const defsBlock = defs.length > 0 ? `  <defs>\n${defs.join('\n')}\n  </defs>\n` : '';
const clipAttr = borderRadius > 0 ? ' clip-path="url(#clip)"' : '';
const filterAttr = (glowIntensity > 0 || shadowOffset > 0) ? ' filter="url(#fx)"' : '';
const pxFilterAttr = pixelation > 0 ? ' filter="url(#px)"' : '';

// CSS animations (matching exporter.ts exactly)
const cssRules = [];
const animClasses = [];

if (colorShiftSpeed > 0) {
  const duration = Math.max(0.5, 10 - colorShiftSpeed * 0.095);
  cssRules.push(`    @keyframes color-shift-cycle { from { filter: hue-rotate(0deg); } to { filter: hue-rotate(360deg); } }`);
  cssRules.push(`    .color-shift { animation: color-shift-cycle ${duration}s linear infinite; }`);
  animClasses.push('.color-shift');
}

if (crtEnabled && crtFlicker > 0) {
  const flickerSpeed = Math.max(0.05, 0.2 - crtFlicker * 0.0015);
  const flickerOpacity = 1 - crtFlicker * 0.003;
  cssRules.push(`    @keyframes crt-flicker-anim { 0%, 100% { opacity: 1; } 50% { opacity: ${flickerOpacity.toFixed(3)}; } }`);
  cssRules.push(`    .crt-flicker { animation: crt-flicker-anim ${flickerSpeed}s infinite; }`);
  animClasses.push('.crt-flicker');
}

if (screenShake > 0) {
  const interval = Math.max(500, 10000 - screenShake * 95);
  const shakeDuration = 0.35;
  const totalCycle = interval + shakeDuration * 1000;
  const idleEnd = ((interval / totalCycle) * 100).toFixed(1);
  const intensity = 2 + (screenShake / 100) * 8;

  const steps = [1, -0.75, 0.6, -0.4, 0.25, -0.1, 0];
  const stepDuration = shakeDuration / steps.length;
  const stepPercents = steps.map((_, i) => {
    const timeOffset = interval + i * stepDuration * 1000;
    return ((timeOffset / totalCycle) * 100).toFixed(1);
  });

  let keyframes = `    @keyframes screen-shake {\n      0%, ${idleEnd}% { transform: translate(0, 0); }\n`;
  steps.forEach((mult, i) => {
    const x = (mult * intensity).toFixed(2);
    const y = (mult * intensity * 0.5).toFixed(2);
    keyframes += `      ${stepPercents[i]}% { transform: translate(${x}px, ${y}px); }\n`;
  });
  keyframes += `      100% { transform: translate(0, 0); }\n    }`;

  cssRules.push(keyframes);
  cssRules.push(`    .screen-shake { animation: screen-shake ${(totalCycle / 1000).toFixed(2)}s infinite; transform-origin: center; transform-box: fill-box; }`);
  animClasses.push('.screen-shake');
}

if (crtEnabled && crtScreenBlip > 0) {
  const interval = Math.max(1000, 15000 - crtScreenBlip * 140);
  const blipDuration = 0.16;
  const totalCycle = interval + blipDuration * 1000;
  const idleEnd = ((interval / totalCycle) * 100).toFixed(1);

  const p1 = (((interval + 30) / totalCycle) * 100).toFixed(1);
  const p2 = (((interval + 70) / totalCycle) * 100).toFixed(1);
  const p3 = (((interval + 100) / totalCycle) * 100).toFixed(1);

  cssRules.push(`    @keyframes crt-screen-blip {
      0%, ${idleEnd}% { transform: translateX(0); filter: brightness(1); }
      ${p1}% { transform: translateX(20px); filter: brightness(1.6); }
      ${p2}% { transform: translateX(20px); filter: brightness(1.1); }
      ${p3}% { transform: translateX(-3px); filter: brightness(1.1); }
      100% { transform: translateX(0); filter: brightness(1); }
    }`);
  cssRules.push(`    .crt-screen-blip { animation: crt-screen-blip ${(totalCycle / 1000).toFixed(2)}s infinite; transform-origin: center; transform-box: fill-box; }`);
  animClasses.push('.crt-screen-blip');
}

if (crtEnabled && crtPowerLoss > 0) {
  const interval = Math.max(3000, 30000 - crtPowerLoss * 270);
  const powerDuration = 1.21;
  const totalCycle = interval + powerDuration * 1000;
  const idleEnd = ((interval / totalCycle) * 100).toFixed(1);

  const zigzagSteps = 6;
  const zigzagPercents = Array.from({ length: zigzagSteps }, (_, i) => {
    const time = interval + i * 40;
    return ((time / totalCycle) * 100).toFixed(1);
  });

  const collapseTime = interval + 0.24 * 1000 + 0.12 * 1000;
  const col = ((collapseTime / totalCycle) * 100).toFixed(1);

  const h1 = (((collapseTime + 40) / totalCycle) * 100).toFixed(1);
  const h2 = (((collapseTime + 80) / totalCycle) * 100).toFixed(1);
  const h3 = (((collapseTime + 120) / totalCycle) * 100).toFixed(1);

  const fadeTime = collapseTime + 0.12 * 1000 + 0.15 * 1000;
  const fade = ((fadeTime / totalCycle) * 100).toFixed(1);

  const pauseTime = fadeTime + 0.3 * 1000;
  const pause = ((pauseTime / totalCycle) * 100).toFixed(1);

  const r1 = (((pauseTime + 50) / totalCycle) * 100).toFixed(1);
  const r2 = (((pauseTime + 130) / totalCycle) * 100).toFixed(1);

  let keyframes = `    @keyframes crt-power-loss {\n      0%, ${idleEnd}% { transform: scaleY(1) translateX(0); filter: brightness(1); opacity: 1; }\n`;

  [8, -10, 6, -8, 5, -6].forEach((x, i) => {
    const scale = (1 - (i / zigzagSteps) * 0.3).toFixed(2);
    keyframes += `      ${zigzagPercents[i]}% { transform: scaleY(${scale}) translateX(${x}px); }\n`;
  });

  keyframes += `      ${col}% { transform: scaleY(0.01) translateX(0); filter: brightness(3); }\n`;
  keyframes += `      ${h1}% { transform: scaleY(0.01) translateX(6px); filter: brightness(3); }\n`;
  keyframes += `      ${h2}% { transform: scaleY(0.01) translateX(-4px); filter: brightness(3); }\n`;
  keyframes += `      ${h3}% { transform: scaleY(0.01) translateX(2px); filter: brightness(3); }\n`;
  keyframes += `      ${fade}% { opacity: 0; transform: scaleY(0.005) translateX(0); }\n`;
  keyframes += `      ${pause}% { opacity: 0; transform: scaleY(0.005) translateX(0); }\n`;

  keyframes += `      ${r1}% { transform: scaleY(0.01) translateX(0); opacity: 1; filter: brightness(2.5); }\n`;
  keyframes += `      ${r2}% { transform: scaleY(0.5) translateX(0); filter: brightness(1.5); }\n`;
  keyframes += `      100% { transform: scaleY(1) translateX(0); filter: brightness(1); opacity: 1; }\n    }`;

  cssRules.push(keyframes);
  cssRules.push(`    .crt-power-loss { animation: crt-power-loss ${(totalCycle / 1000).toFixed(2)}s infinite; transform-origin: center; transform-box: fill-box; }`);
  animClasses.push('.crt-power-loss');
}

if (cssRules.length > 0) {
  cssRules.push(`    @media (prefers-reduced-motion: reduce) { ${animClasses.join(', ')} { animation: none !important; } }`);
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

// CRT overlays
const overlays = [];
if (crtEnabled) {
  overlays.push(`    <rect width="${width}" height="${height}" fill="url(#scan)"/>`);
  overlays.push(`    <rect width="${width}" height="${height}" fill="url(#vig)"/>`);
}

// Build text content block with nested animation wrappers
// Nesting order (outer to inner): flicker > power-loss > screen-blip > screen-shake > pixelation > glow+colorShift > text
let textBlock = `<g${filterAttr}${colorShiftSpeed > 0 ? ' class="color-shift"' : ''}>\n${textElements}\n      </g>`;

if (pixelation > 0) {
  textBlock = `<g${pxFilterAttr}>\n        ${textBlock}\n      </g>`;
}

if (screenShake > 0) {
  textBlock = `<g class="screen-shake">\n      ${textBlock}\n      </g>`;
}

if (crtEnabled && crtScreenBlip > 0) {
  textBlock = `<g class="crt-screen-blip">\n      ${textBlock}\n      </g>`;
}

if (crtEnabled && crtPowerLoss > 0) {
  textBlock = `<g class="crt-power-loss">\n      ${textBlock}\n      </g>`;
}

if (crtEnabled && crtFlicker > 0) {
  textBlock = `<g class="crt-flicker">\n      ${textBlock}\n    </g>`;
} else {
  textBlock = `    ${textBlock}`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${defsBlock}${styleBlock}  <g${clipAttr}>
    <rect width="100%" height="100%" fill="${bgColor}"/>
${textBlock}
${overlays.length > 0 ? overlays.join('\n') + '\n' : ''}  </g>
</svg>`;

const outPath = resolve('banner.svg');
writeFileSync(outPath, svg, 'utf-8');

// Report what animations are included
const anims = [];
if (colorShiftSpeed > 0) anims.push('color-shift');
if (crtEnabled && crtFlicker > 0) anims.push('crt-flicker');
if (screenShake > 0) anims.push('screen-shake');
if (crtEnabled && crtScreenBlip > 0) anims.push('crt-screen-blip');
if (crtEnabled && crtPowerLoss > 0) anims.push('crt-power-loss');
console.log(`Banner written to ${outPath} (${width}x${height}, ${coloredLines.length} rows)`);
if (anims.length > 0) console.log(`Animations: ${anims.join(', ')}`);
