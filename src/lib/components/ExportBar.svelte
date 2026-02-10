<script lang="ts">
  import { copyText, copyImage, downloadPng, downloadSvg, downloadAnsi } from '$lib/engine/exporter';
  import type { ColoredLine } from '$lib/engine/colorizer';

  interface Props {
    asciiLines: string[];
    coloredLines: ColoredLine[];
    previewElement: HTMLElement | null;
    filename: string;
  }

  let { asciiLines, coloredLines, previewElement, filename }: Props = $props();

  let feedback = $state<string | null>(null);
  let feedbackTimer: ReturnType<typeof setTimeout>;

  function showFeedback(msg: string) {
    feedback = msg;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => (feedback = null), 2000);
  }

  async function handleCopyText() {
    try {
      await copyText(asciiLines);
      showFeedback('Text copied!');
    } catch {
      showFeedback('Copy failed');
    }
  }

  async function handleCopyImage() {
    if (!previewElement) return;
    try {
      await copyImage(previewElement);
      showFeedback('Image copied!');
    } catch {
      showFeedback('Copy failed');
    }
  }

  async function handleDownloadPng() {
    if (!previewElement) return;
    try {
      await downloadPng(previewElement, filename);
      showFeedback('PNG downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadSvg() {
    try {
      downloadSvg(coloredLines, filename);
      showFeedback('SVG downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  function handleDownloadAnsi() {
    try {
      downloadAnsi(coloredLines, filename);
      showFeedback('ANSI downloaded!');
    } catch {
      showFeedback('Download failed');
    }
  }

  const btnClass = 'rounded border border-doom-surface bg-doom-black px-4 py-2 text-sm font-mono text-doom-text-muted transition-colors hover:border-doom-red hover:text-doom-text active:bg-doom-surface';
</script>

<div class="flex flex-wrap items-center gap-3">
  <button class={btnClass} onclick={handleCopyText}>Copy Text</button>
  <button class={btnClass} onclick={handleDownloadPng} disabled={!previewElement}>PNG</button>
  <button class={btnClass} onclick={handleCopyImage} disabled={!previewElement}>Copy Image</button>
  <button class={btnClass} onclick={handleDownloadSvg}>SVG</button>
  <button class={btnClass} onclick={handleDownloadAnsi}>ANSI</button>

  {#if feedback}
    <span class="text-sm text-doom-green">{feedback}</span>
  {/if}
</div>
