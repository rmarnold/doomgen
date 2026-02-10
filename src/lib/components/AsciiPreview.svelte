<script lang="ts">
  import { renderAscii, type RenderResult } from '$lib/engine/figlet-renderer';
  import { colorize, getGlowColor, type ColoredLine } from '$lib/engine/colorizer';
  import { applyDrip, applyDistress } from '$lib/engine/effects';
  import { appState } from '$lib/stores/state.svelte';
  import { getPaletteById } from '$lib/theme/palettes';
  import gsap from 'gsap';
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
        asciiResult = await renderAscii({ text, fontId, layout });
        error = null;
      } catch (e) {
        error = e instanceof Error ? e.message : 'Render failed';
        asciiResult = null;
        coloredLines = [];
      } finally {
        loading = false;
      }
    }, 150);
  });

  // Re-colorize when palette/direction/effects change
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
  });

  // Auto-scale: shrink font size if ASCII overflows container width
  $effect(() => {
    if (coloredLines.length > 0 && previewEl && preRef) {
      tick().then(() => {
        if (!previewEl || !preRef) return;
        const containerWidth = previewEl.clientWidth - 48; // padding
        const contentWidth = preRef.scrollWidth;
        if (contentWidth > containerWidth && containerWidth > 0) {
          const scale = containerWidth / contentWidth;
          const basePx = 14; // ~sm text size
          const newPx = Math.max(4, Math.floor(basePx * scale));
          autoFontSize = `${newPx}px`;
        } else {
          autoFontSize = null;
        }
      });
    }
  });

  // After coloredLines updates, animate new spans
  $effect(() => {
    if (coloredLines.length > 0 && appState.animationsEnabled) {
      tick().then(() => {
        if (!previewEl) return;
        const spans = previewEl.querySelectorAll('pre span');
        gsap.fromTo(
          spans,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.02,
            stagger: 0.001,
            ease: 'none',
          }
        );
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
      class="whitespace-pre font-mono leading-none"
      style="font-size: {autoFontSize ?? 'clamp(0.45rem, 1.2vw, 0.875rem)'};{appState.shadowOffset > 0
        ? ` filter: drop-shadow(${appState.shadowOffset}px ${appState.shadowOffset}px 0px rgba(0,0,0,0.8));`
        : ''}"
    >{#each coloredLines as line}{#each line as cell}<span
          style="color: {cell.color};{cell.color !== 'transparent' && appState.glowIntensity > 0
            ? ` text-shadow: 0 0 ${appState.glowIntensity * 0.07}px ${glowColor}, 0 0 ${appState.glowIntensity * 0.2}px ${glowColor}, 0 0 ${appState.glowIntensity * 0.42}px ${glowColor}, 0 0 ${appState.glowIntensity * 0.82}px ${glowColor};`
            : ''}"
        >{cell.char}</span>{/each}
{/each}</pre>
  {:else}
    <p class="text-doom-text-muted">Type something to generate ASCII art...</p>
  {/if}
</div>
