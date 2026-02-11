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

    let lines = colorize(asciiResult.lines, palette, {
      direction: appState.gradientDirection,
      normalizeBrightness: appState.normalizeBrightness,
      removeBlack: appState.removeBlack,
      paletteStart: appState.paletteStart,
      paletteEnd: appState.paletteEnd,
    });

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

  // Screen shake — GSAP diminishing oscillation
  $effect(() => {
    if (!appState.screenShake) return;
    appState.screenShake = false;

    if (!preRef || !appState.animationsEnabled) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    import('gsap').then(({ default: gsap }) => {
      const tl = gsap.timeline();
      const offsets = [8, -6, 5, -3, 2, -1, 0];
      offsets.forEach((x, i) => {
        tl.to(preRef!, { x, y: x * 0.5, duration: 0.05, ease: 'power1.inOut' }, i * 0.05);
      });
    });
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
  class="relative flex min-h-[250px] flex-col items-center justify-center overflow-auto p-6 sm:min-h-[350px]
    {appState.transparentBg ? '' : 'metal-panel-inset'}
    {!appState.transparentBg && !appState.crtEnabled ? 'scanlines preview-glow-border' : ''}"
  style="background-color: {appState.transparentBg ? 'transparent' : appState.bgColor}; {appState.transparentBg ? 'background-image: repeating-conic-gradient(#222 0% 25%, #181818 0% 50%); background-size: 16px 16px;' : ''}"
>
  {#if loading}
    <p class="animate-pulse text-doom-text-muted">Rendering...</p>
  {:else if error}
    <p class="text-doom-red">{error}</p>
  {:else if coloredLines.length > 0}
    {@const filters = [
      appState.pixelation > 0 ? 'url(#doomgen-pixelate)' : '',
      appState.shadowOffset > 0 ? `drop-shadow(${appState.shadowOffset}px ${appState.shadowOffset}px 0px rgba(0,0,0,0.8))` : '',
    ].filter(Boolean).join(' ')}
    <div
      data-export-target
      class="relative
        {appState.crtEnabled ? `crt-scanlines crt-phosphor crt-curvature ${appState.transparentBg ? '' : 'crt-vignette'}` : ''}
        {appState.crtEnabled && appState.crtFlicker > 0 ? 'crt-flicker' : ''}"
      style="background-color: {appState.transparentBg ? 'transparent' : appState.bgColor}; padding: 1.5rem;
        {appState.crtEnabled ? `--crt-curve: ${appState.crtCurvature}; --crt-flicker-speed: ${Math.max(0.05, 0.2 - appState.crtFlicker * 0.0015)}s; --crt-flicker-opacity: ${1 - appState.crtFlicker * 0.003};` : ''}"
    >
      {#if appState.pixelation > 0}
      <svg width="0" height="0" style="position:absolute">
        <filter id="doomgen-pixelate">
          <feGaussianBlur stdDeviation="{appState.pixelation}" in="SourceGraphic" result="blurred" />
          <feComponentTransfer in="blurred">
            <feFuncR type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1" />
            <feFuncG type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1" />
            <feFuncB type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1" />
          </feComponentTransfer>
        </filter>
      </svg>
      {/if}
      <div class={appState.colorShiftSpeed > 0 ? 'color-shift' : ''} style={appState.colorShiftSpeed > 0 ? `--color-shift-duration: ${Math.max(0.5, 10 - appState.colorShiftSpeed * 0.095)}s` : ''}>
        <pre
          bind:this={preRef}
          class="whitespace-pre font-mono leading-none {appState.glowIntensity > 0 ? 'ascii-glow' : ''}"
          style="font-size: {appState.zoom > 0 ? Math.max(4, Math.round(14 * appState.zoom / 100)) + 'px' : (autoFontSize ?? 'clamp(0.45rem, 1.2vw, 0.875rem)')};{filters
            ? ` filter: ${filters};`
            : ''} --glow-color: {glowColor}; --glow-intensity: {appState.glowIntensity};"
        >{#each coloredLines as line}{#each line as cell}<span
              style="color: {cell.color}"
            >{cell.char}</span>{/each}
{/each}</pre>
      </div>
    </div>
  {:else}
    <p class="text-doom-text-muted">Type something to generate ASCII art...</p>
  {/if}
</div>
