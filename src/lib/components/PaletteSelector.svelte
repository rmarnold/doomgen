<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import { DOOM_PALETTES } from '$lib/theme/palettes';
</script>

<div>
  <div class="flex items-center gap-2">
    {#each DOOM_PALETTES as palette}
      <button
        class="group relative h-6 w-10 shrink-0 rounded-sm transition-all {appState.paletteId === palette.id
          ? 'ring-2 ring-doom-red ring-offset-1 ring-offset-doom-black scale-110'
          : 'opacity-60 hover:opacity-100 hover:scale-105'}"
        style="background: linear-gradient(90deg, {palette.colors.join(', ')});"
        onclick={() => (appState.paletteId = palette.id)}
        title={palette.label}
      ></button>
    {/each}
  </div>
  <p class="mt-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
    {DOOM_PALETTES.find(p => p.id === appState.paletteId)?.label ?? ''}
  </p>
</div>
