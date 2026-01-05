/**
 * Math operations utilities
 */

/**
 * Clamp value between min and max
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.clamp(5, 0, 10) // 5
 * math.clamp(-5, 0, 10) // 0
 * math.clamp(15, 0, 10) // 10
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.lerp(0, 100, 0.5) // 50
 * ```
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map value from one range to another
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.mapRange(5, 0, 10, 0, 100) // 50
 * ```
 */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Check if number is in range
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.inRange(5, 0, 10) // true
 * math.inRange(15, 0, 10) // false
 * ```
 */
export function inRange(value: number, min: number, max?: number): boolean {
  if (max === undefined) {
    return value >= min;
  }
  return value >= min && value < max;
}

/**
 * Round to decimal places
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.round(3.14159, 2) // 3.14
 * ```
 */
export function round(value: number, precision = 0): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

/**
 * Round up to decimal places
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.ceil(3.14159, 2) // 3.15
 * ```
 */
export function ceil(value: number, precision = 0): number {
  const factor = Math.pow(10, precision);
  return Math.ceil(value * factor) / factor;
}

/**
 * Round down to decimal places
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.floor(3.14159, 2) // 3.14
 * ```
 */
export function floor(value: number, precision = 0): number {
  const factor = Math.pow(10, precision);
  return Math.floor(value * factor) / factor;
}

/**
 * Get sum of numbers
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.sum([1, 2, 3, 4]) // 10
 * ```
 */
export function sum(numbers: readonly number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

/**
 * Get average of numbers
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.average([1, 2, 3, 4, 5]) // 3
 * ```
 */
export function average(numbers: readonly number[]): number {
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
}

/**
 * Get median of numbers
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.median([1, 2, 3, 4, 5]) // 3
 * math.median([1, 2, 3, 4]) // 2.5
 * ```
 */
export function median(numbers: readonly number[]): number {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    const lower = sorted[mid - 1];
    const upper = sorted[mid];
    if (lower !== undefined && upper !== undefined) {
      return (lower + upper) / 2;
    }
    return lower ?? upper ?? 0;
  }

  const value = sorted[mid];
  return value ?? 0;
}

/**
 * Get mode (most frequent value) of numbers
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.mode([1, 2, 2, 3, 3, 3]) // 3
 * ```
 */
export function mode(numbers: readonly number[]): number | undefined {
  if (numbers.length === 0) return undefined;

  const frequency = new Map<number, number>();
  for (const num of numbers) {
    frequency.set(num, (frequency.get(num) ?? 0) + 1);
  }

  let maxCount = 0;
  let mode: number | undefined;

  for (const [num, count] of frequency) {
    if (count > maxCount) {
      maxCount = count;
      mode = num;
    }
  }

  return mode;
}

/**
 * Get minimum value
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.min([3, 1, 2]) // 1
 * ```
 */
export function min(numbers: readonly number[]): number {
  return Math.min(...numbers);
}

/**
 * Get maximum value
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.max([1, 3, 2]) // 3
 * ```
 */
export function max(numbers: readonly number[]): number {
  return Math.max(...numbers);
}

/**
 * Get min and max values
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.minMax([1, 3, 2]) // { min: 1, max: 3 }
 * ```
 */
export function minMax(numbers: readonly number[]): { min: number; max: number } {
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
}

/**
 * Get standard deviation
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.stdDev([1, 2, 3, 4, 5]) // ~1.414
 * ```
 */
export function stdDev(numbers: readonly number[]): number {
  if (numbers.length === 0) return 0;

  const avg = average(numbers);
  const squareDiffs = numbers.map((num) => Math.pow(num - avg, 2));
  const avgSquareDiff = average(squareDiffs);

  return Math.sqrt(avgSquareDiff);
}

/**
 * Get variance
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.variance([1, 2, 3, 4, 5]) // 2
 * ```
 */
export function variance(numbers: readonly number[]): number {
  if (numbers.length === 0) return 0;

  const avg = average(numbers);
  const squareDiffs = numbers.map((num) => Math.pow(num - avg, 2));

  return average(squareDiffs);
}

/**
 * Get range (difference between max and min)
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.range([1, 2, 3, 4, 5]) // 4
 * ```
 */
export function range(numbers: readonly number[]): number {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers) - Math.min(...numbers);
}

/**
 * Generate random number between min and max
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.random(0, 10) // Random number between 0 and 10
 * ```
 */
export function random(min = 0, max = 1): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.randomInt(1, 10) // Random integer between 1 and 10
 * ```
 */
export function randomInt(min = 0, max = 1): number {
  return Math.floor(random(min, max + 1));
}

/**
 * Get absolute value
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.abs(-5) // 5
 * ```
 */
export function abs(value: number): number {
  return Math.abs(value);
}

/**
 * Get sign of number
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.sign(-5) // -1
 * math.sign(0) // 0
 * math.sign(5) // 1
 * ```
 */
export function sign(value: number): number {
  return Math.sign(value);
}

/**
 * Check if number is positive
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.isPositive(5) // true
 * math.isPositive(-5) // false
 * math.isPositive(0) // false
 * ```
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Check if number is negative
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.isNegative(-5) // true
 * math.isNegative(5) // false
 * math.isNegative(0) // false
 * ```
 */
export function isNegative(value: number): boolean {
  return value < 0;
}

/**
 * Check if number is zero
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.isZero(0) // true
 * math.isZero(0.0001) // false
 * ```
 */
export function isZero(value: number, epsilon = Number.EPSILON): boolean {
  return abs(value) < epsilon;
}

