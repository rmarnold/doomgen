<script lang="ts">
  import AsciiPreview from '$lib/components/AsciiPreview.svelte';
  import DoomHud from '$lib/components/DoomHud.svelte';
  import FloatingExportBar from '$lib/components/FloatingExportBar.svelte';
  import FontSelector from '$lib/components/FontSelector.svelte';
  import PaletteSelector from '$lib/components/PaletteSelector.svelte';
  import EffectControls from '$lib/components/EffectControls.svelte';
  import ExportBar from '$lib/components/ExportBar.svelte';
  import { appState } from '$lib/stores/state.svelte';
  import type { GradientDirection } from '$lib/stores/state.svelte';
  import type { ColoredLine } from '$lib/engine/colorizer';

  const directions: { value: GradientDirection; label: string; tip: string }[] = [
    { value: 'none', label: '\u2014', tip: 'No gradient — single color per character' },
    { value: 'horizontal', label: 'H', tip: 'Horizontal gradient — colors flow left to right' },
    { value: 'vertical', label: 'V', tip: 'Vertical gradient — colors flow top to bottom' },
    { value: 'diagonal', label: 'D', tip: 'Diagonal gradient — colors flow corner to corner' },
    { value: 'radial', label: 'R', tip: 'Radial gradient — colors radiate from center' },
  ];

  function throttledSlider(setter: (v: number) => void) {
    let rafId = 0;
    return (e: Event) => {
      const val = Number((e.target as HTMLInputElement).value);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setter(val));
    };
  }

  const onZoom = throttledSlider((v) => (appState.zoom = v));
  const onPaletteStart = throttledSlider((v) => (appState.paletteStart = v));
  const onPaletteEnd = throttledSlider((v) => (appState.paletteEnd = v));

  let previewComponent: AsciiPreview;
  let previewElement: HTMLElement | null = $state(null);
  let dimensions = $state({ width: 0, height: 0 });
  let styleOpen = $state(false);

  // Live getters — read fresh data from preview at export time (avoids stale timing bugs)
  function getAsciiLines(): string[] {
    return previewComponent?.getAsciiLines() ?? [];
  }
  function getColoredLines(): ColoredLine[] {
    return previewComponent?.getColoredLines() ?? [];
  }

  // Sync only the DOM ref + dimensions for UI display (not export data)
  let syncRaf = 0;
  $effect(() => {
    if (previewComponent) {
      void appState.text;
      void appState.fontId;
      void appState.paletteId;

      cancelAnimationFrame(syncRaf);
      syncRaf = requestAnimationFrame(() => {
        if (!previewComponent) return;
        previewElement = previewComponent.getPreviewElement();
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
        title="Text to render as ASCII art (max 30 characters)"
      />
      <div class="flex gap-3">
        <div class="flex-1">
          <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.2em] text-doom-text-muted" style="font-family: var(--font-doom-ui)" title="Figlet font used to generate the ASCII art characters">Font</span>
          <FontSelector />
        </div>
        <div class="w-32 shrink-0">
          <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.2em] text-doom-text-muted" style="font-family: var(--font-doom-ui)" title="How Figlet arranges characters — Default uses font spacing, Full adds extra space, Fitted removes gaps">Layout</span>
          <select
            bind:value={appState.layout}
            class="doom-select w-full"
            title="Character spacing mode"
          >
            <option value="default" title="Use the font's built-in spacing">Default</option>
            <option value="full" title="Maximum character width with extra spacing">Full</option>
            <option value="fitted" title="Remove horizontal gaps between characters">Fitted</option>
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
      <div class="mt-3 space-y-2">
        <!-- Row 1: Palette + Background -->
        <div class="flex items-start gap-4">
          <div class="min-w-0 flex-1">
            <PaletteSelector />
          </div>
          <div class="shrink-0">
            <span class="mb-0.5 block text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)" title="Background color behind the ASCII art">Background</span>
            <div class="flex items-center gap-1.5">
              <input
                type="color"
                value={appState.bgColor}
                oninput={(e) => (appState.bgColor = (e.target as HTMLInputElement).value)}
                disabled={appState.transparentBg}
                class="doom-color-picker h-6 w-8 cursor-pointer rounded border border-doom-surface bg-doom-black p-0.5 {appState.transparentBg ? 'opacity-40' : ''}"
                title="Pick a background color"
              />
              <span class="font-mono text-[0.6rem] text-doom-text-muted {appState.transparentBg ? 'opacity-40' : ''}">{appState.bgColor}</span>
              <label class="flex items-center gap-1 text-[0.55rem] font-mono text-doom-text-muted cursor-pointer select-none" title="Transparent background for PNG/WebP exports">
                <input type="checkbox" bind:checked={appState.transparentBg} class="accent-doom-red w-3 h-3 cursor-pointer" />
                Clear
              </label>
            </div>
          </div>
        </div>

        <!-- Row 2: Gradient + Zoom -->
        <div class="flex items-start gap-4 border-t border-doom-surface/30 pt-2">
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex items-center gap-3">
              <div class="flex gap-1" title="How the palette colors are spread across your ASCII art">
                {#each directions as dir}
                  <button
                    class="doom-btn text-xs {appState.gradientDirection === dir.value ? 'active' : ''}"
                    onclick={() => (appState.gradientDirection = dir.value)}
                    title={dir.tip}
                  >
                    {dir.label}
                  </button>
                {/each}
              </div>
              <label class="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted cursor-pointer select-none" style="font-family: var(--font-doom-ui)" title="Equalize perceived brightness across all palette colors">
                <input type="checkbox" checked={appState.normalizeBrightness} onchange={() => (appState.normalizeBrightness = !appState.normalizeBrightness)} class="accent-doom-red w-3 h-3 cursor-pointer" />
                Even
              </label>
              <label class="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted cursor-pointer select-none" style="font-family: var(--font-doom-ui)" title="Filter out near-black colors from the palette">
                <input type="checkbox" checked={appState.removeBlack} onchange={() => (appState.removeBlack = !appState.removeBlack)} class="accent-doom-red w-3 h-3 cursor-pointer" />
                No Black
              </label>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <label class="block" title="Start position within the palette gradient — skip early colors">
                <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
                  <span>Range Start</span>
                  <span class="font-mono normal-case tracking-normal">{appState.paletteStart}%</span>
                </span>
                <input type="range" min="0" max="100" step="5" value={appState.paletteStart} oninput={onPaletteStart} />
              </label>
              <label class="block" title="End position within the palette gradient — cut off later colors">
                <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
                  <span>Range End</span>
                  <span class="font-mono normal-case tracking-normal">{appState.paletteEnd}%</span>
                </span>
                <input type="range" min="0" max="100" step="5" value={appState.paletteEnd} oninput={onPaletteEnd} />
              </label>
            </div>
          </div>
          <div class="w-36 shrink-0" title="Scale the preview text — 0 = auto-fit to container width">
            <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
              <span>Zoom</span>
              <span class="flex items-center gap-1 font-mono normal-case tracking-normal">
                {appState.zoom === 0 ? 'Auto' : `${appState.zoom}%`}
                {#if appState.zoom > 0}
                  <button
                    class="inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[0.55rem] leading-none border border-doom-surface text-doom-text-muted hover:border-doom-red hover:text-doom-text"
                    onclick={() => (appState.zoom = 0)}
                    title="Reset to Auto"
                  >&times;</button>
                {/if}
              </span>
            </span>
            <input type="range" min="0" max="400" step="25" value={appState.zoom} oninput={onZoom} />
          </div>
        </div>

        <!-- Effects + CRT -->
        <div class="border-t border-doom-surface/30 pt-2">
          <EffectControls />
        </div>
      </div>
    {/if}
  </section>

  <!-- PREVIEW Section -->
  <section data-anim="preview" class="relative">
    <FloatingExportBar
      {getAsciiLines}
      {getColoredLines}
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
      {getAsciiLines}
      {getColoredLines}
      {previewElement}
      {filename}
    />
  </section>

</div>

<!-- Floating GitHub Link -->
<a
  href="https://github.com/rmarnold/doomgen"
  target="_blank"
  rel="noopener noreferrer"
  class="fixed bottom-4 right-4 z-50 text-doom-text-muted transition-colors hover:text-doom-glow"
  aria-label="View on GitHub"
>
  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
</a>
