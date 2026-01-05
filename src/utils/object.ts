/**
 * Object manipulation utilities
 */

/**
 * Get object keys
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.keys({ a: 1, b: 2 }) // ['a', 'b']
 * ```
 */
export function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Get object values
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.values({ a: 1, b: 2 }) // [1, 2]
 * ```
 */
export function values<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][];
}

/**
 * Get object entries
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.entries({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 * ```
 */
export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Check if object is empty
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.isEmpty({}) // true
 * object.isEmpty({ a: 1 }) // false
 * ```
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Check if value is plain object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.isPlainObject({}) // true
 * object.isPlainObject([]) // false
 * object.isPlainObject(null) // false
 * ```
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Deep clone object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = object.clone(original);
 * ```
 */
export function clone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => clone(item)) as T;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T;
  }

  if (obj instanceof Map) {
    const cloned = new Map();
    for (const [key, value] of obj) {
      cloned.set(key, clone(value));
    }
    return cloned as T;
  }

  if (obj instanceof Set) {
    const cloned = new Set();
    for (const value of obj) {
      cloned.add(clone(value));
    }
    return cloned as T;
  }

  const cloned = {} as T;
  for (const key of Object.keys(obj)) {
    cloned[key as keyof T] = clone(obj[key as keyof T]);
  }

  return cloned;
}

/**
 * Deep merge objects
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.merge({ a: 1 }, { b: 2 }) // { a: 1, b: 2 }
 * object.merge({ a: { x: 1 } }, { a: { y: 2 } }) // { a: { x: 1, y: 2 } }
 * ```
 */
export function merge<T extends object, U extends object>(target: T, source: U): T & U {
  const result = { ...target, ...source } as T & U;

  for (const key of Object.keys(source)) {
    const sourceValue = source[key as keyof U];
    const targetValue = (target as Record<string, unknown>)[key];

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      (result as unknown as Record<string, unknown>)[key] = merge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    }
  }

  return result;
}

/**
 * Pick keys from object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 * ```
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit keys from object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.omit({ a: 1, b: 2, c: 3 }, ['b']) // { a: 1, c: 3 }
 * ```
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

/**
 * Get nested value by path
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.get({ a: { b: { c: 1 } } }, 'a.b.c') // 1
 * object.get({ a: { b: { c: 1 } } }, 'a.x.y', 'default') // 'default'
 * ```
 */
export function get<T = unknown, D = T>(
  obj: object,
  path: string,
  defaultValue?: D
): T | D {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue as D;
    }
    result = (result as Record<string, unknown>)[key];
  }

  return (result === undefined ? defaultValue : result) as T | D;
}

/**
 * Set nested value by path
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * const obj = { a: {} };
 * object.set(obj, 'a.b.c', 1);
 * // obj is { a: { b: { c: 1 } } }
 * ```
 */
export function set(obj: object, path: string, value: unknown): void {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj as Record<string, unknown>;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key === undefined) break;

    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  if (lastKey !== undefined) {
    current[lastKey] = value;
  }
}

/**
 * Check if path exists in object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.has({ a: { b: { c: 1 } } }, 'a.b.c') // true
 * object.has({ a: { b: { c: 1 } } }, 'a.x.y') // false
 * ```
 */
export function has(obj: object, path: string): boolean {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return true;
}

/**
 * Delete nested value by path
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * const obj = { a: { b: { c: 1 } } };
 * object.unset(obj, 'a.b.c');
 * // obj is { a: { b: {} } }
 * ```
 */
export function unset(obj: object, path: string): boolean {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj as Record<string, unknown>;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key === undefined) return false;
    if (current === null || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  if (lastKey === undefined) return false;
  if (current === null || typeof current !== 'object' || !(lastKey in current)) {
    return false;
  }

  delete current[lastKey];
  return true;
}

/**
 * Convert object to pairs
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.toPairs({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 * ```
 */
export function toPairs<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return entries(obj);
}

/**
 * Convert pairs to object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.fromPairs([['a', 1], ['b', 2]]) // { a: 1, b: 2 }
 * ```
 */
export function fromPairs<K extends PropertyKey, V>(pairs: readonly (readonly [K, V])[]): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const [key, value] of pairs) {
    result[key] = value;
  }
  return result;
}

/**
 * Invert object keys and values
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.invert({ a: 'x', b: 'y' }) // { x: 'a', y: 'b' }
 * ```
 */
export function invert<T extends Record<PropertyKey, PropertyKey>>(obj: T): Record<T[keyof T], keyof T> {
  const result = {} as Record<T[keyof T], keyof T>;
  for (const key of Object.keys(obj)) {
    const value = obj[key as keyof T];
    result[value] = key as keyof T;
  }
  return result;
}

