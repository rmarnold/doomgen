<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import FontSelector from '$lib/components/FontSelector.svelte';
  import PaletteSelector from '$lib/components/PaletteSelector.svelte';
  import EffectControls from '$lib/components/EffectControls.svelte';
  import ExportBar from '$lib/components/ExportBar.svelte';
  import type { ColoredLine } from '$lib/engine/colorizer';

  interface Props {
    asciiLines: string[];
    coloredLines: ColoredLine[];
    previewElement: HTMLElement | null;
    filename: string;
  }

  let { asciiLines, coloredLines, previewElement, filename }: Props = $props();

  type Tab = 'INPUT' | 'STYLE' | 'EXPORT';
  let activeTab = $state<Tab>('INPUT');
</script>

<div class="metal-panel">
  <!-- Tab Bar -->
  <div class="flex border-b border-doom-surface">
    <button
      class="doom-btn {activeTab === 'INPUT' ? 'active' : ''}"
      style="border-radius: 0; border-bottom: none; font-family: var(--font-doom-ui);"
      onclick={() => (activeTab = 'INPUT')}
    >
      INPUT
    </button>
    <button
      class="doom-btn {activeTab === 'STYLE' ? 'active' : ''}"
      style="border-radius: 0; border-bottom: none; font-family: var(--font-doom-ui);"
      onclick={() => (activeTab = 'STYLE')}
    >
      STYLE
    </button>
    <button
      class="doom-btn {activeTab === 'EXPORT' ? 'active' : ''}"
      style="border-radius: 0; border-bottom: none; font-family: var(--font-doom-ui);"
      onclick={() => (activeTab = 'EXPORT')}
    >
      EXPORT
    </button>
  </div>

  <!-- Tab Content -->
  <div class="p-4">
    {#if activeTab === 'INPUT'}
      <div class="space-y-4">
        <!-- Text Input -->
        <label class="block">
          <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.2em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">Text</span>
          <input
            type="text"
            bind:value={appState.text}
            placeholder="Enter text..."
            maxlength="30"
            class="doom-input"
          />
        </label>

        <!-- Font Selector -->
        <FontSelector />

        <!-- Layout Select -->
        <label class="block">
          <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.2em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">Layout</span>
          <select
            bind:value={appState.layout}
            class="doom-select"
          >
            <option value="default">Default</option>
            <option value="full">Full</option>
            <option value="fitted">Fitted</option>
          </select>
        </label>
      </div>
    {:else if activeTab === 'STYLE'}
      <div class="space-y-4">
        <PaletteSelector />
        <EffectControls />
      </div>
    {:else if activeTab === 'EXPORT'}
      <ExportBar
        asciiLines={asciiLines}
        coloredLines={coloredLines}
        previewElement={previewElement}
        filename={filename}
      />
    {/if}
  </div>
</div>
