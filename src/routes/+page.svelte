<script lang="ts">
  import AsciiPreview from '$lib/components/AsciiPreview.svelte';
  import DoomHud from '$lib/components/DoomHud.svelte';
  import FloatingExportBar from '$lib/components/FloatingExportBar.svelte';
  import FontSelector from '$lib/components/FontSelector.svelte';
  import PaletteSelector from '$lib/components/PaletteSelector.svelte';
  import EffectControls from '$lib/components/EffectControls.svelte';
  import ExportBar from '$lib/components/ExportBar.svelte';
  import { appState } from '$lib/stores/state.svelte';
  import type { ColoredLine } from '$lib/engine/colorizer';

  let previewComponent: AsciiPreview;
  let previewElement: HTMLElement | null = $state(null);
  let asciiLines: string[] = $state([]);
  let exportColoredLines: ColoredLine[] = $state([]);
  let dimensions = $state({ width: 0, height: 0 });
  let styleOpen = $state(false);

  // Debounced sync — avoid re-evaluating getters on every micro-change
  let syncRaf = 0;
  $effect(() => {
    if (previewComponent) {
      // Touch reactive deps so Svelte tracks them
      void appState.text;
      void appState.fontId;
      void appState.paletteId;

      cancelAnimationFrame(syncRaf);
      syncRaf = requestAnimationFrame(() => {
        if (!previewComponent) return;
        previewElement = previewComponent.getPreviewElement();
        asciiLines = previewComponent.getAsciiLines();
        exportColoredLines = previewComponent.getColoredLines();
        dimensions = previewComponent.getDimensions();
      });
    }
  });

  const filename = $derived(appState.text.toLowerCase().replace(/\s+/g, '-') || 'doomgen');
</script>

<svelte:head>
  <title>DOOMGEN — ASCII Art Logo Generator</title>
  <meta name="description" content="Generate DOOM-styled ASCII art logos with color gradients, glow effects, and multiple export formats." />
</svelte:head>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">

  <!-- Header -->
  <header data-anim="header" class="flex items-center justify-between">
    <h1
      class="doom-glow doom-glow-pulse text-3xl font-bold tracking-wider sm:text-4xl md:text-5xl"
      style="font-family: var(--font-doom-title); color: var(--color-doom-glow);"
    >
      DOOMGEN
    </h1>
    <a
      href="https://github.com/rmarnold/doomgen"
      target="_blank"
      rel="noopener noreferrer"
      class="text-doom-text-muted transition-colors hover:text-doom-glow"
      aria-label="View on GitHub"
    >
      <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    </a>
  </header>

  <!-- INPUT Section -->
  <section data-anim="input" class="metal-panel relative z-20 p-4">
    <h2 class="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">Input</h2>
    <div class="space-y-3">
      <input
        type="text"
        bind:value={appState.text}
        placeholder="Enter text..."
        maxlength="30"
        class="doom-input w-full text-lg"
      />
      <div class="flex gap-3">
        <div class="flex-1">
          <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.2em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">Font</span>
          <FontSelector />
        </div>
        <div class="w-32 shrink-0">
          <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.2em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">Layout</span>
          <select
            bind:value={appState.layout}
            class="doom-select w-full"
          >
            <option value="default">Default</option>
            <option value="full">Full</option>
            <option value="fitted">Fitted</option>
          </select>
        </div>
      </div>
    </div>
  </section>

  <!-- STYLE Section -->
  <section data-anim="style" class="metal-panel p-4">
    <button
      class="flex w-full items-center justify-between text-[0.65rem] uppercase tracking-[0.2em] text-doom-text-muted cursor-pointer select-none"
      style="font-family: var(--font-doom-ui)"
      onclick={() => (styleOpen = !styleOpen)}
    >
      <span>Style</span>
      <svg class="h-3 w-3 transition-transform {styleOpen ? '' : '-rotate-90'}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 4.5l3 3 3-3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    {#if styleOpen}
      <div class="mt-3 space-y-4">
        <PaletteSelector />
        <EffectControls />
      </div>
    {/if}
  </section>

  <!-- PREVIEW Section -->
  <section data-anim="preview" class="relative">
    <FloatingExportBar
      {asciiLines}
      coloredLines={exportColoredLines}
      {previewElement}
      {filename}
    />
    <AsciiPreview bind:this={previewComponent} />
    <DoomHud
      fontId={appState.fontId}
      width={dimensions.width}
      height={dimensions.height}
      paletteId={appState.paletteId}
    />
  </section>

  <!-- EXPORT Section -->
  <section data-anim="export" class="metal-panel p-4">
    <h2 class="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">Export</h2>
    <ExportBar
      {asciiLines}
      coloredLines={exportColoredLines}
      {previewElement}
      {filename}
    />
  </section>

</div>