/**
 * Map values of object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.mapValues({ a: 1, b: 2 }, x => x * 2) // { a: 2, b: 4 }
 * ```
 */
export function mapValues<T extends object, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;
  for (const key of Object.keys(obj)) {
    result[key as keyof T] = fn(obj[key as keyof T], key as keyof T);
  }
  return result;
}

/**
 * Map keys of object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.mapKeys({ a: 1, b: 2 }, (_, k) => k.toUpperCase()) // { A: 1, B: 2 }
 * ```
 */
export function mapKeys<T extends object, K extends PropertyKey>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => K
): Record<K, T[keyof T]> {
  const result = {} as Record<K, T[keyof T]>;
  for (const key of Object.keys(obj)) {
    const newKey = fn(obj[key as keyof T], key as keyof T);
    result[newKey] = obj[key as keyof T];
  }
  return result;
}

/**
 * Assign properties to target object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.assign({ a: 1 }, { b: 2 }, { c: 3 }) // { a: 1, b: 2, c: 3 }
 * ```
 */
export function assign<T extends object, U extends object[]>(...sources: U): T & Merge<U> {
  return Object.assign({}, ...sources) as T & Merge<U>;
}

type Merge<T extends readonly object[]> = {
  -readonly [K in keyof T[number]]: T[number][K];
};

/**
 * Create object with same keys and default values
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.defaults({ a: 1 }, { a: 0, b: 0 }) // { a: 1, b: 0 }
 * ```
 */
export function defaults<T extends object>(obj: Partial<T>, defaults: T): T {
  return { ...defaults, ...obj };
}

/**
 * Find key by value
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.findKey({ a: 1, b: 2, c: 3 }, x => x > 1) // 'b'
 * ```
 */
export function findKey<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): keyof T | undefined {
  for (const key of Object.keys(obj)) {
    if (predicate(obj[key as keyof T], key as keyof T)) {
      return key as keyof T;
    }
  }
  return undefined;
}

/**
 * Transform object to new object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.transform({ a: 1, b: 2 }, (acc, val, key) => {
 *   acc[key.toUpperCase()] = val * 2;
 * }, {}) // { A: 2, B: 4 }
 * ```
 */
export function transform<T extends object, U extends object>(
  obj: T,
  fn: (acc: U, value: T[keyof T], key: keyof T) => void,
  initial: U
): U {
  const result = initial;
  for (const key of Object.keys(obj)) {
    fn(result, obj[key as keyof T], key as keyof T);
  }
  return result;
}

/**
 * Get all property names (including inherited)
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * class Foo { a() {} }
 * Foo.prototype.b = () => {};
 * object.allKeys(new Foo()) // ['a', 'b']
 * ```
 */
export function allKeys(obj: object): string[] {
  const keys: string[] = [];
  let current = obj;

  while (current && current !== Object.prototype) {
    keys.push(...Object.keys(current));
    current = Object.getPrototypeOf(current);
  }

  return [...new Set(keys)];
}

/**
 * Get all property descriptors
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.getDescriptors({ a: 1 }) // { a: { value: 1, writable: true, ... } }
 * ```
 */
export function getDescriptors<T extends object>(obj: T): PropertyDescriptorMap {
  return Object.getOwnPropertyDescriptors(obj);
}

/**
 * Freeze object deeply
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * const obj = object.freezeDeep({ a: { b: 1 } });
 * obj.a.b = 2; // Error in strict mode
 * ```
 */
export function freezeDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  Object.freeze(obj);

  if (Array.isArray(obj)) {
    for (const item of obj) {
      freezeDeep(item);
    }
  } else {
    for (const value of Object.values(obj)) {
      freezeDeep(value);
    }
  }

  return obj;
}

/**
 * Seal object deeply
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * const obj = object.sealDeep({ a: { b: 1 } });
 * delete obj.a.b; // Error in strict mode
 * obj.a.c = 2; // Allowed
 * ```
 */
export function sealDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  Object.seal(obj);

  if (Array.isArray(obj)) {
    for (const item of obj) {
      sealDeep(item);
    }
  } else {
    for (const value of Object.values(obj)) {
      sealDeep(value);
    }
  }

  return obj;
}

/**
 * Create a shallow copy of object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * const original = { a: 1, b: { c: 2 } };
 * const copy = object.shallowClone(original);
 * copy.b.c = 3; // original.b.c is also 3
 * ```
 */
export function shallowClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return [...obj] as T;
  }

  return { ...obj };
}

