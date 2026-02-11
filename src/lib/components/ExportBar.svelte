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
      await copyImage(previewElement, { transparentBg: appState.transparentBg, bgColor: appState.bgColor });
      showFeedback('Image copied!');
    } catch {
      showFeedback('Copy failed');
    }
  }

  async function handleDownloadPng() {
    if (!previewElement) return;
    try {
      await downloadPng(previewElement, filename, { transparentBg: appState.transparentBg, bgColor: appState.bgColor });
      showFeedback('PNG saved!');
    } catch {
      showFeedback('Download failed');
    }
  }

  async function handleDownloadWebp() {
    if (!previewElement) return;
    try {
      await downloadWebp(previewElement, filename, { transparentBg: appState.transparentBg, bgColor: appState.bgColor });
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
          transparentBg: appState.transparentBg,
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
        screenShake: appState.screenShake,
        crtPowerLoss: appState.crtPowerLoss,
        crtScreenBlip: appState.crtScreenBlip,
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
        screenShake: appState.screenShake,
        crtPowerLoss: appState.crtPowerLoss,
        crtScreenBlip: appState.crtScreenBlip,
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
  const hasScreenShake = $derived(appState.screenShake > 0);
  const hasPowerLoss = $derived(appState.crtEnabled && appState.crtPowerLoss > 0);
  const hasScreenBlip = $derived(appState.crtEnabled && appState.crtScreenBlip > 0);
  const hasAnimations = $derived(hasColorShift || hasFlicker || hasScreenShake || hasPowerLoss || hasScreenBlip);

  const activeEffects = $derived(() => {
    const effects: string[] = [];
    if (hasColorShift) effects.push('Color Shift');
    if (hasFlicker) effects.push('CRT Flicker');
    if (hasScreenShake) effects.push('Screen Shake');
    if (hasPowerLoss) effects.push('Power Loss');
    if (hasScreenBlip) effects.push('Screen Blip');
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
    <span class={labelClass} title="Static single-frame image exports">Still</span>
    <button class={btnClass} onclick={handleDownloadPng} disabled={!previewElement} title="Download as PNG — lossless static image, supports transparent background">PNG</button>
    <button class={btnClass} onclick={handleDownloadWebp} disabled={!previewElement} title="Download as WebP — smaller file size than PNG, supports transparent background">WebP</button>
    <button class={btnClass} onclick={handleCopyImage} disabled={!previewElement} title="Copy a static image to clipboard — paste directly into chats, docs, or editors">Copy Image</button>
  </div>

  <!-- Row 2: Animated exports -->
  <div class="flex flex-wrap items-center gap-3">
    <span class={labelClass} title="Animated exports that preserve color shift and CRT flicker effects">Animated</span>
    <button class="{btnClass} {hasAnimations ? 'border-doom-orange/50 text-doom-orange hover:border-doom-orange' : ''}" onclick={handleDownloadAnimatedWebp} disabled={!previewElement || animatedWebpExporting || !hasAnimations} title="Download as animated WebP — captures color shift and flicker as a looping animation">
      {animatedWebpExporting ? 'Exporting...' : 'Animated WebP'}
    </button>
    <button class="{btnClass} {hasAnimations ? 'border-doom-orange/50 text-doom-orange hover:border-doom-orange' : ''}" onclick={handleDownloadSvg} title="Download as SVG — vector format with CSS animations, scalable to any size">SVG</button>
    <button class="{btnClass} {hasAnimations ? 'border-doom-orange/50 text-doom-orange hover:border-doom-orange' : ''}" onclick={handleDownloadHtml} title="Download as HTML — self-contained page with JavaScript animations">HTML</button>
    {#if !hasAnimations}
      <span class="text-[11px] font-mono text-doom-text-muted/40 italic">No animations active</span>
    {/if}
  </div>

  <!-- Row 3: Text + data exports -->
  <div class="flex flex-wrap items-center gap-3">
    <span class={labelClass} title="Plain text and terminal-compatible exports">Text</span>
    <button class={btnClass} onclick={handleCopyText} title="Copy plain ASCII text to clipboard — no colors, just characters">Copy Text</button>
    <button class={btnClass} onclick={handleDownloadAnsi} title="Download as ANSI — terminal escape codes for colored text in shells">ANSI</button>
    <button class={btnClass} onclick={handleDownloadBanner} title="Download as shell banner script — source it in .bashrc or .zshrc to display on terminal startup">Banner</button>
    <span class="text-doom-surface">|</span>
    <span class={labelClass} title="Save and restore your settings and art as JSON presets">Data</span>
    <button class={btnClass} onclick={handleDownloadJson} title="Download as JSON preset — saves all settings and colored text for later import">JSON</button>
    <button class={btnClass} onclick={() => fileInputEl.click()} title="Import a previously saved JSON preset to restore settings and art">Import</button>
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
