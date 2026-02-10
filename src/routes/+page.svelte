<script lang="ts">
  import AsciiPreview from '$lib/components/AsciiPreview.svelte';
  import PaletteSelector from '$lib/components/PaletteSelector.svelte';
  import EffectControls from '$lib/components/EffectControls.svelte';
  import ExportBar from '$lib/components/ExportBar.svelte';
  import { appState } from '$lib/stores/state.svelte';
  import { DOOM_FONTS } from '$lib/theme/fonts';
  import type { ColoredLine } from '$lib/engine/colorizer';

  let previewComponent: AsciiPreview;
  let previewElement: HTMLElement | null = $state(null);
  let asciiLines: string[] = $state([]);
  let exportColoredLines: ColoredLine[] = $state([]);

  $effect(() => {
    if (previewComponent) {
      previewElement = previewComponent.getPreviewElement();
      asciiLines = previewComponent.getAsciiLines();
      exportColoredLines = previewComponent.getColoredLines();
    }
  });
</script>

<svelte:head>
  <title>DOOMGEN — ASCII Art Logo Generator</title>
  <meta name="description" content="Generate DOOM-styled ASCII art logos with color gradients, glow effects, and multiple export formats." />
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">

  <!-- Header -->
  <header class="flex items-center justify-between pb-6">
    <h1 class="metal-text text-4xl font-bold tracking-wider sm:text-5xl">DOOMGEN</h1>
    <a
      href="https://github.com/rmarnold/doomgen"
      target="_blank"
      rel="noopener noreferrer"
      class="text-doom-text-muted transition-colors hover:text-doom-glow"
      aria-label="View on GitHub"
    >
      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    </a>
  </header>

  <!-- Preview Area -->
  <section class="mb-6 flex-1">
    <AsciiPreview bind:this={previewComponent} />
  </section>

  <!-- Controls -->
  <section class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">

    <!-- Input Controls -->
    <div class="space-y-4 rounded-lg border border-doom-surface bg-doom-dark p-4">
      <h2 class="text-sm font-bold uppercase tracking-widest text-doom-text-muted">Input</h2>

      <label class="block">
        <span class="mb-1 block text-sm text-doom-text-muted">Text</span>
        <input
          type="text"
          bind:value={appState.text}
          placeholder="Enter text..."
          maxlength="30"
          class="w-full rounded border border-doom-surface bg-doom-black px-3 py-2 font-mono text-doom-text placeholder-doom-text-muted focus:border-doom-red focus:outline-none"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-sm text-doom-text-muted">Font</span>
        <select
          bind:value={appState.fontId}
          class="w-full rounded border border-doom-surface bg-doom-black px-3 py-2 font-mono text-doom-text focus:border-doom-red focus:outline-none"
        >
          {#each DOOM_FONTS as font}
            <option value={font.id}>{font.label} — {font.description}</option>
          {/each}
        </select>
      </label>

      <label class="block">
        <span class="mb-1 block text-sm text-doom-text-muted">Layout</span>
        <select
          bind:value={appState.layout}
          class="w-full rounded border border-doom-surface bg-doom-black px-3 py-2 font-mono text-doom-text focus:border-doom-red focus:outline-none"
        >
          <option value="default">Default</option>
          <option value="full">Full</option>
          <option value="fitted">Fitted</option>
        </select>
      </label>
    </div>

    <!-- Style Controls -->
    <div class="space-y-4 rounded-lg border border-doom-surface bg-doom-dark p-4">
      <h2 class="text-sm font-bold uppercase tracking-widest text-doom-text-muted">Style</h2>
      <PaletteSelector />
      <EffectControls />
    </div>

  </section>

  <!-- Export Bar -->
  <footer class="rounded-lg border border-doom-surface bg-doom-dark p-4">
    <ExportBar
      asciiLines={asciiLines}
      coloredLines={exportColoredLines}
      previewElement={previewElement}
      filename={appState.text.toLowerCase().replace(/\s+/g, '-') || 'doomgen'}
    />
  </footer>

</div>
