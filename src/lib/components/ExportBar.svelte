<script lang="ts">
  import { copyText, copyImage, downloadPng, downloadWebp, downloadSvg, downloadAnsi, downloadBanner, downloadHtml, downloadJson, importJson } from '$lib/engine/exporter';
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

  let transparentBg = $state(false);
  let feedback = $state<string | null>(null);
  let feedbackTimer: ReturnType<typeof setTimeout>;
  let fileInputEl: HTMLInputElement;

  function showFeedback(msg: string) {
    feedback = msg;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => (feedback = null), 2000);
  }

  async function handleCopyText() {
    try {
      await copyText(getAsciiLines());
      showFeedback('Text copied!');
    } catch {
      showFeedback('Copy failed');
    }
  }

  async function handleCopyImage() {
    if (!previewElement) return;
    try {
      await copyImage(previewElement, { transparentBg, bgColor: appState.bgColor });
      showFeedback('Image copied!');
    } catch {
      showFeedback('Copy failed');
    }
  }

  async function handleDownloadPng() {
    if (!previewElement) return;
    try {
      await downloadPng(previewElement, filename, { transparentBg, bgColor: appState.bgColor });
      showFeedback('PNG downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  async function handleDownloadWebp() {
    if (!previewElement) return;
    try {
      await downloadWebp(previewElement, filename, { transparentBg, bgColor: appState.bgColor });
      showFeedback('WebP downloaded!');
    } catch {
      showFeedback('Download failed');
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
      });
      showFeedback('SVG downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadAnsi() {
    try {
      downloadAnsi(getColoredLines(), filename);
      showFeedback('ANSI downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadBanner() {
    try {
      downloadBanner(getColoredLines(), filename);
      showFeedback('Banner downloaded!');
    } catch {
      showFeedback('Download failed');
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
      });
      showFeedback('HTML downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadJson() {
    try {
      downloadJson(getColoredLines(), filename);
      showFeedback('JSON downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  async function handleImportJson(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const success = await importJson(file);
    showFeedback(success ? 'Imported!' : 'Import failed');
    input.value = '';
  }

  const btnClass = 'rounded border border-doom-surface bg-doom-black px-4 py-2 text-sm font-mono text-doom-text-muted transition-colors hover:border-doom-red hover:text-doom-text active:bg-doom-surface';
</script>

<div class="flex flex-wrap items-center gap-3">
  <button class={btnClass} onclick={handleCopyText}>Copy Text</button>
  <label class="flex items-center gap-1.5 text-sm font-mono text-doom-text-muted cursor-pointer select-none">
    <input
      type="checkbox"
      bind:checked={transparentBg}
      class="accent-doom-red w-3.5 h-3.5 cursor-pointer"
    />
    Transparent
  </label>
  <button class={btnClass} onclick={handleDownloadPng} disabled={!previewElement}>PNG</button>
  <button class={btnClass} onclick={handleDownloadWebp} disabled={!previewElement}>WebP</button>
  <button class={btnClass} onclick={handleCopyImage} disabled={!previewElement}>Copy Image</button>
  <button class={btnClass} onclick={handleDownloadSvg}>SVG</button>
  <button class={btnClass} onclick={handleDownloadAnsi}>ANSI</button>
  <button class={btnClass} onclick={handleDownloadBanner}>Banner</button>
  <button class={btnClass} onclick={handleDownloadHtml}>HTML</button>
  <button class={btnClass} onclick={handleDownloadJson}>JSON</button>
  <button class={btnClass} onclick={() => fileInputEl.click()}>Import</button>
  <input
    bind:this={fileInputEl}
    type="file"
    accept=".json,.doomgen.json"
    onchange={handleImportJson}
    class="hidden"
  />

  {#if feedback}
    <span class="text-sm text-doom-green">{feedback}</span>
  {/if}
</div>
