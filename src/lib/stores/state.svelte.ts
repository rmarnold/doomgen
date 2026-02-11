import type { LayoutMode } from '$lib/engine/figlet-renderer';

export type GradientDirection = 'none' | 'horizontal' | 'vertical' | 'diagonal' | 'radial';

export interface AppState {
  // Input
  text: string;
  fontId: string;
  layout: LayoutMode;

  // Color
  paletteId: string;
  gradientDirection: GradientDirection;
  normalizeBrightness: boolean;
  paletteStart: number;      // 0-100 %
  paletteEnd: number;         // 0-100 %

  // Effects
  glowIntensity: number;   // 0-100
  dripDensity: number;      // 0-100
  shadowOffset: number;     // 0-6
  distressIntensity: number; // 0-50
  pixelation: number;        // 0-10 (0 = off)
  crtEnabled: boolean;
  crtCurvature: number;     // 0-100
  crtFlicker: number;       // 0-100
  screenShake: boolean;     // momentary trigger
  colorShiftSpeed: number;  // 0-100 (0 = off)
  removeBlack: boolean;     // filter near-black colors from palette

  // View
  zoom: number;              // 0 = auto, 25-400 = manual %
  bgColor: string;           // background hex color

  // Animations
  animationsEnabled: boolean;
}

const defaults: AppState = {
  text: 'DOOMGEN',
  fontId: 'Banner3-D',
  layout: 'default',
  paletteId: 'hellfire',
  gradientDirection: 'horizontal',
  normalizeBrightness: false,
  paletteStart: 0,
  paletteEnd: 100,
  glowIntensity: 60,
  dripDensity: 0,
  shadowOffset: 0,
  distressIntensity: 0,
  pixelation: 0,
  crtEnabled: false,
  crtCurvature: 50,
  crtFlicker: 30,
  screenShake: false,
  colorShiftSpeed: 0,
  removeBlack: false,
  zoom: 0,
  bgColor: '#0a0a0a',
  animationsEnabled: true,
};

function createAppState() {
  let text = $state(defaults.text);
  let fontId = $state(defaults.fontId);
  let layout = $state<LayoutMode>(defaults.layout);
  let paletteId = $state(defaults.paletteId);
  let gradientDirection = $state<GradientDirection>(defaults.gradientDirection);
  let normalizeBrightness = $state(defaults.normalizeBrightness);
  let paletteStart = $state(defaults.paletteStart);
  let paletteEnd = $state(defaults.paletteEnd);
  let glowIntensity = $state(defaults.glowIntensity);
  let dripDensity = $state(defaults.dripDensity);
  let shadowOffset = $state(defaults.shadowOffset);
  let distressIntensity = $state(defaults.distressIntensity);
  let pixelation = $state(defaults.pixelation);
  let crtEnabled = $state(defaults.crtEnabled);
  let crtCurvature = $state(defaults.crtCurvature);
  let crtFlicker = $state(defaults.crtFlicker);
  let screenShake = $state(defaults.screenShake);
  let colorShiftSpeed = $state(defaults.colorShiftSpeed);
  let removeBlack = $state(defaults.removeBlack);
  let zoom = $state(defaults.zoom);
  let bgColor = $state(defaults.bgColor);
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

    get normalizeBrightness() { return normalizeBrightness; },
    set normalizeBrightness(v: boolean) { normalizeBrightness = v; },

    get paletteStart() { return paletteStart; },
    set paletteStart(v: number) { paletteStart = v; },

    get paletteEnd() { return paletteEnd; },
    set paletteEnd(v: number) { paletteEnd = v; },

    get glowIntensity() { return glowIntensity; },
    set glowIntensity(v: number) { glowIntensity = v; },

    get dripDensity() { return dripDensity; },
    set dripDensity(v: number) { dripDensity = v; },

    get shadowOffset() { return shadowOffset; },
    set shadowOffset(v: number) { shadowOffset = v; },

    get distressIntensity() { return distressIntensity; },
    set distressIntensity(v: number) { distressIntensity = v; },

    get pixelation() { return pixelation; },
    set pixelation(v: number) { pixelation = v; },

    get crtEnabled() { return crtEnabled; },
    set crtEnabled(v: boolean) { crtEnabled = v; },

    get crtCurvature() { return crtCurvature; },
    set crtCurvature(v: number) { crtCurvature = v; },

    get crtFlicker() { return crtFlicker; },
    set crtFlicker(v: number) { crtFlicker = v; },

    get screenShake() { return screenShake; },
    set screenShake(v: boolean) { screenShake = v; },

    get colorShiftSpeed() { return colorShiftSpeed; },
    set colorShiftSpeed(v: number) { colorShiftSpeed = v; },

    get removeBlack() { return removeBlack; },
    set removeBlack(v: boolean) { removeBlack = v; },

    get zoom() { return zoom; },
    set zoom(v: number) { zoom = v; },

    get bgColor() { return bgColor; },
    set bgColor(v: string) { bgColor = v; },

    get animationsEnabled() { return animationsEnabled; },
    set animationsEnabled(v: boolean) { animationsEnabled = v; },

    reset() {
      text = defaults.text;
      fontId = defaults.fontId;
      layout = defaults.layout;
      paletteId = defaults.paletteId;
      gradientDirection = defaults.gradientDirection;
      normalizeBrightness = defaults.normalizeBrightness;
      paletteStart = defaults.paletteStart;
      paletteEnd = defaults.paletteEnd;
      glowIntensity = defaults.glowIntensity;
      dripDensity = defaults.dripDensity;
      shadowOffset = defaults.shadowOffset;
      distressIntensity = defaults.distressIntensity;
      pixelation = defaults.pixelation;
      crtEnabled = defaults.crtEnabled;
      crtCurvature = defaults.crtCurvature;
      crtFlicker = defaults.crtFlicker;
      screenShake = defaults.screenShake;
      colorShiftSpeed = defaults.colorShiftSpeed;
      removeBlack = defaults.removeBlack;
      zoom = defaults.zoom;
      bgColor = defaults.bgColor;
      animationsEnabled = defaults.animationsEnabled;
    },
  };
}

export const appState = createAppState();
