<script lang="ts">
  import { renderAscii, type RenderResult } from '$lib/engine/figlet-renderer';
  import { colorize, getGlowColor, type ColoredLine } from '$lib/engine/colorizer';
  import { applyDrip, applyDistress } from '$lib/engine/effects';
  import { appState } from '$lib/stores/state.svelte';
  import { getPaletteById } from '$lib/theme/palettes';
  import { tick } from 'svelte';

  let asciiResult = $state<RenderResult | null>(null);
  let coloredLines = $state<ColoredLine[]>([]);
  let glowColor = $state('#ff3f3f');
  let error = $state<string | null>(null);
  let loading = $state(false);
  let autoFontSize = $state<string | null>(null);

  let previewEl: HTMLDivElement;
  let preRef = $state<HTMLPreElement | undefined>();
  let debounceTimer: ReturnType<typeof setTimeout>;

  // Track text+font to only animate on meaningful content changes
  let lastRenderKey = '';
  let shouldAnimate = $state(false);

  // Re-render when inputs change
  $effect(() => {
    const { text, fontId, layout } = appState;

    clearTimeout(debounceTimer);
    if (!text.trim()) {
      asciiResult = null;
      coloredLines = [];
      error = null;
      return;
    }

    loading = true;
    debounceTimer = setTimeout(async () => {
      try {
        const renderKey = `${text}::${fontId}`;
        const result = await renderAscii({ text, fontId, layout });
        asciiResult = result;
        error = null;

        // Only trigger animation when text or font actually changed
        if (renderKey !== lastRenderKey) {
          lastRenderKey = renderKey;
          shouldAnimate = true;
        }
      } catch (e) {
        error = e instanceof Error ? e.message : 'Render failed';
        asciiResult = null;
        coloredLines = [];
      } finally {
        loading = false;
      }
    }, 150);
  });

  // Merged: Re-colorize + auto-scale in a single $effect
  $effect(() => {
    if (!asciiResult) {
      coloredLines = [];
      return;
    }
    const palette = getPaletteById(appState.paletteId);
    glowColor = getGlowColor(palette);

    let lines = colorize(asciiResult.lines, palette, appState.gradientDirection);

    if (appState.distressIntensity > 0) {
      lines = applyDistress(lines, appState.distressIntensity);
    }

    if (appState.dripDensity > 0) {
      const dripLines = applyDrip(lines, appState.dripDensity);
      lines = [...lines, ...dripLines];
    }

    coloredLines = lines;

    // Auto-scale: run after DOM update via rAF (avoids tick() overhead)
    requestAnimationFrame(() => {
      if (!previewEl || !preRef) return;
      const containerWidth = previewEl.clientWidth - 48;
      const contentWidth = preRef.scrollWidth;
      if (contentWidth > containerWidth && containerWidth > 0) {
        const scale = containerWidth / contentWidth;
        const basePx = 14;
        const newPx = Math.max(4, Math.floor(basePx * scale));
        autoFontSize = `${newPx}px`;
      } else {
        autoFontSize = null;
      }
    });
  });

  // Single container fade-in animation — only on text/font changes
  $effect(() => {
    if (shouldAnimate && coloredLines.length > 0 && appState.animationsEnabled) {
      shouldAnimate = false;
      tick().then(() => {
        if (!preRef) return;
        preRef.style.opacity = '0';
        requestAnimationFrame(() => {
          if (!preRef) return;
          preRef.style.transition = 'opacity 0.3s ease-in';
          preRef.style.opacity = '1';
        });
      });
    }
  });

  export function getPreviewElement(): HTMLDivElement {
    return previewEl;
  }

  export function getAsciiLines(): string[] {
    return asciiResult?.lines ?? [];
  }

  export function getColoredLines(): ColoredLine[] {
    return coloredLines;
  }

  export function getDimensions(): { width: number; height: number } {
    return { width: asciiResult?.width ?? 0, height: asciiResult?.height ?? 0 };
  }
</script>

<div
  bind:this={previewEl}
  class="scanlines metal-panel-inset preview-glow-border relative flex h-full min-h-[200px] flex-col overflow-auto p-6"
>
  {#if loading}
    <p class="animate-pulse text-doom-text-muted">Rendering...</p>
  {:else if error}
    <p class="text-doom-red">{error}</p>
  {:else if coloredLines.length > 0}
    <pre
      bind:this={preRef}
      class="whitespace-pre font-mono leading-none {appState.glowIntensity > 0 ? 'ascii-glow' : ''}"
      style="font-size: {autoFontSize ?? 'clamp(0.45rem, 1.2vw, 0.875rem)'};{appState.shadowOffset > 0
        ? ` filter: drop-shadow(${appState.shadowOffset}px ${appState.shadowOffset}px 0px rgba(0,0,0,0.8));`
        : ''} --glow-color: {glowColor}; --glow-intensity: {appState.glowIntensity};"
    >{#each coloredLines as line}{#each line as cell}<span
          style="color: {cell.color}"
        >{cell.char}</span>{/each}
{/each}</pre>
  {:else}
    <p class="text-doom-text-muted">Type something to generate ASCII art...</p>
  {/if}
</div>
