<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';
  import type { GradientDirection } from '$lib/stores/state.svelte';

  const directions: { value: GradientDirection; label: string; tip: string }[] = [
    { value: 'none', label: '\u2014', tip: 'No gradient — single color per character' },
    { value: 'horizontal', label: 'H', tip: 'Horizontal gradient — colors flow left to right' },
    { value: 'vertical', label: 'V', tip: 'Vertical gradient — colors flow top to bottom' },
    { value: 'diagonal', label: 'D', tip: 'Diagonal gradient — colors flow corner to corner' },
    { value: 'radial', label: 'R', tip: 'Radial gradient — colors radiate from center' },
  ];

  // rAF-throttled slider updater to avoid per-pixel re-render storms
  function throttledSlider(setter: (v: number) => void) {
    let rafId = 0;
    return (e: Event) => {
      const val = Number((e.target as HTMLInputElement).value);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setter(val));
    };
  }

  const onGlow = throttledSlider((v) => (appState.glowIntensity = v));
  const onDrip = throttledSlider((v) => (appState.dripDensity = v));
  const onShadow = throttledSlider((v) => (appState.shadowOffset = v));
  const onDistress = throttledSlider((v) => (appState.distressIntensity = v));
  const onPixelation = throttledSlider((v) => (appState.pixelation = v));
  const onCrtCurvature = throttledSlider((v) => (appState.crtCurvature = v));
  const onCrtFlicker = throttledSlider((v) => (appState.crtFlicker = v));
  const onCrtPowerLoss = throttledSlider((v) => (appState.crtPowerLoss = v));
  const onCrtScreenBlip = throttledSlider((v) => (appState.crtScreenBlip = v));
  const onColorShift = throttledSlider((v) => (appState.colorShiftSpeed = v));
  const onScreenShake = throttledSlider((v) => (appState.screenShake = v));
  const onZoom = throttledSlider((v) => (appState.zoom = v));
  const onPaletteStart = throttledSlider((v) => (appState.paletteStart = v));
  const onPaletteEnd = throttledSlider((v) => (appState.paletteEnd = v));
</script>

