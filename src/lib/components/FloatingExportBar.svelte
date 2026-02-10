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

  let showSuccess = $state(false);
  let successTimer: ReturnType<typeof setTimeout>;

  function showFeedback() {
    showSuccess = true;
    clearTimeout(successTimer);
    successTimer = setTimeout(() => (showSuccess = false), 2000);
  }

  async function handleCopyText() {
    try {
      await copyText(asciiLines);
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  async function handleCopyImage() {
    if (!previewElement) return;
    try {
      await copyImage(previewElement);
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  async function handleDownloadPng() {
    if (!previewElement) return;
    try {
      await downloadPng(previewElement, filename);
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  function handleDownloadSvg() {
    try {
      downloadSvg(coloredLines, filename);
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }

  function handleDownloadAnsi() {
    try {
      downloadAnsi(coloredLines, filename);
      showFeedback();
    } catch {
      // Silent failure for floating bar
    }
  }
</script>

<!-- Floating Export Bar (Desktop Only) -->
<div class="absolute top-2 right-2 hidden sm:flex gap-1.5 items-center z-10">
  <!-- Copy Text Button -->
  <button
    class="doom-btn p-1.5"
    onclick={handleCopyText}
    title="Copy Text"
    aria-label="Copy Text"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="4" y="5" width="8" height="9" rx="1" />
      <path d="M12 5V3.5A1.5 1.5 0 0 0 10.5 2h-6A1.5 1.5 0 0 0 3 3.5V11" />
      <line x1="6" y1="7.5" x2="10" y2="7.5" />
      <line x1="6" y1="9.5" x2="10" y2="9.5" />
      <line x1="6" y1="11.5" x2="9" y2="11.5" />
    </svg>
  </button>

  <!-- PNG Download Button -->
  <button
    class="doom-btn p-1.5"
    onclick={handleDownloadPng}
    disabled={!previewElement}
    title="Download PNG"
    aria-label="Download PNG"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <circle cx="5.5" cy="6.5" r="1" fill="currentColor" />
      <path d="M14 10l-3-3-2 2-3-3-4 4v2h12z" />
    </svg>
  </button>

  <!-- Copy Image Button -->
  <button
    class="doom-btn p-1.5"
    onclick={handleCopyImage}
    disabled={!previewElement}
    title="Copy Image"
    aria-label="Copy Image"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="5" y="6" width="8" height="8" rx="1" />
      <path d="M11 6V4.5A1.5 1.5 0 0 0 9.5 3h-6A1.5 1.5 0 0 0 2 4.5V10" />
      <circle cx="7.5" cy="8.5" r="0.75" fill="currentColor" />
      <path d="M13 11.5l-2-2-1.5 1.5-1.5-1.5-2.5 2.5v1.5h7.5z" />
    </svg>
  </button>

  <!-- SVG Download Button -->
  <button
    class="doom-btn p-1.5"
    onclick={handleDownloadSvg}
    title="Download SVG"
    aria-label="Download SVG"
  >
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

  <!-- ANSI Download Button -->
  <button
    class="doom-btn p-1.5"
    onclick={handleDownloadAnsi}
    title="Download ANSI"
    aria-label="Download ANSI"
  >
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
