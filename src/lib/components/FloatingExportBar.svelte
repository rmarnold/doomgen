<script lang="ts">
  import { copyText, copyImage, downloadPng, downloadWebp, downloadAnimatedWebp, downloadSvg, downloadAnsi, downloadBanner, downloadHtml, downloadJson, importJson } from '$lib/engine/exporter';
  import type { ColoredLine } from '$lib/engine/colorizer';
  import { appState } from '$lib/stores/state.svelte';
  import { getPaletteById } from '$lib/theme/palettes';
  import { getGlowColor } from '$lib/engine/colorizer';

  interface Props {
    getAsciiLines: () => string[];
    getColoredLines: () => ColoredLine[];
    previewElement: HTMLElement | null;
    filename: string;
  }

  let { getAsciiLines, getColoredLines, previewElement, filename }: Props = $props();

  let showSuccess = $state(false);
  let successTimer: ReturnType<typeof setTimeout>;
  let animatedWebpExporting = $state(false);
  let fileInputEl: HTMLInputElement;

  function showFeedback() {
    showSuccess = true;
    clearTimeout(successTimer);
    successTimer = setTimeout(() => (showSuccess = false), 2000);
  }

  async function handleCopyText() {
    try {
      await copyText(getAsciiLines());
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  async function handleCopyImage() {
    if (!previewElement) return;
    try {
      await copyImage(previewElement, { transparentBg: appState.transparentBg, bgColor: appState.bgColor });
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  async function handleDownloadPng() {
    if (!previewElement) return;
    try {
      await downloadPng(previewElement, filename, { transparentBg: appState.transparentBg, bgColor: appState.bgColor });
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  async function handleDownloadWebp() {
    if (!previewElement) return;
    try {
      await downloadWebp(previewElement, filename, { transparentBg: appState.transparentBg, bgColor: appState.bgColor });
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  async function handleDownloadAnimatedWebp() {
    if (!previewElement) return;
    animatedWebpExporting = true;
    try {
      await downloadAnimatedWebp(
        previewElement,
        filename,
        {
          bgColor: appState.bgColor,
          colorShiftSpeed: appState.colorShiftSpeed,
          crtEnabled: appState.crtEnabled,
          crtFlicker: appState.crtFlicker,
          transparentBg: appState.transparentBg,
        },
      );
      showFeedback();
    } catch (e) {
      console.error('Animated WebP export failed:', e);
    } finally {
      animatedWebpExporting = false;
    }
  }

  function handleDownloadSvg() {
    try {
      const lines = getColoredLines();
      const palette = getPaletteById(appState.paletteId);
      const svgGlowColor = getGlowColor(palette);
      downloadSvg(lines, filename, {
        bgColor: appState.bgColor,
        glowIntensity: appState.glowIntensity,
        glowColor: svgGlowColor,
        shadowOffset: appState.shadowOffset,
        crtEnabled: appState.crtEnabled,
        crtCurvature: appState.crtCurvature,
        crtFlicker: appState.crtFlicker,
        pixelation: appState.pixelation,
        colorShiftSpeed: appState.colorShiftSpeed,
        screenShake: appState.screenShake,
        crtPowerLoss: appState.crtPowerLoss,
        crtScreenBlip: appState.crtScreenBlip,
      });
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  function handleDownloadAnsi() {
    try {
      downloadAnsi(getColoredLines(), filename);
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  function handleDownloadBanner() {
    try {
      downloadBanner(getColoredLines(), filename);
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  function handleDownloadHtml() {
    try {
      const lines = getColoredLines();
      const palette = getPaletteById(appState.paletteId);
      const glowColor = getGlowColor(palette);
      downloadHtml(lines, filename, {
        bgColor: appState.bgColor,
        glowIntensity: appState.glowIntensity,
        glowColor,
        shadowOffset: appState.shadowOffset,
        crtEnabled: appState.crtEnabled,
        crtCurvature: appState.crtCurvature,
        crtFlicker: appState.crtFlicker,
        pixelation: appState.pixelation,
        colorShiftSpeed: appState.colorShiftSpeed,
        screenShake: appState.screenShake,
        crtPowerLoss: appState.crtPowerLoss,
        crtScreenBlip: appState.crtScreenBlip,
      });
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  function handleDownloadJson() {
    try {
      downloadJson(getColoredLines(), filename);
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  async function handleImportJson(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await importJson(file);
    showFeedback();
    input.value = '';
  }

  const hasAnimations = $derived(
    appState.colorShiftSpeed > 0 ||
    (appState.crtEnabled && appState.crtFlicker > 0) ||
    appState.screenShake > 0 ||
    (appState.crtEnabled && appState.crtPowerLoss > 0) ||
    (appState.crtEnabled && appState.crtScreenBlip > 0)
  );
</script>

<!-- Floating Export Bar (Desktop Only) -->
<div class="absolute top-2 right-2 hidden sm:flex gap-1.5 items-center z-10">
  <!-- Transparent Background Toggle -->
  <button
    class="doom-btn p-1.5 {appState.transparentBg ? 'text-doom-green border-doom-green' : ''}"
    onclick={() => (appState.transparentBg = !appState.transparentBg)}
    title={appState.transparentBg ? 'Transparent Background: ON' : 'Transparent Background: OFF'}
    aria-label="Toggle Transparent Background"
    aria-pressed={appState.transparentBg}
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
      <rect x="1" y="1" width="3.5" height="3.5" fill="currentColor" opacity="0.5" />
      <rect x="8" y="1" width="3.5" height="3.5" fill="currentColor" opacity="0.5" />
      <rect x="4.5" y="4.5" width="3.5" height="3.5" fill="currentColor" opacity="0.5" />
      <rect x="11.5" y="4.5" width="3.5" height="3.5" fill="currentColor" opacity="0.5" />
      <rect x="1" y="8" width="3.5" height="3.5" fill="currentColor" opacity="0.5" />
      <rect x="8" y="8" width="3.5" height="3.5" fill="currentColor" opacity="0.5" />
      <rect x="4.5" y="11.5" width="3.5" height="3.5" fill="currentColor" opacity="0.5" />
      <rect x="11.5" y="11.5" width="3.5" height="3.5" fill="currentColor" opacity="0.5" />
    </svg>
  </button>

  <!-- Copy Text -->
  <button class="doom-btn p-1.5" onclick={handleCopyText} title="Copy Text" aria-label="Copy Text">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="4" y="5" width="8" height="9" rx="1" />
      <path d="M12 5V3.5A1.5 1.5 0 0 0 10.5 2h-6A1.5 1.5 0 0 0 3 3.5V11" />
      <line x1="6" y1="7.5" x2="10" y2="7.5" />
      <line x1="6" y1="9.5" x2="10" y2="9.5" />
      <line x1="6" y1="11.5" x2="9" y2="11.5" />
    </svg>
  </button>

  <!-- Separator -->
  <div class="w-px h-4 bg-doom-surface/50"></div>

  <!-- PNG (static) -->
  <button class="doom-btn p-1.5" onclick={handleDownloadPng} disabled={!previewElement} title="PNG (static snapshot)" aria-label="Download PNG">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <circle cx="5.5" cy="6.5" r="1" fill="currentColor" />
      <path d="M14 10l-3-3-2 2-3-3-4 4v2h12z" />
    </svg>
  </button>

  <!-- WebP (static) -->
  <button class="doom-btn p-1.5" onclick={handleDownloadWebp} disabled={!previewElement} title="WebP (static, smaller file)" aria-label="Download WebP">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <path d="M4.5 9.5l1.5-4 1.5 3 1.5-3 1.5 4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>

  <!-- Copy Image (static) -->
  <button class="doom-btn p-1.5" onclick={handleCopyImage} disabled={!previewElement} title="Copy Image (static)" aria-label="Copy Image">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="5" y="6" width="8" height="8" rx="1" />
      <path d="M11 6V4.5A1.5 1.5 0 0 0 9.5 3h-6A1.5 1.5 0 0 0 2 4.5V10" />
      <circle cx="7.5" cy="8.5" r="0.75" fill="currentColor" />
      <path d="M13 11.5l-2-2-1.5 1.5-1.5-1.5-2.5 2.5v1.5h7.5z" />
    </svg>
  </button>

  <!-- Separator -->
  <div class="w-px h-4 bg-doom-surface/50"></div>

  <!-- Animated WebP -->
  <button
    class="doom-btn p-1.5 {animatedWebpExporting ? 'animate-pulse text-doom-orange' : ''}"
    onclick={handleDownloadAnimatedWebp}
    disabled={!previewElement || animatedWebpExporting || !hasAnimations}
    title={!hasAnimations ? 'Animated WebP (enable color shift or CRT flicker)' : animatedWebpExporting ? 'Exporting animated WebP...' : 'Animated WebP (color shift + flicker)'}
    aria-label="Download Animated WebP"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <path d="M5 8h2l1-2.5 1.5 5L11 8h1" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" />
    </svg>
  </button>

  <!-- SVG (animated) -->
  <button class="doom-btn p-1.5" onclick={handleDownloadSvg} title="SVG (with CSS animations)" aria-label="Download SVG">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M3 3l10 0" />
      <path d="M3 3l0 10" />
      <path d="M13 3l0 10" />
      <path d="M3 13l10 0" />
      <path d="M6 6l1.5 4L9 6" />
      <path d="M10 7.5h2" />
      <circle cx="11" cy="7.5" r="0.75" fill="currentColor" />
    </svg>
  </button>

  <!-- HTML (animated) -->
  <button class="doom-btn p-1.5" onclick={handleDownloadHtml} title="HTML (with JS animations)" aria-label="Download HTML">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M3 3l2 10h6l2-10" />
      <path d="M5 7h6" />
    </svg>
  </button>

  <!-- Separator -->
  <div class="w-px h-4 bg-doom-surface/50"></div>

  <!-- ANSI -->
  <button class="doom-btn p-1.5" onclick={handleDownloadAnsi} title="ANSI (terminal colors)" aria-label="Download ANSI">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <path d="M4 5.5h3" stroke-width="1" />
      <path d="M8.5 5.5h3.5" stroke-width="1" />
      <path d="M4 7.5h2" stroke-width="1" />
      <path d="M7 7.5h5" stroke-width="1" />
      <path d="M4 9.5h4" stroke-width="1" />
      <path d="M9.5 9.5h2.5" stroke-width="1" />
      <circle cx="4.5" cy="11.5" r="0.5" fill="currentColor" />
    </svg>
  </button>

  <!-- Banner -->
  <button class="doom-btn p-1.5" onclick={handleDownloadBanner} title="Banner (shell script)" aria-label="Download Banner Script">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path d="M4.5 6l2 2-2 2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8 10h3.5" stroke-linecap="round" />
    </svg>
  </button>

  <!-- JSON -->
  <button class="doom-btn p-1.5" onclick={handleDownloadJson} title="JSON (save preset)" aria-label="Download JSON">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M5 3C4 3 3 4 3 5v1.5C3 7.5 2 8 2 8s1 .5 1 1.5V11c0 1 1 2 2 2" stroke-linecap="round" />
      <path d="M11 3c1 0 2 1 2 2v1.5C13 7.5 14 8 14 8s-1 .5-1 1.5V11c0 1-1 2-2 2" stroke-linecap="round" />
    </svg>
  </button>

  <!-- Import -->
  <button class="doom-btn p-1.5" onclick={() => fileInputEl.click()} title="Import JSON preset" aria-label="Import JSON">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M8 10V3" stroke-linecap="round" />
      <path d="M5 6l3-3 3 3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M3 10v2.5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V10" stroke-linecap="round" />
    </svg>
  </button>
  <input
    bind:this={fileInputEl}
    type="file"
    accept=".json,.doomgen.json"
    onchange={handleImportJson}
    class="hidden"
  />

  <!-- Success Indicator -->
  {#if showSuccess}
    <div class="flex items-center gap-1 text-doom-green">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M3 8l3 3 7-7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  {/if}
</div>

<style>
  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  button:disabled:hover {
    border-color: oklch(0.28 0.02 30);
    box-shadow: inset 0 1px 0 oklch(0.30 0.02 30);
  }
</style>
