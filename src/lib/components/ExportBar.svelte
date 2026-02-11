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

  let transparentBg = $state(false);
  let feedback = $state<string | null>(null);
  let feedbackTimer: ReturnType<typeof setTimeout>;
  let animatedWebpExporting = $state(false);
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
      showFeedback('PNG saved!');
    } catch {
      showFeedback('Download failed');
    }
  }

  async function handleDownloadWebp() {
    if (!previewElement) return;
    try {
      await downloadWebp(previewElement, filename, { transparentBg, bgColor: appState.bgColor });
      showFeedback('WebP saved!');
    } catch {
      showFeedback('Download failed');
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
          transparentBg,
        },
        (frame, total) => showFeedback(`Encoding ${frame}/${total}`),
      );
      showFeedback('Animated WebP saved!');
    } catch (e) {
      console.error('Animated WebP export failed:', e);
      showFeedback('Export failed');
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
      });
      showFeedback('SVG saved!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadAnsi() {
    try {
      downloadAnsi(getColoredLines(), filename);
      showFeedback('ANSI saved!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadBanner() {
    try {
      downloadBanner(getColoredLines(), filename);
      showFeedback('Banner saved!');
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
      showFeedback('HTML saved!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadJson() {
    try {
      downloadJson(getColoredLines(), filename);
      showFeedback('JSON saved!');
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

  const hasColorShift = $derived(appState.colorShiftSpeed > 0);
  const hasFlicker = $derived(appState.crtEnabled && appState.crtFlicker > 0);
  const hasAnimations = $derived(hasColorShift || hasFlicker);

  const activeEffects = $derived(() => {
    const effects: string[] = [];
    if (hasColorShift) effects.push('Color Shift');
    if (hasFlicker) effects.push('CRT Flicker');
    return effects;
  });

  const btnClass = 'rounded border border-doom-surface bg-doom-black px-4 py-2 text-sm font-mono text-doom-text-muted transition-colors hover:border-doom-red hover:text-doom-text active:bg-doom-surface';
  const labelClass = 'text-[10px] font-mono uppercase tracking-widest text-doom-text-muted/50';
</script>

<div class="flex flex-col gap-3">
  <!-- Animation notice -->
  {#if hasAnimations}
    <div class="flex items-start gap-2 rounded border border-doom-orange/30 bg-doom-orange/5 px-3 py-2 text-xs font-mono leading-relaxed">
      <span class="text-doom-orange mt-0.5 shrink-0">!</span>
      <div class="text-doom-text-muted">
        <span class="text-doom-orange">{activeEffects().join(' + ')}</span> active —
        PNG, WebP, and Copy Image capture a single still frame.
        Use <strong class="text-doom-text">Animated WebP</strong>, <strong class="text-doom-text">SVG</strong>, or <strong class="text-doom-text">HTML</strong> to preserve animations.
      </div>
    </div>
  {/if}

  <!-- Row 1: Static image exports -->
  <div class="flex flex-wrap items-center gap-3">
    <span class={labelClass}>Still</span>
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
  </div>

  <!-- Row 2: Animated exports -->
  <div class="flex flex-wrap items-center gap-3">
    <span class={labelClass}>Animated</span>
    <button class="{btnClass} {hasAnimations ? 'border-doom-orange/50 text-doom-orange hover:border-doom-orange' : ''}" onclick={handleDownloadAnimatedWebp} disabled={!previewElement || animatedWebpExporting || !hasAnimations}>
      {animatedWebpExporting ? 'Exporting...' : 'Animated WebP'}
    </button>
    <button class="{btnClass} {hasAnimations ? 'border-doom-orange/50 text-doom-orange hover:border-doom-orange' : ''}" onclick={handleDownloadSvg}>SVG</button>
    <button class="{btnClass} {hasAnimations ? 'border-doom-orange/50 text-doom-orange hover:border-doom-orange' : ''}" onclick={handleDownloadHtml}>HTML</button>
    {#if !hasAnimations}
      <span class="text-[11px] font-mono text-doom-text-muted/40 italic">No animations active</span>
    {/if}
  </div>

  <!-- Row 3: Text + data exports -->
  <div class="flex flex-wrap items-center gap-3">
    <span class={labelClass}>Text</span>
    <button class={btnClass} onclick={handleCopyText}>Copy Text</button>
    <button class={btnClass} onclick={handleDownloadAnsi}>ANSI</button>
    <button class={btnClass} onclick={handleDownloadBanner}>Banner</button>
    <span class="text-doom-surface">|</span>
    <span class={labelClass}>Data</span>
    <button class={btnClass} onclick={handleDownloadJson}>JSON</button>
    <button class={btnClass} onclick={() => fileInputEl.click()}>Import</button>
    <input
      bind:this={fileInputEl}
      type="file"
      accept=".json,.doomgen.json"
      onchange={handleImportJson}
      class="hidden"
    />
  </div>

  {#if feedback}
    <span class="text-sm text-doom-green">{feedback}</span>
  {/if}
</div>
