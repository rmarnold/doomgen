<script lang="ts">
import { DOOM_FONTS } from '$lib/theme/fonts';
import { DOOM_PALETTES } from '$lib/theme/palettes';

interface Props {
  fontId: string;
  width: number;
  height: number;
  paletteId: string;
}

let { fontId, width, height, paletteId }: Props = $props();

// Derive display labels from IDs
const fontLabel = $derived(DOOM_FONTS.find((f) => f.id === fontId)?.label ?? fontId);
const palette = $derived(DOOM_PALETTES.find((p) => p.id === paletteId) ?? DOOM_PALETTES[0]);
const paletteGradient = $derived(`linear-gradient(90deg, ${palette.colors.join(', ')})`);
</script>

<div
  class="flex items-center justify-between px-3 py-1.5 bg-doom-black/70 backdrop-blur-sm border-t border-doom-surface"
  style="font-family: var(--font-doom-ui)"
>
  <!-- Font Name (Left) -->
  <div class="text-[0.6rem] uppercase tracking-[0.15em] text-doom-text-muted">
    {fontLabel}
  </div>

  <!-- Dimensions (Center) -->
  <div class="text-[0.6rem] uppercase tracking-[0.15em] text-doom-red font-mono">
    {width}×{height}
  </div>

  <!-- Palette (Right) -->
  <div class="flex items-center gap-2">
    <div
      class="w-8 h-2 rounded-sm"
      style="background: {paletteGradient}"
      aria-label="Palette preview"
    ></div>
    <div class="text-[0.6rem] uppercase tracking-[0.15em] text-doom-text-muted">
      {palette.label}
    </div>
  </div>
</div>
