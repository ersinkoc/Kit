/**
 * Array manipulation utilities
 */

/**
 * Get first element of array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.first([1, 2, 3]) // 1
 * array.first([]) // undefined
 * ```
 */
export function first<T>(arr: readonly T[]): T | undefined {
  return arr[0];
}

/**
 * Get last element of array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.last([1, 2, 3]) // 3
 * array.last([]) // undefined
 * ```
 */
export function last<T>(arr: readonly T[]): T | undefined {
  return arr[arr.length - 1];
}

/**
 * Get element at index (supports negative indices)
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.at([1, 2, 3], 1) // 2
 * array.at([1, 2, 3], -1) // 3
 * ```
 */
export function at<T>(arr: readonly T[], index: number): T | undefined {
  const len = arr.length;
  const i = index < 0 ? len + index : index;
  return arr[i];
}

/**
 * Check if array is empty
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.isEmpty([]) // true
 * array.isEmpty([1]) // false
 * ```
 */
export function isEmpty<T>(arr: readonly T[]): boolean {
  return arr.length === 0;
}

/**
 * Get array length
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.length([1, 2, 3]) // 3
 * ```
 */
export function length<T>(arr: readonly T[]): number {
  return arr.length;
}

/**
 * Reverse array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.reverse([1, 2, 3]) // [3, 2, 1]
 * ```
 */
export function reverse<T>(arr: readonly T[]): T[] {
  return [...arr].reverse();
}

/**
 * Sort array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.sort([3, 1, 2]) // [1, 2, 3]
 * ```
 */
export function sort<T>(arr: readonly T[]): T[] {
  return [...arr].sort();
}

/**
 * Sort array by comparator
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.sortBy([{a: 2}, {a: 1}], x => x.a) // [{a: 1}, {a: 2}]
 * ```
 */
export function sortBy<T, U>(arr: readonly T[], fn: (item: T) => U): T[] {
  return [...arr].sort((a, b) => {
    const av = fn(a);
    const bv = fn(b);
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });
}

/**
 * Shuffle array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.shuffle([1, 2, 3]) // [3, 1, 2] (random)
 * ```
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    const temp2 = result[j];
    if (temp !== undefined && temp2 !== undefined) {
      result[i] = temp2;
      result[j] = temp;
    }
  }
  return result;
}

/**
 * Chunk array into groups of size
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(arr: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Flatten array one level
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.flatten([[1], [2], [3]]) // [1, 2, 3]
 * ```
 */
export function flatten<T>(arr: readonly (readonly T[] | T)[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      for (const sub of item) {
        result.push(sub as T);
      }
    } else {
      result.push(item as T);
    }
  }
  return result;
}

/**
 * Flatten array recursively
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.flattenDeep([[1], [[2]], [3]]) // [1, 2, 3]
 * ```
 */
export function flattenDeep<T>(arr: readonly unknown[]): T[] {
  const result: T[] = [];
  const stack = [...arr];

  while (stack.length > 0) {
    const item = stack.pop();
    if (Array.isArray(item)) {
      stack.push(...item);
    } else if (item !== undefined) {
      result.push(item as T);
    }
  }

  return result.reverse();
}

/**
 * Remove duplicate values
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.unique([1, 2, 2, 3]) // [1, 2, 3]
 * ```
 */
