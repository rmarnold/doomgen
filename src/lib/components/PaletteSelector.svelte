<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import { DOOM_PALETTES } from '$lib/theme/palettes';
</script>

<div class="space-y-2">
  <span class="mb-1 block text-sm text-doom-text-muted">Palette</span>
  <div class="grid grid-cols-2 gap-2">
    {#each DOOM_PALETTES as palette}
      <button
        class="flex items-center gap-2 rounded border px-3 py-2 text-left text-sm transition-colors {appState.paletteId === palette.id
          ? 'border-doom-red bg-doom-surface text-doom-text'
          : 'border-doom-surface bg-doom-black text-doom-text-muted hover:border-doom-red/50'}"
        onclick={() => (appState.paletteId = palette.id)}
      >
        <span
          class="inline-flex h-4 w-8 shrink-0 rounded"
          style="background: linear-gradient(90deg, {palette.colors.join(', ')});"
        ></span>
        <span class="truncate">{palette.label}</span>
      </button>
    {/each}
  </div>
</div>
