<script lang="ts">
  import AsciiPreview from '$lib/components/AsciiPreview.svelte';
  import ControlPanel from '$lib/components/ControlPanel.svelte';
  import DoomHud from '$lib/components/DoomHud.svelte';
  import FloatingExportBar from '$lib/components/FloatingExportBar.svelte';
  import { appState } from '$lib/stores/state.svelte';
  import type { ColoredLine } from '$lib/engine/colorizer';

  let previewComponent: AsciiPreview;
  let previewElement: HTMLElement | null = $state(null);
  let asciiLines: string[] = $state([]);
  let exportColoredLines: ColoredLine[] = $state([]);
  let dimensions = $state({ width: 0, height: 0 });

  // Mobile sidebar toggle
  let sidebarOpen = $state(false);

  $effect(() => {
    if (previewComponent) {
      previewElement = previewComponent.getPreviewElement();
      asciiLines = previewComponent.getAsciiLines();
      exportColoredLines = previewComponent.getColoredLines();
      dimensions = previewComponent.getDimensions();
    }
  });
</script>

<svelte:head>
  <title>DOOMGEN — ASCII Art Logo Generator</title>
  <meta name="description" content="Generate DOOM-styled ASCII art logos with color gradients, glow effects, and multiple export formats." />
</svelte:head>

<div class="flex h-full flex-col">

  <!-- Header -->
  <header data-anim="header" class="flex items-center justify-between px-4 py-3 sm:px-6">
    <h1
      class="doom-glow doom-glow-pulse text-3xl font-bold tracking-wider sm:text-4xl md:text-5xl"
      style="font-family: var(--font-doom-title); color: var(--color-doom-glow);"
    >
      DOOMGEN
    </h1>
    <div class="flex items-center gap-3">
      <!-- Mobile sidebar toggle -->
      <button
        class="doom-btn p-1.5 sm:hidden"
        onclick={() => (sidebarOpen = !sidebarOpen)}
        aria-label="Toggle controls"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
          {#if sidebarOpen}
            <path d="M5 5l10 10M15 5L5 15" />
          {:else}
            <path d="M3 5h14M3 10h14M3 15h14" />
          {/if}
        </svg>
      </button>
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
    </div>
  </header>

  <!-- Main Content: Hero Preview + Sidebar -->
  <div class="flex min-h-0 flex-1 gap-4 px-4 pb-4 sm:px-6 sm:pb-6">

    <!-- Hero Preview Area -->
    <main data-anim="preview" class="relative flex min-w-0 flex-1 flex-col">
      <!-- Floating Export Bar (desktop) -->
      <FloatingExportBar
        {asciiLines}
        coloredLines={exportColoredLines}
        {previewElement}
        filename={appState.text.toLowerCase().replace(/\s+/g, '-') || 'doomgen'}
      />

      <!-- Preview -->
      <div class="flex-1 overflow-hidden">
        <AsciiPreview bind:this={previewComponent} />
      </div>

      <!-- DOOM HUD Status Bar -->
      <DoomHud
        fontId={appState.fontId}
        width={dimensions.width}
        height={dimensions.height}
        paletteId={appState.paletteId}
      />
    </main>

    <!-- Desktop Sidebar -->
    <aside data-anim="sidebar" class="hidden w-72 shrink-0 overflow-y-auto sm:block lg:w-80">
      <ControlPanel
        {asciiLines}
        coloredLines={exportColoredLines}
        {previewElement}
        filename={appState.text.toLowerCase().replace(/\s+/g, '-') || 'doomgen'}
      />
    </aside>

  </div>

  <!-- Mobile Bottom Drawer -->
  {#if sidebarOpen}
    <!-- Backdrop -->
    <button
      class="fixed inset-0 z-40 bg-black/60 sm:hidden"
      onclick={() => (sidebarOpen = false)}
      aria-label="Close controls"
    ></button>

    <!-- Drawer -->
    <div class="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-xl sm:hidden">
      <div class="p-4">
        <ControlPanel
          {asciiLines}
          coloredLines={exportColoredLines}
          {previewElement}
          filename={appState.text.toLowerCase().replace(/\s+/g, '-') || 'doomgen'}
        />
      </div>
    </div>
  {/if}

</div>
