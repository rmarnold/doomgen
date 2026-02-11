<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import type { GradientDirection } from '$lib/stores/state.svelte';

  const directions: { value: GradientDirection; label: string }[] = [
    { value: 'none', label: '\u2014' },
    { value: 'horizontal', label: 'H' },
    { value: 'vertical', label: 'V' },
    { value: 'diagonal', label: 'D' },
    { value: 'radial', label: 'R' },
  ];

  // rAF-throttled slider updater to avoid per-pixel re-render storms
  function throttledSlider(setter: (v: number) => void) {
    let rafId = 0;
    return (e: Event) => {
      const val = Number((e.target as HTMLInputElement).value);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setter(val));
    };
  }

  const onGlow = throttledSlider((v) => (appState.glowIntensity = v));
  const onDrip = throttledSlider((v) => (appState.dripDensity = v));
  const onShadow = throttledSlider((v) => (appState.shadowOffset = v));
  const onDistress = throttledSlider((v) => (appState.distressIntensity = v));
  const onZoom = throttledSlider((v) => (appState.zoom = v));
  const onPaletteStart = throttledSlider((v) => (appState.paletteStart = v));
  const onPaletteEnd = throttledSlider((v) => (appState.paletteEnd = v));
</script>

<div class="space-y-3">
  <!-- Gradient Direction -->
  <div>
    <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">Direction</span>
    <div class="flex gap-1.5">
      {#each directions as dir}
        <button
          class="doom-btn text-xs {appState.gradientDirection === dir.value ? 'active' : ''}"
          onclick={() => (appState.gradientDirection = dir.value)}
        >
          {dir.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Normalize Brightness -->
  <label class="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted cursor-pointer select-none" style="font-family: var(--font-doom-ui)">
    <input
      type="checkbox"
      checked={appState.normalizeBrightness}
      onchange={() => (appState.normalizeBrightness = !appState.normalizeBrightness)}
      class="accent-doom-red w-3.5 h-3.5 cursor-pointer"
    />
    Even Brightness
  </label>

  <!-- Palette Range -->
  <div class="grid grid-cols-2 gap-3">
    <label class="block">
      <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
        <span>Range Start</span>
        <span class="font-mono normal-case tracking-normal">{appState.paletteStart}%</span>
      </span>
      <input type="range" min="0" max="100" step="5" value={appState.paletteStart} oninput={onPaletteStart} />
    </label>
    <label class="block">
      <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
        <span>Range End</span>
        <span class="font-mono normal-case tracking-normal">{appState.paletteEnd}%</span>
      </span>
      <input type="range" min="0" max="100" step="5" value={appState.paletteEnd} oninput={onPaletteEnd} />
    </label>
  </div>

  <!-- Zoom -->
  <div>
    <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
      <span>Zoom</span>
      <span class="flex items-center gap-1.5 font-mono normal-case tracking-normal">
        {appState.zoom === 0 ? 'Auto' : `${appState.zoom}%`}
        {#if appState.zoom > 0}
          <button
            class="inline-flex items-center justify-center w-4 h-4 rounded text-[0.6rem] leading-none border border-doom-surface text-doom-text-muted hover:border-doom-red hover:text-doom-text"
            onclick={() => (appState.zoom = 0)}
            title="Reset to Auto"
          >&times;</button>
        {/if}
      </span>
    </span>
    <input type="range" min="0" max="400" step="25" value={appState.zoom} oninput={onZoom} />
  </div>

  <!-- Background Color -->
  <div>
    <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">Background</span>
    <div class="flex items-center gap-2">
      <input
        type="color"
        value={appState.bgColor}
        oninput={(e) => (appState.bgColor = (e.target as HTMLInputElement).value)}
        class="doom-color-picker h-7 w-10 cursor-pointer rounded border border-doom-surface bg-doom-black p-0.5"
      />
      <span class="font-mono text-xs text-doom-text-muted">{appState.bgColor}</span>
    </div>
  </div>

  <!-- Sliders Grid -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <!-- Glow -->
    <label class="block">
      <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
        <span>Glow</span>
        <span class="font-mono normal-case tracking-normal">{appState.glowIntensity}%</span>
      </span>
      <input type="range" min="0" max="100" value={appState.glowIntensity} oninput={onGlow} />
    </label>

    <!-- Drip -->
    <label class="block">
      <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
        <span>Drip</span>
        <span class="font-mono normal-case tracking-normal">{appState.dripDensity}%</span>
      </span>
      <input type="range" min="0" max="100" value={appState.dripDensity} oninput={onDrip} />
    </label>

    <!-- Shadow -->
    <label class="block">
      <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
        <span>Shadow</span>
        <span class="font-mono normal-case tracking-normal">{appState.shadowOffset}px</span>
      </span>
      <input type="range" min="0" max="6" value={appState.shadowOffset} oninput={onShadow} />
    </label>

    <!-- Distress -->
    <label class="block">
      <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
        <span>Distress</span>
        <span class="font-mono normal-case tracking-normal">{appState.distressIntensity}%</span>
      </span>
      <input type="range" min="0" max="50" value={appState.distressIntensity} oninput={onDistress} />
    </label>
  </div>
</div>