/**
 * Check if number is even
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.isEven(4) // true
 * math.isEven(3) // false
 * ```
 */
export function isEven(value: number): boolean {
  return value % 2 === 0;
}

/**
 * Check if number is odd
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.isOdd(3) // true
 * math.isOdd(4) // false
 * ```
 */
export function isOdd(value: number): boolean {
  return value % 2 !== 0;
}

/**
 * Get power of number
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.pow(2, 3) // 8
 * ```
 */
export function pow(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

/**
 * Get square root
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.sqrt(9) // 3
 * ```
 */
export function sqrt(value: number): number {
  return Math.sqrt(value);
}

/**
 * Get cube root
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.cbrt(27) // 3
 * ```
 */
export function cbrt(value: number): number {
  return Math.cbrt(value);
}

/**
 * Get nth root
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.nthRoot(27, 3) // 3
 * ```
 */
export function nthRoot(value: number, n: number): number {
  return Math.pow(value, 1 / n);
}

/**
 * Get percentage
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.percent(50, 200) // 25
 * ```
 */
export function percent(value: number, total: number): number {
  return (value / total) * 100;
}

/**
 * Get value from percentage
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.fromPercent(25, 200) // 50
 * ```
 */
export function fromPercent(percent: number, total: number): number {
  return (percent / 100) * total;
}

/**
 * Convert degrees to radians
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.degToRad(180) // ~3.14159
 * ```
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.radToDeg(Math.PI) // 180
 * ```
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Get sine
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.sin(Math.PI / 2) // 1
 * ```
 */
export function sin(radians: number): number {
  return Math.sin(radians);
}

/**
 * Get cosine
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.cos(0) // 1
 * ```
 */
export function cos(radians: number): number {
  return Math.cos(radians);
}

/**
 * Get tangent
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.tan(Math.PI / 4) // 1
 * ```
 */
export function tan(radians: number): number {
  return Math.tan(radians);
}

/**
 * Get arcsine
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.asin(1) // ~1.5708 (PI/2)
 * ```
 */
export function asin(value: number): number {
  return Math.asin(value);
}

/**
 * Get arccosine
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.acos(1) // 0
 * ```
 */
export function acos(value: number): number {
  return Math.acos(value);
}

/**
 * Get arctangent
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.atan(1) // ~0.7854 (PI/4)
 * ```
 */
export function atan(value: number): number {
  return Math.atan(value);
}

/**
 * Get arctangent of quotient
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.atan2(1, 1) // ~0.7854 (PI/4)
 * ```
 */
export function atan2(y: number, x: number): number {
  return Math.atan2(y, x);
}

/**
 * Get logarithm (base 10)
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.log10(100) // 2
 * ```
 */
export function log10(value: number): number {
  return Math.log10(value);
}

/**
 * Get natural logarithm
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.log(Math.E) // 1
 * ```
 */
export function log(value: number): number {
  return Math.log(value);
}

/**
 * Get logarithm with base
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.logBase(8, 2) // 3
 * ```
 */
export function logBase(value: number, base: number): number {
  return Math.log(value) / Math.log(base);
}

/**
 * Get exponential
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.exp(2) // ~7.389
 * ```
 */
export function exp(value: number): number {
  return Math.exp(value);
}

/**
 * Get hypotenuse
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.hypot(3, 4) // 5
 * ```
 */
export function hypot(...values: number[]): number {
  return Math.hypot(...values);
}

/**
 * Truncate decimal places
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.trunc(3.14159) // 3
 * ```
 */
export function trunc(value: number): number {
  return Math.trunc(value);
}

/**
 * Get factorial
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.factorial(5) // 120
 * ```
 */
export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
}

/**
 * Get greatest common divisor
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.gcd(12, 18) // 6
 * ```
 */
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Get least common multiple
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.lcm(4, 6) // 12
 * ```
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return abs(a * b) / gcd(a, b);
}

/**
 * Check if number is prime
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.isPrime(7) // true
 * math.isPrime(4) // false
 * ```
 */
export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Get next prime
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.nextPrime(7) // 11
 * ```
 */
export function nextPrime(n: number): number {
  let candidate = n + 1;
  while (!isPrime(candidate)) {
    candidate++;
  }
  return candidate;
}

/**
 * Check if number is finite
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.isFinite(42) // true
 * math.isFinite(Infinity) // false
 * ```
 */
export function isFinite(value: number): boolean {
  return Number.isFinite(value);
}

/**
 * Check if number is integer
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.isInteger(5) // true
 * math.isInteger(5.5) // false
 * ```
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

/**
 * Check if number is safe integer
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.isSafeInteger(Number.MAX_SAFE_INTEGER) // true
 * math.isSafeInteger(Number.MAX_SAFE_INTEGER + 1) // false
 * ```
 */
export function isSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value);
}

/**
 * Convert to integer
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.toInt(3.7) // 3
 * ```
 */
export function toInt(value: number): number {
  return trunc(value);
}

/**
 * Convert to float
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.toFloat(3) // 3.0
 * ```
 */
export function toFloat(value: number): number {
  return value;
}

/**
 * Get PI constant
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.PI // 3.14159...
 * ```
 */
export const PI = Math.PI;

/**
 * Get E constant
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.E // 2.718...
 * ```
 */
export const E = Math.E;

/**
 * Get Golden Ratio constant
 *
 * @example
 * ```typescript
 * import { math } from '@oxog/kit/utils';
 *
 * math.PHI // 1.618...
 * ```
 */
export const PHI = (1 + Math.sqrt(5)) / 2;
