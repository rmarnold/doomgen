import type { ColoredLine } from './colorizer';

/**
 * Apply drip effect below the ASCII art.
 * Appends drip lines below characters at the bottom edge.
 */
export function applyDrip(lines: ColoredLine[], density: number): ColoredLine[] {
  if (density <= 0 || lines.length === 0) return [];

  const lastLine = lines[lines.length - 1];
  const dripChars = ['|', ':', ';', '.'];
  const maxDripLength = 5;
  const dripLines: ColoredLine[] = [];

  // Initialize drip columns
  const dripColumns: { color: string; length: number }[] = lastLine.map((cell) => {
    if (cell.char !== ' ' && cell.color !== 'transparent' && Math.random() * 100 < density) {
      return { color: cell.color, length: Math.floor(Math.random() * maxDripLength) + 1 };
    }
    return { color: 'transparent', length: 0 };
  });

  const maxLen = Math.max(...dripColumns.map((d) => d.length), 0);

  for (let row = 0; row < maxLen; row++) {
    const dripLine: ColoredLine = dripColumns.map((col) => {
      if (row < col.length) {
        const charIndex = Math.min(row, dripChars.length - 1);
        return { char: dripChars[charIndex], color: col.color };
      }
      return { char: ' ', color: 'transparent' };
    });
    dripLines.push(dripLine);
  }

  return dripLines;
}

/**
 * Apply distress effect to ASCII art.
 * Randomly removes characters to create a battle-damaged look.
 */
export function applyDistress(lines: ColoredLine[], intensity: number): ColoredLine[] {
  if (intensity <= 0) return lines;

  return lines.map((line) =>
    line.map((cell) => {
      if (cell.char === ' ' || cell.color === 'transparent') return cell;
      if (Math.random() * 100 < intensity) {
        return { char: ' ', color: 'transparent' };
      }
      return cell;
    })
  );
}
