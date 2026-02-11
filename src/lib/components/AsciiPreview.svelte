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
  let barrelMapUri = $state('');
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

  // Screen shake — randomized interval loop
  function triggerShake() {
    if (!preRef) return;
    import('gsap').then(({ default: gsap }) => {
      const el = preRef!;
      const intensity = 2 + (appState.screenShake / 100) * 8;
      const tl = gsap.timeline({
        onComplete: () => { gsap.set(el, { clearProps: 'transform' }); },
      });
      const offsets = [1, -0.75, 0.6, -0.4, 0.25, -0.1, 0].map(f => f * intensity);
      offsets.forEach((x, i) => {
        tl.to(el, { x, y: x * 0.5, duration: 0.05, ease: 'power1.inOut' }, i * 0.05);
      });
    });
  }

  $effect(() => {
    const freq = appState.screenShake;
    if (freq <= 0 || !appState.animationsEnabled) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Interval: 100 → ~0.5s, 1 → ~10s, with random jitter
    const baseMs = Math.max(500, 10000 - freq * 95);

    function scheduleNext() {
      const jitter = baseMs * (0.5 + Math.random());
      return setTimeout(() => {
        triggerShake();
        timerId = scheduleNext();
      }, jitter);
    }

    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  });

  // CRT power-loss — zigzag collapse then restore
  // Helper: combine brightness with the element's existing filters (pixelation, drop-shadow)
  function getBaseFilter(el: HTMLElement): string {
    return el.style.filter?.replace(/brightness\([^)]*\)\s*/g, '').trim() || '';
  }

  function withBrightness(base: string, b: number): string {
    return b === 1 ? base || 'none' : `${base} brightness(${b})`.trim();
  }

  // Clean up GSAP inline styles to avoid interfering with CSS animations
  function cleanupGsap(el: HTMLElement, baseFilter: string) {
    import('gsap').then(({ default: gsap }) => {
      gsap.set(el, { clearProps: 'transform,opacity' });
      el.style.filter = baseFilter;
    });
  }

  let powerLossActive = false;
  function triggerPowerLoss() {
    if (!preRef || powerLossActive) return;
    powerLossActive = true;
    const baseFilter = getBaseFilter(preRef);
    import('gsap').then(({ default: gsap }) => {
      const el = preRef!;
      const tl = gsap.timeline({
        onComplete: () => {
          cleanupGsap(el, baseFilter);
          powerLossActive = false;
        },
      });

      // Phase 1: Quick zigzag jitter (signal instability)
      const zigzags = 6;
      for (let i = 0; i < zigzags; i++) {
        const xOff = (i % 2 === 0 ? 1 : -1) * (8 + Math.random() * 12);
        tl.to(el, {
          x: xOff,
          scaleY: 1 - (i / zigzags) * 0.3,
          duration: 0.04,
          ease: 'none',
        });
      }

      // Phase 2: Collapse to horizontal line with bright flash
      tl.to(el, {
        scaleY: 0.01,
        x: 0,
        filter: withBrightness(baseFilter, 3),
        duration: 0.12,
        ease: 'power2.in',
      });

      // Phase 3: Hold the thin bright line with small zigzag
      tl.to(el, { x: 6, duration: 0.04, ease: 'none' });
      tl.to(el, { x: -4, duration: 0.04, ease: 'none' });
      tl.to(el, { x: 2, duration: 0.04, ease: 'none' });

      // Phase 4: Fade the line out
      tl.to(el, {
        opacity: 0,
        scaleY: 0.005,
        duration: 0.15,
        ease: 'power1.in',
      });

      // Phase 5: Pause (screen off)
      tl.to(el, { duration: 0.3 });

      // Phase 6: Power back on — expand with flicker
      tl.to(el, {
        scaleY: 0.01,
        opacity: 1,
        filter: withBrightness(baseFilter, 2.5),
        duration: 0.05,
      });
      tl.to(el, {
        scaleY: 0.5,
        filter: withBrightness(baseFilter, 1.5),
        duration: 0.08,
        ease: 'power2.out',
      });
      tl.to(el, {
        scaleY: 1,
        x: 0,
        filter: withBrightness(baseFilter, 1),
        duration: 0.15,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  }

  $effect(() => {
    const freq = appState.crtPowerLoss;
    if (freq <= 0 || !appState.crtEnabled || !appState.animationsEnabled) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Interval: 100 → ~3s, 1 → ~30s, with random jitter
    const baseMs = Math.max(3000, 30000 - freq * 270);

    function scheduleNext() {
      const jitter = baseMs * (0.5 + Math.random());
      return setTimeout(() => {
        triggerPowerLoss();
        timerId = scheduleNext();
      }, jitter);
    }

    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  });

  // CRT screen blip — quick horizontal shift + brightness flash
  function triggerScreenBlip() {
    if (!preRef) return;
    const baseFilter = getBaseFilter(preRef);
    import('gsap').then(({ default: gsap }) => {
      const el = preRef!;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const shiftAmount = 15 + Math.random() * 25;
      const tl = gsap.timeline({
        onComplete: () => cleanupGsap(el, baseFilter),
      });

      // Quick shift with brightness flash
      tl.to(el, {
        x: direction * shiftAmount,
        filter: withBrightness(baseFilter, 1.6),
        duration: 0.03,
        ease: 'none',
      });

      // Hold shifted briefly
      tl.to(el, { duration: 0.04 + Math.random() * 0.06 });

      // Snap back with slight overshoot
      tl.to(el, {
        x: direction * -3,
        filter: withBrightness(baseFilter, 1.1),
        duration: 0.03,
        ease: 'none',
      });

      // Settle
      tl.to(el, {
        x: 0,
        filter: withBrightness(baseFilter, 1),
        duration: 0.06,
        ease: 'power2.out',
      });
    });
  }

  $effect(() => {
    const freq = appState.crtScreenBlip;
    if (freq <= 0 || !appState.crtEnabled || !appState.animationsEnabled) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Interval: 100 → ~1s, 1 → ~15s, with random jitter
    const baseMs = Math.max(1000, 15000 - freq * 140);

    function scheduleNext() {
      const jitter = baseMs * (0.5 + Math.random());
      return setTimeout(() => {
        triggerScreenBlip();
        timerId = scheduleNext();
      }, jitter);
    }

    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  });

  // Generate barrel displacement map for CRT curvature (runs once on mount)
  $effect(() => {
    if (typeof document === 'undefined') return;
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(size, size);
    const k = 0.5;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x / (size - 1)) * 2 - 1;
        const v = (y / (size - 1)) * 2 - 1;
        const r2 = u * u + v * v;
        const i = (y * size + x) * 4;
        img.data[i]     = Math.max(0, Math.min(255, Math.round(128 - u * k * r2 * 128)));
        img.data[i + 1] = Math.max(0, Math.min(255, Math.round(128 + v * k * r2 * 128)));
        img.data[i + 2] = 128;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    barrelMapUri = canvas.toDataURL();
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
        {appState.crtEnabled ? `--crt-curve: ${appState.crtCurvature}; --crt-flicker-speed: ${Math.max(0.05, 0.2 - appState.crtFlicker * 0.0015)}s; --crt-flicker-opacity: ${1 - appState.crtFlicker * 0.003};` : ''}{appState.crtEnabled && appState.crtCurvature > 0 && barrelMapUri ? ' filter: url(#crt-barrel);' : ''}"
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
      {#if appState.crtEnabled && appState.crtCurvature > 0 && barrelMapUri}
      <svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <filter id="crt-barrel" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
          <feImage href={barrelMapUri} result="barrelMap" preserveAspectRatio="none" />
          <feDisplacementMap in="SourceGraphic" in2="barrelMap"
                             scale={appState.crtCurvature * 0.8}
                             xChannelSelector="R" yChannelSelector="G" />
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