export function unique<T>(arr: readonly T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Remove duplicate values by key
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.uniqueBy([{id: 1}, {id: 2}, {id: 1}], x => x.id) // [{id: 1}, {id: 2}]
 * ```
 */
export function uniqueBy<T, U>(arr: readonly T[], fn: (item: T) => U): T[] {
  const seen = new Set<U>();
  const result: T[] = [];

  for (const item of arr) {
    const key = fn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

/**
 * Group array by key
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.groupBy([{type: 'a'}, {type: 'b'}, {type: 'a'}], x => x.type)
 * // { a: [{type: 'a'}, {type: 'a'}], b: [{type: 'b'}] }
 * ```
 */
export function groupBy<T, U extends PropertyKey>(
  arr: readonly T[],
  fn: (item: T) => U
): Record<U, T[]> {
  const result = {} as Record<U, T[]>;

  for (const item of arr) {
    const key = fn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }

  return result;
}

/**
 * Get difference between arrays
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.difference([1, 2, 3], [2, 4]) // [1, 3]
 * ```
 */
export function difference<T>(arr: readonly T[], ...values: readonly (readonly T[])[]): T[] {
  const sets = values.map((v) => new Set(v));
  return arr.filter((item) => !sets.some((set) => set.has(item)));
}

/**
 * Get intersection of arrays
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.intersection([1, 2, 3], [2, 3, 4]) // [2, 3]
 * ```
 */
export function intersection<T>(arr: readonly T[], ...values: readonly (readonly T[])[]): T[] {
  const sets = values.map((v) => new Set(v));
  return arr.filter((item) => sets.every((set) => set.has(item)));
}

/**
 * Get union of arrays
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.union([1, 2], [2, 3], [3, 4]) // [1, 2, 3, 4]
 * ```
 */
export function union<T>(...arrs: readonly (readonly T[])[]): T[] {
  return unique(arrs.flat());
}

/**
 * Remove falsy values
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.compact([0, 1, false, 2, '', 3]) // [1, 2, 3]
 * ```
 */
export function compact<T>(arr: readonly (T | undefined | null | false | '' | 0)[]): T[] {
  return arr.filter(Boolean) as T[];
}

/**
 * Concatenate arrays
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.concat([1, 2], [3, 4]) // [1, 2, 3, 4]
 * ```
 */
export function concat<T>(...arrs: readonly (readonly T[])[]): T[] {
  return arrs.flat();
}

/**
 * Slice array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.slice([1, 2, 3, 4], 1, 3) // [2, 3]
 * ```
 */
export function slice<T>(arr: readonly T[], start?: number, end?: number): T[] {
  return arr.slice(start, end);
}

/**
 * Find item in array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.find([1, 2, 3], x => x === 2) // 2
 * ```
 */
export function find<T>(arr: readonly T[], predicate: (item: T, index: number) => boolean): T | undefined {
  return arr.find(predicate);
}

/**
 * Find index of item
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.findIndex([1, 2, 3], x => x === 2) // 1
 * ```
 */
export function findIndex<T>(arr: readonly T[], predicate: (item: T, index: number) => boolean): number {
  return arr.findIndex(predicate);
}

/**
 * Find last item in array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.findLast([1, 2, 3], x => x < 3) // 2
 * ```
 */
export function findLast<T>(arr: readonly T[], predicate: (item: T, index: number) => boolean): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];
    if (item !== undefined && predicate(item, i)) {
      return item;
    }
  }
  return undefined;
}

/**
 * Find last index of item
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.findLastIndex([1, 2, 3, 2], x => x === 2) // 3
 * ```
 */
export function findLastIndex<T>(arr: readonly T[], predicate: (item: T, index: number) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];
    if (item !== undefined && predicate(item, i)) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if item exists in array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.includes([1, 2, 3], 2) // true
 * ```
 */
export function includes<T>(arr: readonly T[], item: T): boolean {
  return arr.includes(item);
}

/**
 * Filter array by predicate
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.filter([1, 2, 3], x => x > 1) // [2, 3]
 * ```
 */
export function filter<T>(arr: readonly T[], predicate: (item: T, index: number) => boolean): T[] {
  return arr.filter(predicate);
}

/**
 * Map array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.map([1, 2, 3], x => x * 2) // [2, 4, 6]
 * ```
 */
export function map<T, U>(arr: readonly T[], fn: (item: T, index: number) => U): U[] {
  return arr.map(fn);
}

/**
 * Reduce array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.reduce([1, 2, 3], (sum, x) => sum + x, 0) // 6
 * ```
 */
export function reduce<T, U>(
  arr: readonly T[],
  fn: (acc: U, item: T, index: number) => U,
  initial: U
): U {
  return arr.reduce(fn, initial);
}

/**
 * Reduce array from right
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.reduceRight([1, 2, 3], (sum, x) => sum + x, 0) // 6
 * ```
 */
export function reduceRight<T, U>(
  arr: readonly T[],
  fn: (acc: U, item: T, index: number) => U,
  initial: U
): U {
  return arr.reduceRight(fn, initial);
}

/**
 * For each item in array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.forEach([1, 2, 3], x => console.log(x))
 * ```
 */
export function forEach<T>(arr: readonly T[], fn: (item: T, index: number) => void): void {
  arr.forEach(fn);
}

/**
 * Check if all items match predicate
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.every([1, 2, 3], x => x > 0) // true
 * ```
 */
