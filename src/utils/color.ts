/**
 * Color manipulation utilities
 */

/**
 * Convert hex to RGB
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.hexToRgb('#ff0000') // { r: 255, g: 0, b: 0 }
 * ```
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return null;

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.rgbToHex(255, 0, 0) // '#ff0000'
 * ```
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convert RGB to HSL
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.rgbToHsl(255, 0, 0) // { h: 0, s: 100, l: 50 }
 * ```
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.hslToRgb(0, 100, 50) // { r: 255, g: 0, b: 0 }
 * ```
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Lighten color
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.lighten('#ff0000', 20) // '#ff6666'
 * ```
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + percent);
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Darken color
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.darken('#ff0000', 20) // '#990000'
 * ```
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.max(0, hsl.l - percent);
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Saturate color
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.saturate('#ff0000', 20) // '#ff0000' (already saturated)
 * ```
 */
export function saturate(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.min(100, hsl.s + percent);
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Desaturate color
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.desaturate('#ff0000', 50) // '#804040'
 * ```
 */
export function desaturate(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.max(0, hsl.s - percent);
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Rotate hue
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.rotate('#ff0000', 90) // '#80ff00'
 * ```
 */
export function rotate(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + degrees) % 360;
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Get complementary color
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.complementary('#ff0000') // '#00ffff'
 * ```
 */
export function complementary(hex: string): string {
  return rotate(hex, 180);
}

/**
 * Mix two colors
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.mix('#ff0000', '#0000ff', 50) // '#800080'
 * ```
 */
export function mix(color1: string, color2: string, percent = 50): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return color1;

  const weight = percent / 100;
  const r = Math.round(rgb1.r * weight + rgb2.r * (1 - weight));
  const g = Math.round(rgb1.g * weight + rgb2.g * (1 - weight));
  const b = Math.round(rgb1.b * weight + rgb2.b * (1 - weight));

  return rgbToHex(r, g, b);
}

/**
 * Get color opacity
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.opacity('rgba(255, 0, 0, 0.5)') // 0.5
 * ```
 */
export function opacity(rgba: string): number | null {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  return match && match[4] ? parseFloat(match[4]) : 1;
}

/**
 * Set color opacity (returns RGBA string)
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.setOpacity('#ff0000', 0.5) // 'rgba(255, 0, 0, 0.5)'
 * ```
 */
export function setOpacity(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Get color brightness (perceived luminance)
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.brightness('#ffffff') // 255
 * color.brightness('#000000') // 0
 * ```
 */
export function brightness(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  return Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);
}

/**
 * Check if color is light
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.isLight('#ffffff') // true
 * color.isLight('#000000') // false
 * ```
 */
export function isLight(hex: string): boolean | null {
  const b = brightness(hex);
  return b === null ? null : b > 128;
}

/**
 * Check if color is dark
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.isDark('#000000') // true
 * color.isDark('#ffffff') // false
 * ```
 */
export function isDark(hex: string): boolean | null {
  const b = brightness(hex);
  return b === null ? null : b <= 128;
}

/**
 * Get contrasting text color (black or white)
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.contrast('#ffffff') // '#000000'
 * color.contrast('#000000') // '#ffffff'
 * ```
 */
export function contrast(hex: string): string | null {
  return isLight(hex) ? '#000000' : '#ffffff';
}

/**
 * Invert color
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.invert('#ff0000') // '#00ffff'
 * ```
 */
export function invert(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

/**
 * Convert to grayscale
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.grayscale('#ff0000') // '#808080'
 * ```
 */
export function grayscale(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const avg = Math.round((rgb.r + rgb.g + rgb.b) / 3);
  return rgbToHex(avg, avg, avg);
}

/**
 * Get color name (approximate)
 *
 * @example
 * ```typescript
 * import { color } from '@oxog/kit/utils';
 *
 * color.name('#ff0000') // 'red'
 * color.name('#0000ff') // 'blue'
 * ```
 */
export function name(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const colors: Record<string, { r: number; g: number; b: number }> = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 255, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    yellow: { r: 255, g: 255, b: 0 },
    cyan: { r: 0, g: 255, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
    orange: { r: 255, g: 165, b: 0 },
    pink: { r: 255, g: 192, b: 203 },
    purple: { r: 128, g: 0, b: 128 },
    brown: { r: 165, g: 42, b: 42 },
  };

  let minDistance = Infinity;
  let closestColor: string | null = null;

  for (const [colorName, colorRgb] of Object.entries(colors)) {
    const distance = Math.sqrt(
      Math.pow(rgb.r - colorRgb.r, 2) +
        Math.pow(rgb.g - colorRgb.g, 2) +
        Math.pow(rgb.b - colorRgb.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }
  }

  return minDistance < 100 ? closestColor : null;
}
