<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import { DOOM_FONTS, FONT_CATEGORIES } from '$lib/theme/fonts';
  import type { FontCategory } from '$lib/theme/fonts';

  // Component state
  let isOpen = $state(false);
  let searchQuery = $state('');
  let dropdownElement = $state<HTMLDivElement | null>(null);
  let triggerElement = $state<HTMLButtonElement | null>(null);

  // Get the currently selected font
  const selectedFont = $derived(
    DOOM_FONTS.find(f => f.id === appState.fontId) || DOOM_FONTS[0]
  );

  // Filter fonts based on search query
  const filteredFonts = $derived(
    searchQuery.trim() === ''
      ? DOOM_FONTS
      : DOOM_FONTS.filter(font =>
          font.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
  );

  // Group filtered fonts by category
  const fontsByCategory = $derived(
    FONT_CATEGORIES.map(category => ({
      ...category,
      fonts: filteredFonts.filter(font => font.category === category.id)
    })).filter(category => category.fonts.length > 0)
  );

  // Handle font selection
  function selectFont(fontId: string) {
    appState.fontId = fontId;
    isOpen = false;
    searchQuery = '';
  }

  // Toggle dropdown
  function toggleDropdown() {
    isOpen = !isOpen;
    if (!isOpen) {
      searchQuery = '';
    }
  }

  // Close dropdown
  function closeDropdown() {
    isOpen = false;
    searchQuery = '';
  }

  // Handle click outside
  function handleClickOutside(event: MouseEvent) {
    if (!isOpen) return;

    const target = event.target as Node;
    if (
      dropdownElement &&
      triggerElement &&
      !dropdownElement.contains(target) &&
      !triggerElement.contains(target)
    ) {
      closeDropdown();
    }
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      closeDropdown();
    }
  }

  // Attach event listeners
  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeydown);

      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });
</script>

<div class="relative w-full">
  <!-- Trigger Button -->
  <button
    bind:this={triggerElement}
    type="button"
    class="doom-btn w-full text-left flex items-center justify-between"
    onclick={toggleDropdown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <span>{selectedFont.label}</span>
    <svg
      class="w-4 h-4 transition-transform {isOpen ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- Dropdown Panel -->
  {#if isOpen}
    <div
      bind:this={dropdownElement}
      class="absolute z-30 w-full mt-1 metal-panel max-h-64 overflow-y-auto"
      role="listbox"
    >
      <!-- Search Input -->
      <div class="sticky top-0 bg-doom-dark p-2 border-b border-doom-surface">
        <input
          type="text"
          class="doom-input w-full py-1.5 px-2 text-sm"
          placeholder="Search fonts..."
          bind:value={searchQuery}
          autofocus
        />
      </div>

      <!-- Font Categories and Items -->
      <div class="p-2">
        {#if fontsByCategory.length === 0}
          <div class="px-3 py-2 text-sm text-doom-text-muted text-center">
            No fonts found
          </div>
        {:else}
          {#each fontsByCategory as category}
            <div class="mb-4 last:mb-0">
              <!-- Category Header -->
              <div
                class="text-[0.6rem] uppercase tracking-[0.2em] text-doom-text-muted px-2 py-1 mb-1"
                style="font-family: var(--font-doom-ui)"
              >
                {category.label}
              </div>

              <!-- Font Items -->
              <div class="space-y-0.5">
                {#each category.fonts as font}
                  <button
                    type="button"
                    class="w-full px-3 py-1.5 text-sm cursor-pointer hover:bg-doom-surface text-doom-text-muted hover:text-doom-text text-left rounded transition-colors {font.id === appState.fontId ? 'text-doom-red' : ''}"
                    onclick={() => selectFont(font.id)}
                    role="option"
                    aria-selected={font.id === appState.fontId}
                  >
                    <div class="font-medium">{font.label}</div>
                    <div class="text-xs opacity-75">{font.description}</div>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Custom scrollbar for dropdown */
  div[role="listbox"] {
    scrollbar-width: thin;
    scrollbar-color: var(--color-doom-red) var(--color-doom-surface);
  }

  div[role="listbox"]::-webkit-scrollbar {
    width: 6px;
  }

  div[role="listbox"]::-webkit-scrollbar-track {
    background: var(--color-doom-surface);
  }

  div[role="listbox"]::-webkit-scrollbar-thumb {
    background: var(--color-doom-red);
    border-radius: 3px;
  }

  div[role="listbox"]::-webkit-scrollbar-thumb:hover {
    background: var(--color-doom-glow);
  }
</style>