<div class="space-y-3">
  <!-- GRADIENT Section -->
  <details open class="group">
    <summary class="flex items-center gap-1.5 cursor-pointer select-none list-none mb-2 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
      <svg class="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="currentColor">
        <path d="M4 2l5 4-5 4z"/>
      </svg>
      Gradient
    </summary>
    <div class="space-y-3">
      <!-- Gradient Direction -->
      <div>
        <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)" title="How the palette colors are spread across your ASCII art">Direction</span>
        <div class="flex gap-1.5">
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
      </div>

      <!-- Normalize Brightness -->
      <label class="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted cursor-pointer select-none" style="font-family: var(--font-doom-ui)" title="Equalize perceived brightness across all palette colors so no character appears too dark or too bright">
        <input
          type="checkbox"
          checked={appState.normalizeBrightness}
          onchange={() => (appState.normalizeBrightness = !appState.normalizeBrightness)}
          class="accent-doom-red w-3.5 h-3.5 cursor-pointer"
        />
        Even Brightness
      </label>

      <!-- Remove Black -->
      <label class="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted cursor-pointer select-none" style="font-family: var(--font-doom-ui)" title="Filter out near-black colors from the palette so characters remain visible against dark backgrounds">
        <input
          type="checkbox"
          checked={appState.removeBlack}
          onchange={() => (appState.removeBlack = !appState.removeBlack)}
          class="accent-doom-red w-3.5 h-3.5 cursor-pointer"
        />
        Remove Black
      </label>

      <!-- Palette Range -->
      <div class="grid grid-cols-2 gap-3">
        <label class="block" title="Start position within the palette gradient — skip early colors">
          <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
            <span>Range Start</span>
            <span class="font-mono normal-case tracking-normal">{appState.paletteStart}%</span>
          </span>
          <input type="range" min="0" max="100" step="5" value={appState.paletteStart} oninput={onPaletteStart} />
        </label>
        <label class="block" title="End position within the palette gradient — cut off later colors">
          <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
            <span>Range End</span>
            <span class="font-mono normal-case tracking-normal">{appState.paletteEnd}%</span>
          </span>
          <input type="range" min="0" max="100" step="5" value={appState.paletteEnd} oninput={onPaletteEnd} />
        </label>
      </div>
    </div>
  </details>

  <!-- VIEW Section -->
  <details open class="group border-t border-doom-surface/30 pt-3 mt-1">
    <summary class="flex items-center gap-1.5 cursor-pointer select-none list-none mb-2 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
      <svg class="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="currentColor">
        <path d="M4 2l5 4-5 4z"/>
      </svg>
      View
    </summary>
    <div class="space-y-3">
      <!-- Zoom -->
      <div title="Scale the preview text — 0 = auto-fit to container width">
        <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Zoom</span>
          <span class="flex items-center gap-1.5 font-mono normal-case tracking-normal">
            {appState.zoom === 0 ? 'Auto' : `${appState.zoom}%`}
            {#if appState.zoom > 0}
              <button
                class="inline-flex items-center justify-center w-4 h-4 rounded text-[0.6rem] leading-none border border-doom-surface text-doom-text-muted hover:border-doom-red hover:text-doom-text"
                onclick={() => (appState.zoom = 0)}
                title="Reset to Auto"
              >&times;</button>
            {/if}
          </span>
        </span>
        <input type="range" min="0" max="400" step="25" value={appState.zoom} oninput={onZoom} />
      </div>

      <!-- Background Color -->
      <div>
        <span class="mb-1 block text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)" title="Background color behind the ASCII art — used in preview and exports">Background</span>
        <div class="flex items-center gap-2">
          <input
            type="color"
            value={appState.bgColor}
            oninput={(e) => (appState.bgColor = (e.target as HTMLInputElement).value)}
            disabled={appState.transparentBg}
            class="doom-color-picker h-7 w-10 cursor-pointer rounded border border-doom-surface bg-doom-black p-0.5 {appState.transparentBg ? 'opacity-40' : ''}"
            title="Pick a background color"
          />
          <span class="font-mono text-xs text-doom-text-muted {appState.transparentBg ? 'opacity-40' : ''}">{appState.bgColor}</span>
          <label class="flex items-center gap-1.5 text-xs font-mono text-doom-text-muted cursor-pointer select-none ml-1" title="Remove the background color — exported images will have a transparent background (PNG, WebP)">
            <input
              type="checkbox"
              bind:checked={appState.transparentBg}
              class="accent-doom-red w-3.5 h-3.5 cursor-pointer"
            />
            Transparent
          </label>
        </div>
      </div>
    </div>
  </details>

  <!-- EFFECTS Section -->
  <details open class="group border-t border-doom-surface/30 pt-3 mt-1">
    <summary class="flex items-center gap-1.5 cursor-pointer select-none list-none mb-2 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
      <svg class="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="currentColor">
        <path d="M4 2l5 4-5 4z"/>
      </svg>
      Effects
    </summary>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <!-- Glow -->
      <label class="block" title="Colored glow bloom around each character — higher values create a neon effect">
        <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Glow</span>
          <span class="font-mono normal-case tracking-normal">{appState.glowIntensity}%</span>
        </span>
        <input type="range" min="0" max="100" value={appState.glowIntensity} oninput={onGlow} />
      </label>

      <!-- Drip -->
      <label class="block" title="Dripping characters below the text — simulates melting or bleeding effect">
        <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Drip</span>
          <span class="font-mono normal-case tracking-normal">{appState.dripDensity}%</span>
        </span>
        <input type="range" min="0" max="100" value={appState.dripDensity} oninput={onDrip} />
      </label>

      <!-- Shadow -->
      <label class="block" title="Drop shadow offset in pixels — adds depth behind the text">
        <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Shadow</span>
          <span class="font-mono normal-case tracking-normal">{appState.shadowOffset}px</span>
        </span>
        <input type="range" min="0" max="6" value={appState.shadowOffset} oninput={onShadow} />
      </label>

      <!-- Distress -->
      <label class="block" title="Randomly remove characters to create a worn, damaged look">
        <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Distress</span>
          <span class="font-mono normal-case tracking-normal">{appState.distressIntensity}%</span>
        </span>
        <input type="range" min="0" max="50" value={appState.distressIntensity} oninput={onDistress} />
      </label>

      <!-- Pixelation -->
      <label class="block" title="Apply a pixelation filter — higher values create a more blocky, retro look">
        <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Pixelation</span>
          <span class="font-mono normal-case tracking-normal">{appState.pixelation === 0 ? 'Off' : appState.pixelation}</span>
        </span>
        <input type="range" min="0" max="10" value={appState.pixelation} oninput={onPixelation} />
      </label>

      <!-- Color Shift -->
      <label class="block" title="Continuously cycle through hue rotation — creates an animated rainbow effect. Use Animated WebP, SVG, or HTML to export">
        <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Color Shift</span>
          <span class="font-mono normal-case tracking-normal">{appState.colorShiftSpeed === 0 ? 'Off' : `${appState.colorShiftSpeed}%`}</span>
        </span>
        <input type="range" min="0" max="100" value={appState.colorShiftSpeed} oninput={onColorShift} />
      </label>

      <!-- Screen Shake -->
      <label class="block" title="Randomly shake the preview at an interval — higher values shake more frequently and intensely">
        <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Screen Shake</span>
          <span class="font-mono normal-case tracking-normal">{appState.screenShake === 0 ? 'Off' : `${appState.screenShake}%`}</span>
        </span>
        <input type="range" min="0" max="100" value={appState.screenShake} oninput={onScreenShake} />
      </label>
    </div>
  </details>

  <!-- CRT MONITOR Section -->
  <details open class="group border-t border-doom-surface/30 pt-3 mt-1">
    <summary class="flex items-center gap-1.5 cursor-pointer select-none list-none mb-2 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
      <svg class="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="currentColor">
        <path d="M4 2l5 4-5 4z"/>
      </svg>
      CRT Monitor
    </summary>
    <div class="space-y-3">
      <label class="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted cursor-pointer select-none" style="font-family: var(--font-doom-ui)" title="Simulate a CRT monitor with scanlines, phosphor glow, and screen curvature">
        <input
          type="checkbox"
          checked={appState.crtEnabled}
          onchange={() => (appState.crtEnabled = !appState.crtEnabled)}
          class="accent-doom-red w-3.5 h-3.5 cursor-pointer"
        />
        CRT Monitor
      </label>
      {#if appState.crtEnabled}
        <div class="grid grid-cols-2 gap-3">
          <label class="block" title="Barrel distortion of the screen edges — simulates a curved CRT glass">
            <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
              <span>Curvature</span>
              <span class="font-mono normal-case tracking-normal">{appState.crtCurvature}%</span>
            </span>
            <input type="range" min="0" max="100" value={appState.crtCurvature} oninput={onCrtCurvature} />
          </label>
          <label class="block" title="Screen brightness flicker — simulates an unstable CRT signal. Use Animated WebP, SVG, or HTML to export">
            <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
              <span>Flicker</span>
              <span class="font-mono normal-case tracking-normal">{appState.crtFlicker}%</span>
            </span>
            <input type="range" min="0" max="100" value={appState.crtFlicker} oninput={onCrtFlicker} />
          </label>
          <label class="block" title="Randomly simulate CRT power loss — the screen collapses into a zigzag line and powers back on. Higher values trigger more frequently">
            <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
              <span>Power Loss</span>
              <span class="font-mono normal-case tracking-normal">{appState.crtPowerLoss === 0 ? 'Off' : `${appState.crtPowerLoss}%`}</span>
            </span>
            <input type="range" min="0" max="100" value={appState.crtPowerLoss} oninput={onCrtPowerLoss} />
          </label>
          <label class="block" title="Random horizontal screen shift with brightness flash — simulates a CRT signal glitch or interference">
            <span class="mb-0.5 flex justify-between text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
              <span>Screen Blip</span>
              <span class="font-mono normal-case tracking-normal">{appState.crtScreenBlip === 0 ? 'Off' : `${appState.crtScreenBlip}%`}</span>
            </span>
            <input type="range" min="0" max="100" value={appState.crtScreenBlip} oninput={onCrtScreenBlip} />
          </label>
        </div>
      {/if}
    </div>
  </details>
</div>