export function every<T>(arr: readonly T[], predicate: (item: T, index: number) => boolean): boolean {
  return arr.every(predicate);
}

/**
 * Check if any item matches predicate
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.some([1, 2, 3], x => x > 2) // true
 * ```
 */
export function some<T>(arr: readonly T[], predicate: (item: T, index: number) => boolean): boolean {
  return arr.some(predicate);
}

/**
 * Join array elements
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.join([1, 2, 3], ', ') // '1, 2, 3'
 * ```
 */
export function join<T>(arr: readonly T[], separator = ','): string {
  return arr.join(separator);
}

/**
 * Get sum of numbers
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.sum([1, 2, 3, 4]) // 10
 * ```
 */
export function sum(arr: readonly number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

/**
 * Get average of numbers
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.average([1, 2, 3, 4, 5]) // 3
 * ```
 */
export function average(arr: readonly number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/**
 * Get min value
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.min([3, 1, 2]) // 1
 * ```
 */
export function min(arr: readonly number[]): number | undefined {
  return arr.length === 0 ? undefined : Math.min(...arr);
}

/**
 * Get max value
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.max([1, 3, 2]) // 3
 * ```
 */
export function max(arr: readonly number[]): number | undefined {
  return arr.length === 0 ? undefined : Math.max(...arr);
}

/**
 * Get min and max values
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.minMax([1, 3, 2]) // { min: 1, max: 3 }
 * ```
 */
export function minMax(arr: readonly number[]): { min: number; max: number } | undefined {
  if (arr.length === 0) return undefined;
  return { min: Math.min(...arr), max: Math.max(...arr) };
}

/**
 * Create array with range of numbers
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.range(3) // [0, 1, 2]
 * array.range(1, 4) // [1, 2, 3]
 * ```
 */
export function range(stop: number, start = 0, step = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < stop; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Pick items from array by indices
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.pick([1, 2, 3, 4], [0, 2]) // [1, 3]
 * ```
 */
export function pick<T>(arr: readonly T[], indices: readonly number[]): T[] {
  return indices.map((i) => arr[i]).filter((x): x is T => x !== undefined);
}

/**
 * Omit items from array by indices
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.omit([1, 2, 3, 4], [1, 3]) // [1, 3]
 * ```
 */
export function omit<T>(arr: readonly T[], indices: readonly number[]): T[] {
  const set = new Set(indices);
  return arr.filter((_, i) => !set.has(i));
}

/**
 * Move item from one index to another
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.move([1, 2, 3, 4], 0, 2) // [2, 3, 1, 4]
 * ```
 */
export function move<T>(arr: readonly T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  if (item !== undefined) {
    result.splice(to, 0, item);
  }
  return result;
}

/**
 * Insert item at index
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.insert([1, 2, 4], 2, 3) // [1, 2, 3, 4]
 * ```
 */
export function insert<T>(arr: readonly T[], index: number, ...items: T[]): T[] {
  const result = [...arr];
  result.splice(index, 0, ...items);
  return result;
}

/**
 * Remove item at index
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.remove([1, 2, 3, 4], 2) // [1, 2, 4]
 * ```
 */
export function remove<T>(arr: readonly T[], index: number, count = 1): T[] {
  const result = [...arr];
  result.splice(index, count);
  return result;
}

/**
 * Replace item at index
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.replace([1, 2, 3], 1, 5) // [1, 5, 3]
 * ```
 */
export function replace<T>(arr: readonly T[], index: number, item: T): T[] {
  const result = [...arr];
  result[index] = item;
  return result;
}

/**
 * Get random item from array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.sample([1, 2, 3, 4]) // 2 (random)
 * ```
 */
export function sample<T>(arr: readonly T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random items from array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.sampleSize([1, 2, 3, 4], 2) // [2, 4] (random)
 * ```
 */
export function sampleSize<T>(arr: readonly T[], n: number): T[] {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Partition array by predicate
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.partition([1, 2, 3, 4], x => x > 2) // [[3, 4], [1, 2]]
 * ```
 */
export function partition<T>(arr: readonly T[], predicate: (item: T) => boolean): [T[], T[]] {
  const matched: T[] = [];
  const unmatched: T[] = [];

  for (const item of arr) {
    if (predicate(item)) {
      matched.push(item);
    } else {
      unmatched.push(item);
    }
  }

  return [matched, unmatched];
}

/**
 * Count items matching predicate
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.countBy([1, 2, 3, 4], x => x > 2) // 2
 * ```
 */
export function countBy<T>(arr: readonly T[], predicate: (item: T) => boolean): number {
  return arr.filter(predicate).length;
}

/**
 * Zip arrays together
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.zip([1, 2], ['a', 'b']) // [[1, 'a'], [2, 'b']]
 * ```
 */
export function zip<T, U>(arr1: readonly T[], arr2: readonly U[]): [T, U][] {
  const length = Math.min(arr1.length, arr2.length);
  const result: [T, U][] = [];

  for (let i = 0; i < length; i++) {
    const a = arr1[i];
    const b = arr2[i];
    if (a !== undefined && b !== undefined) {
      result.push([a, b]);
    }
  }

  return result;
}

/**
 * Zip arrays with function
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.zipWith([1, 2], ['a', 'b'], (a, b) => a + b) // ['1a', '2b']
 * ```
 */
export function zipWith<T, U, V>(
  arr1: readonly T[],
  arr2: readonly U[],
  fn: (a: T, b: U) => V
): V[] {
  const length = Math.min(arr1.length, arr2.length);
  const result: V[] = [];

  for (let i = 0; i < length; i++) {
    const a = arr1[i];
    const b = arr2[i];
    if (a !== undefined && b !== undefined) {
      result.push(fn(a, b));
    }
  }

  return result;
}

/**
 * Unzip array of pairs
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.unzip([[1, 'a'], [2, 'b']]) // [[1, 2], ['a', 'b']]
 * ```
 */
export function unzip<T, U>(arr: readonly (readonly [T, U])[]): [T[], U[]] {
  const arr1: T[] = [];
  const arr2: U[] = [];

  for (const [a, b] of arr) {
    arr1.push(a);
    arr2.push(b);
  }

  return [arr1, arr2];
}

/**
 * Check if arrays are equal
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.equals([1, 2], [1, 2]) // true
 * array.equals([1, 2], [1, 3]) // false
 * ```
 */
export function equals<T>(arr1: readonly T[], arr2: readonly T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

/**
 * Rotate array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.rotate([1, 2, 3, 4], 2) // [3, 4, 1, 2]
 * ```
 */
export function rotate<T>(arr: readonly T[], n: number): T[] {
  const len = arr.length;
  if (len === 0) return [];
  const offset = ((n % len) + len) % len;
  return [...arr.slice(offset), ...arr.slice(0, offset)];
}

/**
 * Permutations of array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.permutations([1, 2, 3])
 * // [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
 * ```
 */
export function permutations<T>(arr: readonly T[]): T[][] {
  if (arr.length === 0) return [[]];
  if (arr.length === 1) {
    const first = arr[0];
    return first !== undefined ? [[first]] : [[]];
  }

  const result: T[][] = [];

  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    if (current === undefined) continue;

    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const remainingPerms = permutations(remaining);

    for (const perm of remainingPerms) {
      result.push([current, ...perm]);
    }
  }

  return result;
}

/**
 * Combinations of array
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.combinations([1, 2, 3], 2) // [[1, 2], [1, 3], [2, 3]]
 * ```
 */
export function combinations<T>(arr: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  if (k === arr.length) return [[...arr]];

  const result: T[][] = [];

  for (let i = 0; i <= arr.length - k; i++) {
    const head = arr[i];
    if (head === undefined) continue;

    const tailCombos = combinations(arr.slice(i + 1), k - 1);

    for (const combo of tailCombos) {
      result.push([head, ...combo]);
    }
  }

  return result;
}

/**
 * Cartesian product of arrays
 *
 * @example
 * ```typescript
 * import { array } from '@oxog/kit/utils';
 *
 * array.cartesian([1, 2], ['a', 'b'])
 * // [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
 * ```
 */
export function cartesian<T>(...arrs: readonly (readonly T[])[]): T[][] {
  if (arrs.length === 0) return [[]];
  const first = arrs[0];
  if (arrs.length === 1) {
    return first ? first.map((item) => [item]) : [];
  }

  const rest = arrs.slice(1);
  const restProduct = cartesian(...rest);

  const result: T[][] = [];

  if (first) {
    for (const item of first) {
      for (const combo of restProduct) {
        result.push([item, ...combo]);
      }
    }
  }

  return result;
}
