/**
 * Size formatting utilities
 */

/**
 * Format bytes to human-readable string
 *
 * @example
 * ```typescript
 * import { size } from '@oxog/kit/utils';
 *
 * size.format(1536) // '1.5 KB'
 * size.format(1536, { bits: true }) // '12.3 Kibit'
 * ```
 */
export function format(
  bytes: number,
  options: {
    bits?: boolean;
    binary?: boolean;
    padding?: number;
    separator?: string;
  } = {}
): string {
  const { bits = false, binary = false, padding = 0, separator = ' ' } = options;

  const base = binary ? 1024 : 1000;
  const units = bits
    ? (binary
        ? ['bit', 'Kibit', 'Mibit', 'Gibit', 'Tibit', 'Pibit', 'Eibit', 'Zibit', 'Yibit']
        : ['bit', 'Kbit', 'Mbit', 'Gbit', 'Tbit', 'Pbit', 'Ebit', 'Zbit', 'Ybit'])
    : (binary
        ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
        : ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']);

  let value = bits ? bytes * 8 : bytes;
  let unitIndex = 0;

  while (value >= base && unitIndex < units.length - 1) {
    value /= base;
    unitIndex++;
  }

  const fixed = value.toFixed(unitIndex === 0 ? 0 : 1);
  const padded = padding > 0 ? fixed.padStart(padding, ' ') : fixed;

  return `${padded}${separator}${units[unitIndex]}`;
}

/**
 * Parse size string to bytes
 *
 * @example
 * ```typescript
 * import { size } from '@oxog/kit/utils';
 *
 * size.parse('1.5 KB') // 1500
 * size.parse('1 KiB') // 1024
 * ```
 */
export function parse(sizeStr: string): number | null {
  const match = sizeStr.trim().match(/^([\d.]+)\s*([A-Za-z]+)$/);
  if (!match || !match[1] || !match[2]) return null;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (!unit) return null;

  const units: Record<string, { multiplier: number; bits: boolean }> = {
    'B': { multiplier: 1, bits: false },
    'KB': { multiplier: 1000, bits: false },
    'MB': { multiplier: 1000 ** 2, bits: false },
    'GB': { multiplier: 1000 ** 3, bits: false },
    'TB': { multiplier: 1000 ** 4, bits: false },
    'PB': { multiplier: 1000 ** 5, bits: false },
    'EB': { multiplier: 1000 ** 6, bits: false },
    'KIB': { multiplier: 1024, bits: false },
    'MIB': { multiplier: 1024 ** 2, bits: false },
    'GIB': { multiplier: 1024 ** 3, bits: false },
    'TIB': { multiplier: 1024 ** 4, bits: false },
    'PIB': { multiplier: 1024 ** 5, bits: false },
    'EIB': { multiplier: 1024 ** 6, bits: false },
    'BIT': { multiplier: 0.125, bits: true },
    'KBIT': { multiplier: 125, bits: true },
    'MBIT': { multiplier: 125000, bits: true },
    'GBIT': { multiplier: 125000000, bits: true },
    'KIBIT': { multiplier: 128, bits: true },
    'MIBIT': { multiplier: 131072, bits: true },
    'GIBIT': { multiplier: 134217728, bits: true },
  };

  const unitInfo = units[unit];
  if (!unitInfo) return null;

  return Math.round(value * unitInfo.multiplier);
}

/**
 * Convert bytes to bits
 *
 * @example
 * ```typescript
 * import { size } from '@oxog/kit/utils';
 *
 * size.toBits(1000) // 8000
 * ```
 */
export function toBits(bytes: number): number {
  return bytes * 8;
}

/**
 * Convert bits to bytes
 *
 * @example
 * ```typescript
 * import { size } from '@oxog/kit/utils';
 *
 * size.toBytes(8000) // 1000
 * ```
 */
export function toBytes(bits: number): number {
  return bits / 8;
}

/**
 * Get closest unit for given bytes
 *
 * @example
 * ```typescript
 * import { size } from '@oxog/kit/utils';
 *
 * size.closestUnit(1536) // 'KB'
 * size.closestUnit(1536, true) // 'KiB'
 * ```
 */
export function closestUnit(bytes: number, binary = false): string {
  const base = binary ? 1024 : 1000;
  const units = binary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EB', 'ZB', 'YB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  let unitIndex = 0;
  let value = bytes;

  while (value >= base && unitIndex < units.length - 1) {
    value /= base;
    unitIndex++;
  }

  const unit = units[unitIndex];
  return unit ?? 'B';
}
