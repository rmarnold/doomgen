<script lang="ts">
  import { renderAscii, type RenderResult } from '$lib/engine/figlet-renderer';
  import { colorize, getGlowColor, type ColoredLine } from '$lib/engine/colorizer';
  import { applyDrip, applyDistress } from '$lib/engine/effects';
  import { appState } from '$lib/stores/state.svelte';
  import { getPaletteById } from '$lib/theme/palettes';

  let asciiResult = $state<RenderResult | null>(null);
  let coloredLines = $state<ColoredLine[]>([]);
  let glowColor = $state('#ff3f3f');
  let error = $state<string | null>(null);
  let loading = $state(false);

  let previewEl: HTMLDivElement;
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

    // Apply distress
    if (appState.distressIntensity > 0) {
      lines = applyDistress(lines, appState.distressIntensity);
    }

    // Apply drip
    if (appState.dripDensity > 0) {
      const dripLines = applyDrip(lines, appState.dripDensity);
      lines = [...lines, ...dripLines];
    }

    coloredLines = lines;
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
</script>

<div
  bind:this={previewEl}
  class="scanlines relative h-full min-h-[200px] overflow-auto rounded-lg border border-doom-surface bg-doom-dark p-6"
>
  {#if loading}
    <p class="animate-pulse text-doom-text-muted">Rendering...</p>
  {:else if error}
    <p class="text-doom-red">{error}</p>
  {:else if coloredLines.length > 0}
    <pre
      class="whitespace-pre font-mono text-xs leading-none sm:text-sm"
      style={appState.shadowOffset > 0
        ? `filter: drop-shadow(${appState.shadowOffset}px ${appState.shadowOffset}px 0px rgba(0,0,0,0.8));`
        : ''}
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
