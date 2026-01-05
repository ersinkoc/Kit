/**
 * Diff utilities for comparing values
 */

/**
 * Diff result type
 */
export type DiffResult<T> =
  | { type: 'unchanged'; value: T }
  | { type: 'added'; value: T }
  | { type: 'removed'; value: T }
  | { type: 'updated'; oldValue: T; newValue: T };

/**
 * Compare two arrays and return differences
 *
 * @example
 * ```typescript
 * import { diff } from '@oxog/kit/utils';
 *
 * diff.arrays([1, 2, 3], [1, 2, 4]);
 * // [
 * //   { type: 'unchanged', value: 1 },
 * //   { type: 'unchanged', value: 2 },
 * //   { type: 'removed', value: 3 },
 * //   { type: 'added', value: 4 }
 * // ]
 * ```
 */
export function arrays<T>(oldArr: readonly T[], newArr: readonly T[]): DiffResult<T>[] {
  const result: DiffResult<T>[] = [];
  const seen = new Set<number>();

  // Check for unchanged and removed
  for (let i = 0; i < oldArr.length; i++) {
    const oldItem = oldArr[i];
    if (oldItem === undefined) continue;

    const newItem = newArr[i];
    if (i < newArr.length && newItem !== undefined && oldItem === newItem) {
      result.push({ type: 'unchanged', value: oldItem });
      seen.add(i);
    } else if (newArr.includes(oldItem)) {
      result.push({ type: 'unchanged', value: oldItem });
    } else {
      result.push({ type: 'removed', value: oldItem });
    }
  }

  // Check for added
  for (let i = 0; i < newArr.length; i++) {
    const newItem = newArr[i];
    if (newItem !== undefined && !oldArr.includes(newItem)) {
      result.push({ type: 'added', value: newItem });
    }
  }

  return result;
}

/**
 * Compare two objects and return differences
 *
 * @example
 * ```typescript
 * import { diff } from '@oxog/kit/utils';
 *
 * diff.objects(
 *   { a: 1, b: 2, c: 3 },
 *   { a: 1, b: 20, d: 4 }
 * );
 * // {
 * //   a: { type: 'unchanged', value: 1 },
 * //   b: { type: 'updated', oldValue: 2, newValue: 20 },
 * //   c: { type: 'removed', value: 3 },
 * //   d: { type: 'added', value: 4 }
 * // }
 * ```
 */
export function objects<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  oldObj: T,
  newObj: U
): Record<string, DiffResult<unknown>> {
  const result: Record<string, DiffResult<unknown>> = {};

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldValue = oldObj[key];
    const newValue = newObj[key];

    if (!(key in oldObj)) {
      result[key] = { type: 'added', value: newValue };
    } else if (!(key in newObj)) {
      result[key] = { type: 'removed', value: oldValue };
    } else if (oldValue !== newValue) {
      result[key] = { type: 'updated', oldValue, newValue };
    } else {
      result[key] = { type: 'unchanged', value: oldValue };
    }
  }

  return result;
}

/**
 * Compare two strings and return differences (character level)
 *
 * @example
 * ```typescript
 * import { diff } from '@oxog/kit/utils';
 *
 * diff.strings('hello', 'hallo');
 * // [
 * //   { type: 'unchanged', value: 'h' },
 * //   { type: 'updated', oldValue: 'e', newValue: 'a' },
 * //   { type: 'unchanged', value: 'l' },
 * //   { type: 'unchanged', value: 'l' },
 * //   { type: 'unchanged', value: 'o' }
 * // ]
 * ```
 */
export function strings(oldStr: string, newStr: string): DiffResult<string>[] {
  const result: DiffResult<string>[] = [];
  const maxLen = Math.max(oldStr.length, newStr.length);

  for (let i = 0; i < maxLen; i++) {
    const oldChar = oldStr[i];
    const newChar = newStr[i];

    if (oldChar === undefined) {
      if (newChar !== undefined) {
        result.push({ type: 'added', value: newChar });
      }
    } else if (newChar === undefined) {
      result.push({ type: 'removed', value: oldChar });
    } else if (oldChar === newChar) {
      result.push({ type: 'unchanged', value: oldChar });
    } else {
      result.push({ type: 'updated', oldValue: oldChar, newValue: newChar });
    }
  }

  return result;
}

/**
 * Get added items between two arrays
 *
 * @example
 * ```typescript
 * import { diff } from '@oxog/kit/utils';
 *
 * diff.added([1, 2], [2, 3]); // [3]
 * ```
 */
export function added<T>(oldArr: readonly T[], newArr: readonly T[]): T[] {
  return newArr.filter((item) => !oldArr.includes(item));
}

/**
 * Get removed items between two arrays
 *
 * @example
 * ```typescript
 * import { diff } from '@oxog/kit/utils';
 *
 * diff.removed([1, 2], [2, 3]); // [1]
 * ```
 */
export function removed<T>(oldArr: readonly T[], newArr: readonly T[]): T[] {
  return oldArr.filter((item) => !newArr.includes(item));
}

/**
 * Get unchanged items between two arrays
 *
 * @example
 * ```typescript
 * import { diff } from '@oxog/kit/utils';
 *
 * diff.unchanged([1, 2], [2, 3]); // [2]
 * ```
 */
export function unchanged<T>(oldArr: readonly T[], newArr: readonly T[]): T[] {
  return oldArr.filter((item) => newArr.includes(item));
}

/**
 * Check if two values are deeply equal
 *
 * @example
 * ```typescript
 * import { diff } from '@oxog/kit/utils';
 *
 * diff.isEqual([1, 2], [1, 2]); // true
 * diff.isEqual({ a: 1 }, { a: 2 }); // false
 * ```
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(a) || Array.isArray(b)) return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}
