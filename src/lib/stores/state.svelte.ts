import type { LayoutMode } from '$lib/engine/figlet-renderer';

export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial';

export interface AppState {
  // Input
  text: string;
  fontId: string;
  layout: LayoutMode;

  // Color
  paletteId: string;
  gradientDirection: GradientDirection;

  // Effects
  glowIntensity: number;   // 0-100
  dripDensity: number;      // 0-100
  shadowOffset: number;     // 0-6
  distressIntensity: number; // 0-50

  // Animations
  animationsEnabled: boolean;
}

const defaults: AppState = {
  text: 'DOOM',
  fontId: 'Doom',
  layout: 'default',
  paletteId: 'hellfire',
  gradientDirection: 'horizontal',
  glowIntensity: 60,
  dripDensity: 0,
  shadowOffset: 0,
  distressIntensity: 0,
  animationsEnabled: true,
};

function createAppState() {
  let text = $state(defaults.text);
  let fontId = $state(defaults.fontId);
  let layout = $state<LayoutMode>(defaults.layout);
  let paletteId = $state(defaults.paletteId);
  let gradientDirection = $state<GradientDirection>(defaults.gradientDirection);
  let glowIntensity = $state(defaults.glowIntensity);
  let dripDensity = $state(defaults.dripDensity);
  let shadowOffset = $state(defaults.shadowOffset);
  let distressIntensity = $state(defaults.distressIntensity);
  let animationsEnabled = $state(defaults.animationsEnabled);

  return {
    get text() { return text; },
    set text(v: string) { text = v; },

    get fontId() { return fontId; },
    set fontId(v: string) { fontId = v; },

    get layout() { return layout; },
    set layout(v: LayoutMode) { layout = v; },

    get paletteId() { return paletteId; },
    set paletteId(v: string) { paletteId = v; },

    get gradientDirection() { return gradientDirection; },
    set gradientDirection(v: GradientDirection) { gradientDirection = v; },

    get glowIntensity() { return glowIntensity; },
    set glowIntensity(v: number) { glowIntensity = v; },

    get dripDensity() { return dripDensity; },
    set dripDensity(v: number) { dripDensity = v; },

    get shadowOffset() { return shadowOffset; },
    set shadowOffset(v: number) { shadowOffset = v; },

    get distressIntensity() { return distressIntensity; },
    set distressIntensity(v: number) { distressIntensity = v; },

    get animationsEnabled() { return animationsEnabled; },
    set animationsEnabled(v: boolean) { animationsEnabled = v; },

    reset() {
      text = defaults.text;
      fontId = defaults.fontId;
      layout = defaults.layout;
      paletteId = defaults.paletteId;
      gradientDirection = defaults.gradientDirection;
      glowIntensity = defaults.glowIntensity;
      dripDensity = defaults.dripDensity;
      shadowOffset = defaults.shadowOffset;
      distressIntensity = defaults.distressIntensity;
      animationsEnabled = defaults.animationsEnabled;
    },
  };
}

export const appState = createAppState();
