<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import type { GradientDirection } from '$lib/stores/state.svelte';

  const directions: { value: GradientDirection; label: string }[] = [
    { value: 'horizontal', label: 'H' },
    { value: 'vertical', label: 'V' },
    { value: 'diagonal', label: 'D' },
    { value: 'radial', label: 'R' },
  ];
</script>

<div class="space-y-4">
  <!-- Gradient Direction -->
  <div>
    <span class="mb-1 block text-sm text-doom-text-muted">Direction</span>
    <div class="flex gap-2">
      {#each directions as dir}
        <button
          class="rounded border px-3 py-1 text-sm font-mono transition-colors {appState.gradientDirection === dir.value
            ? 'border-doom-red bg-doom-surface text-doom-text'
            : 'border-doom-surface bg-doom-black text-doom-text-muted hover:border-doom-red/50'}"
          onclick={() => (appState.gradientDirection = dir.value)}
        >
          {dir.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Glow -->
  <label class="block">
    <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
      <span>Glow</span>
      <span>{appState.glowIntensity}%</span>
    </span>
    <input type="range" min="0" max="100" bind:value={appState.glowIntensity} class="w-full accent-doom-red" />
  </label>

  <!-- Drip -->
  <label class="block">
    <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
      <span>Drip</span>
      <span>{appState.dripDensity}%</span>
    </span>
    <input type="range" min="0" max="100" bind:value={appState.dripDensity} class="w-full accent-doom-red" />
  </label>

  <!-- Shadow -->
  <label class="block">
    <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
      <span>Shadow</span>
      <span>{appState.shadowOffset}px</span>
    </span>
    <input type="range" min="0" max="6" bind:value={appState.shadowOffset} class="w-full accent-doom-red" />
  </label>

  <!-- Distress -->
  <label class="block">
    <span class="mb-1 flex justify-between text-sm text-doom-text-muted">
      <span>Distress</span>
      <span>{appState.distressIntensity}%</span>
    </span>
    <input type="range" min="0" max="50" bind:value={appState.distressIntensity} class="w-full accent-doom-red" />
  </label>
</div>
