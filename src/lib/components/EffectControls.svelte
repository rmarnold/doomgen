<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import type { GradientDirection } from '$lib/stores/state.svelte';

  const directions: { value: GradientDirection; label: string }[] = [
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
