export interface Palette {
  id: string;
  label: string;
  description: string;
  colors: string[];
}

export const DOOM_PALETTES: Palette[] = [
  {
    id: 'hellfire',
    label: 'Hellfire',
    description: 'Hell fire, lava',
    colors: ['#1a0000', '#8b0000', '#ff0000', '#ff4500', '#ff6600', '#ffa500', '#ffff00'],
  },
  {
    id: 'cyberdemon',
    label: 'Cyberdemon',
    description: 'Cyberdemon energy',
    colors: ['#0a0a2e', '#1a1a4e', '#4040ff', '#00ffff', '#ffffff'],
  },
  {
    id: 'toxic-waste',
    label: 'Toxic Waste',
    description: 'Radiation barrels',
    colors: ['#001a00', '#003300', '#006600', '#00cc00', '#00ff00', '#88ff88'],
  },
  {
    id: 'cacodemon',
    label: 'Cacodemon',
    description: 'Cacodemon purple',
    colors: ['#0a001a', '#1a0033', '#3300ff', '#6600ff', '#9933ff', '#cc66ff'],
  },
  {
    id: 'bfg-9000',
    label: 'BFG 9000',
    description: 'BFG energy blast',
    colors: ['#001a00', '#00ff00', '#33ff33', '#66ff66', '#ccffcc', '#ffffff'],
  },
  {
    id: 'baron',
    label: 'Baron',
    description: 'Baron of Hell',
    colors: ['#1a0a00', '#4d1a00', '#993300', '#cc4400', '#ff6600', '#ffaa00'],
  },
];

export function getPaletteById(id: string): Palette {
  return DOOM_PALETTES.find((p) => p.id === id) ?? DOOM_PALETTES[0];
}
