<script lang="ts">
  import { appState } from '$lib/stores/state.svelte';

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
</script>

<div class="space-y-1">
  <!-- EFFECTS Section -->
  <details class="group border-t border-doom-surface/30 pt-1.5">
    <summary class="flex items-center gap-1.5 cursor-pointer select-none list-none mb-1 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
      <svg class="w-2.5 h-2.5 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="currentColor">
        <path d="M4 2l5 4-5 4z"/>
      </svg>
      Effects
    </summary>
    <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 pl-1">
      <label class="block" title="Colored glow bloom around each character — higher values create a neon effect">
        <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Glow</span>
          <span class="font-mono normal-case tracking-normal">{appState.glowIntensity}%</span>
        </span>
        <input type="range" min="0" max="100" value={appState.glowIntensity} oninput={onGlow} />
      </label>

      <label class="block" title="Dripping characters below the text — simulates melting or bleeding effect">
        <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Drip</span>
          <span class="font-mono normal-case tracking-normal">{appState.dripDensity}%</span>
        </span>
        <input type="range" min="0" max="100" value={appState.dripDensity} oninput={onDrip} />
      </label>

      <label class="block" title="Drop shadow offset in pixels — adds depth behind the text">
        <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Shadow</span>
          <span class="font-mono normal-case tracking-normal">{appState.shadowOffset}px</span>
        </span>
        <input type="range" min="0" max="6" value={appState.shadowOffset} oninput={onShadow} />
      </label>

      <label class="block" title="Randomly remove characters to create a worn, damaged look">
        <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Distress</span>
          <span class="font-mono normal-case tracking-normal">{appState.distressIntensity}%</span>
        </span>
        <input type="range" min="0" max="50" value={appState.distressIntensity} oninput={onDistress} />
      </label>

      <label class="block" title="Apply a pixelation filter — higher values create a more blocky, retro look">
        <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Pixelation</span>
          <span class="font-mono normal-case tracking-normal">{appState.pixelation === 0 ? 'Off' : appState.pixelation}</span>
        </span>
        <input type="range" min="0" max="10" value={appState.pixelation} oninput={onPixelation} />
      </label>

      <label class="block" title="Continuously cycle through hue rotation — creates an animated rainbow effect">
        <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Color Shift</span>
          <span class="font-mono normal-case tracking-normal">{appState.colorShiftSpeed === 0 ? 'Off' : `${appState.colorShiftSpeed}%`}</span>
        </span>
        <input type="range" min="0" max="100" value={appState.colorShiftSpeed} oninput={onColorShift} />
      </label>

      <label class="block col-span-2 sm:col-span-1" title="Randomly shake the preview at an interval — higher values shake more frequently and intensely">
        <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
          <span>Screen Shake</span>
          <span class="font-mono normal-case tracking-normal">{appState.screenShake === 0 ? 'Off' : `${appState.screenShake}%`}</span>
        </span>
        <input type="range" min="0" max="100" value={appState.screenShake} oninput={onScreenShake} />
      </label>
    </div>
  </details>

  <!-- CRT MONITOR Section -->
  <details class="group border-t border-doom-surface/30 pt-1.5">
    <summary class="flex items-center gap-1.5 cursor-pointer select-none list-none mb-1 text-[0.65rem] uppercase tracking-[0.15em] text-doom-text-muted" style="font-family: var(--font-doom-ui)" title="Simulate a CRT monitor with scanlines, phosphor glow, and screen curvature">
      <svg class="w-2.5 h-2.5 transition-transform group-open:rotate-90" viewBox="0 0 12 12" fill="currentColor">
        <path d="M4 2l5 4-5 4z"/>
      </svg>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span class="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={appState.crtEnabled}
          onchange={(e: Event) => (appState.crtEnabled = (e.target as HTMLInputElement).checked)}
          onclick={(e: MouseEvent) => e.stopPropagation()}
          class="accent-doom-red w-3 h-3 cursor-pointer"
        />
        CRT Monitor
      </span>
    </summary>
    {#if appState.crtEnabled}
      <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 pl-1">
        <label class="block" title="Barrel distortion of the screen edges — simulates a curved CRT glass">
          <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
            <span>Curvature</span>
            <span class="font-mono normal-case tracking-normal">{appState.crtCurvature}%</span>
          </span>
          <input type="range" min="0" max="100" value={appState.crtCurvature} oninput={onCrtCurvature} />
        </label>
        <label class="block" title="Screen brightness flicker — simulates an unstable CRT signal">
          <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
            <span>Flicker</span>
            <span class="font-mono normal-case tracking-normal">{appState.crtFlicker}%</span>
          </span>
          <input type="range" min="0" max="100" value={appState.crtFlicker} oninput={onCrtFlicker} />
        </label>
        <label class="block" title="Randomly simulate CRT power loss — the screen collapses and powers back on">
          <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
            <span>Power Loss</span>
            <span class="font-mono normal-case tracking-normal">{appState.crtPowerLoss === 0 ? 'Off' : `${appState.crtPowerLoss}%`}</span>
          </span>
          <input type="range" min="0" max="100" value={appState.crtPowerLoss} oninput={onCrtPowerLoss} />
        </label>
        <label class="block" title="Random horizontal screen shift with brightness flash — simulates CRT interference">
          <span class="mb-0.5 flex justify-between text-[0.6rem] uppercase tracking-[0.1em] text-doom-text-muted" style="font-family: var(--font-doom-ui)">
            <span>Screen Blip</span>
            <span class="font-mono normal-case tracking-normal">{appState.crtScreenBlip === 0 ? 'Off' : `${appState.crtScreenBlip}%`}</span>
          </span>
          <input type="range" min="0" max="100" value={appState.crtScreenBlip} oninput={onCrtScreenBlip} />
        </label>
      </div>
    {/if}
  </details>
</div>
