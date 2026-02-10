export type FontCategory = 'doom' | 'decorative' | 'clean' | '3d';

export interface FontMeta {
  id: string;
  label: string;
  description: string;
  category: FontCategory;
}

export const DOOM_FONTS: FontMeta[] = [
  // Doom
  { id: 'Doom', label: 'Doom', description: 'Classic DOOM angular blocks', category: 'doom' },
  { id: 'ANSI Shadow', label: 'ANSI Shadow', description: 'Bold block with shadow', category: 'doom' },
  { id: 'Bloody', label: 'Bloody', description: 'Horror dripping letters', category: 'doom' },
  { id: 'Gothic', label: 'Gothic', description: 'Dark medieval letterforms', category: 'doom' },
  { id: 'Block', label: 'Block', description: 'Solid block characters', category: 'doom' },
  { id: 'Poison', label: 'Poison', description: 'Toxic drip variant', category: 'doom' },
  { id: 'Ghost', label: 'Ghost', description: 'Ethereal/spooky', category: 'doom' },
  { id: 'DOS Rebel', label: 'DOS Rebel', description: 'Retro DOS rebellion', category: 'doom' },

  // 3D
  { id: '3-D', label: '3-D', description: 'Three-dimensional depth', category: '3d' },
  { id: 'Banner3-D', label: 'Banner3-D', description: 'Large 3D banner', category: '3d' },
  { id: 'Isometric1', label: 'Isometric1', description: 'Isometric 3D perspective', category: '3d' },
  { id: 'Larry 3D', label: 'Larry 3D', description: 'Stylized 3D lettering', category: '3d' },
  { id: 'Colossal', label: 'Colossal', description: 'Massive 3D block letters', category: '3d' },

  // Decorative
  { id: 'Graffiti', label: 'Graffiti', description: 'Street art style', category: 'decorative' },
  { id: 'Alligator', label: 'Alligator', description: 'Large aggressive letters', category: 'decorative' },
  { id: 'Star Wars', label: 'Star Wars', description: 'Sci-fi saga lettering', category: 'decorative' },
  { id: 'Ogre', label: 'Ogre', description: 'Chunky monster font', category: 'decorative' },
  { id: 'Chunky', label: 'Chunky', description: 'Bold chunky blocks', category: 'decorative' },
  { id: 'Elite', label: 'Elite', description: 'Elite hacker aesthetic', category: 'decorative' },
  { id: 'Rectangles', label: 'Rectangles', description: 'Geometric box letters', category: 'decorative' },

  // Clean
  { id: 'Standard', label: 'Standard', description: 'Classic figlet standard', category: 'clean' },
  { id: 'Big', label: 'Big', description: 'Large clean letters', category: 'clean' },
  { id: 'Slant', label: 'Slant', description: 'Italic forward lean', category: 'clean' },
  { id: 'Small Slant', label: 'Small Slant', description: 'Compact italic style', category: 'clean' },
  { id: 'Cyberlarge', label: 'Cyberlarge', description: 'Cyber tech large', category: 'clean' },
  { id: 'Calvin S', label: 'Calvin S', description: 'Clean small caps', category: 'clean' },
];

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: 'doom', label: 'Doom' },
  { id: '3d', label: '3D' },
  { id: 'decorative', label: 'Decorative' },
  { id: 'clean', label: 'Clean' },
];