/**
 * Group object keys by predicate
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.groupBy({ a: 1, b: 2, c: 3 }, (_, k) => k === 'a' ? 'first' : 'rest')
 * // { first: { a: 1 }, rest: { b: 2, c: 3 } }
 * ```
 */
export function groupByKey<T extends object, K extends PropertyKey>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => K
): Record<K, Partial<T>> {
  const result = {} as Record<K, Partial<T>>;

  for (const key of Object.keys(obj)) {
    const group = fn(obj[key as keyof T], key as keyof T);
    if (!result[group]) {
      result[group] = {};
    }
    (result[group] as Record<string, unknown>)[key] = obj[key as keyof T];
  }

  return result;
}

/**
 * Check if two objects are deeply equal
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.isEqual({ a: 1 }, { a: 1 }) // true
 * object.isEqual({ a: 1 }, { a: 2 }) // false
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

/**
 * Get size of object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.size({ a: 1, b: 2, c: 3 }) // 3
 * ```
 */
export function size(obj: object): number {
  return Object.keys(obj).length;
}

/**
 * Reduce object to single value
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.reduce({ a: 1, b: 2, c: 3 }, (sum, val) => sum + val, 0) // 6
 * ```
 */
export function reduce<T extends object, U>(
  obj: T,
  fn: (acc: U, value: T[keyof T], key: keyof T) => U,
  initial: U
): U {
  let result = initial;
  for (const key of Object.keys(obj)) {
    result = fn(result, obj[key as keyof T], key as keyof T);
  }
  return result;
}

/**
 * For each key-value pair in object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.forEach({ a: 1, b: 2 }, (val, key) => console.log(key, val))
 * ```
 */
export function forEach<T extends object>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => void
): void {
  for (const key of Object.keys(obj)) {
    fn(obj[key as keyof T], key as keyof T);
  }
}

/**
 * Filter object by predicate
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.filter({ a: 1, b: 2, c: 3 }, x => x > 1) // { b: 2, c: 3 }
 * ```
 */
export function filter<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result = {} as Partial<T>;
  for (const key of Object.keys(obj)) {
    if (predicate(obj[key as keyof T], key as keyof T)) {
      (result as Record<string, unknown>)[key] = obj[key as keyof T];
    }
  }
  return result;
}

/**
 * Check if key exists in object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.hasKey({ a: 1 }, 'a') // true
 * object.hasKey({ a: 1 }, 'b') // false
 * ```
 */
export function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T {
  return key in obj;
}

/**
 * Check if value exists in object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.hasValue({ a: 1, b: 2 }, 1) // true
 * object.hasValue({ a: 1, b: 2 }, 3) // false
 * ```
 */
export function hasValue<T extends object>(obj: T, value: unknown): boolean {
  return Object.values(obj).includes(value);
}

/**
 * Get a random key from object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.sampleKey({ a: 1, b: 2, c: 3 }) // 'b' (random)
 * ```
 */
export function sampleKey<T extends object>(obj: T): keyof T | undefined {
  const keys = Object.keys(obj) as (keyof T)[];
  return keys[Math.floor(Math.random() * keys.length)];
}

/**
 * Get a random value from object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.sampleValue({ a: 1, b: 2, c: 3 }) // 2 (random)
 * ```
 */
export function sampleValue<T extends object>(obj: T): T[keyof T] | undefined {
  const key = sampleKey(obj);
  return key !== undefined ? obj[key] : undefined;
}

/**
 * Omit undefined values from object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.omitUndefined({ a: 1, b: undefined, c: 3 }) // { a: 1, c: 3 }
 * ```
 */
export function omitUndefined<T extends object>(obj: T): T {
  const result = {} as T;
  for (const key of Object.keys(obj)) {
    const value = obj[key as keyof T];
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}

/**
 * Omit null values from object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.omitNull({ a: 1, b: null, c: 3 }) // { a: 1, c: 3 }
 * ```
 */
export function omitNull<T extends object>(obj: T): T {
  const result = {} as T;
  for (const key of Object.keys(obj)) {
    const value = obj[key as keyof T];
    if (value !== null) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}

/**
 * Omit null and undefined values from object
 *
 * @example
 * ```typescript
 * import { object } from '@oxog/kit/utils';
 *
 * object.compact({ a: 1, b: null, c: undefined, d: 3 }) // { a: 1, d: 3 }
 * ```
 */
export function compact<T extends object>(obj: T): T {
  const result = {} as T;
  for (const key of Object.keys(obj)) {
    const value = obj[key as keyof T];
    if (value != null) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}
