<script lang="ts">
  import { renderAscii, type RenderResult } from '$lib/engine/figlet-renderer';
  import { appState } from '$lib/stores/state.svelte';

  let asciiResult = $state<RenderResult | null>(null);
  let error = $state<string | null>(null);
  let loading = $state(false);

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout>;

  // Re-render when inputs change
  $effect(() => {
    const { text, fontId, layout } = appState;

    clearTimeout(debounceTimer);
    if (!text.trim()) {
      asciiResult = null;
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
      } finally {
        loading = false;
      }
    }, 150);
  });
</script>

<div class="scanlines relative h-full min-h-[200px] overflow-auto rounded-lg border border-doom-surface bg-doom-dark p-6">
  {#if loading}
    <p class="animate-pulse text-doom-text-muted">Rendering...</p>
  {:else if error}
    <p class="text-doom-red">{error}</p>
  {:else if asciiResult}
    <pre
      class="whitespace-pre font-mono text-xs leading-none text-doom-text sm:text-sm"
      style="text-shadow: 0 0 {appState.glowIntensity * 0.07}px var(--color-doom-glow),
                          0 0 {appState.glowIntensity * 0.2}px var(--color-doom-glow),
                          0 0 {appState.glowIntensity * 0.42}px var(--color-doom-red),
                          0 0 {appState.glowIntensity * 0.82}px var(--color-doom-red);"
    >{asciiResult.text}</pre>
  {:else}
    <p class="text-doom-text-muted">Type something to generate ASCII art...</p>
  {/if}
</div>
