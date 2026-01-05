/**
 * Deep clone utilities
 * Provides comprehensive deep cloning for JavaScript values
 */

/**
 * Deep clone any value
 *
 * @example
 * ```typescript
 * import { clone } from '@oxog/kit/utils';
 *
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = clone(original);
 * cloned.b.c = 3;
 * console.log(original.b.c); // 2 (unchanged)
 * ```
 */
export function clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  if (value instanceof Map) {
    const cloned = new Map();
    for (const [key, val] of value) {
      cloned.set(clone(key), clone(val));
    }
    return cloned as T;
  }

  if (value instanceof Set) {
    const cloned = new Set();
    for (const item of value) {
      cloned.add(clone(item));
    }
    return cloned as T;
  }

  if (value instanceof ArrayBuffer) {
    const copy = new ArrayBuffer(value.byteLength);
    new Uint8Array(copy).set(new Uint8Array(value));
    return copy as T;
  }

  if (ArrayBuffer.isView(value)) {
    const bufferCopy = (value.buffer as ArrayBuffer).slice(0);
    return new (value.constructor as {
      new (buffer: ArrayBuffer, byteOffset: number, length: number): ArrayBufferView;
    })(bufferCopy, value.byteOffset, value.byteLength) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => clone(item)) as T;
  }

  const cloned = {} as T;
  for (const key of Object.keys(value)) {
    cloned[key as keyof T] = clone(value[key as keyof T]);
  }

  return cloned;
}

/**
 * Shallow clone value
 *
 * @example
 * ```typescript
 * import { clone } from '@oxog/kit/utils';
 *
 * const original = { a: 1, b: { c: 2 } };
 * const shallow = clone.shallow(original);
 * shallow.b.c = 3;
 * console.log(original.b.c); // 3 (changed - shallow copy)
 * ```
 */
export function shallow<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  if (value instanceof Map) {
    return new Map(value) as T;
  }

  if (value instanceof Set) {
    return new Set(value) as T;
  }

  if (Array.isArray(value)) {
    return [...value] as T;
  }

  return { ...value };
}

/**
 * Deep clone with custom handlers
 *
 * @example
 * ```typescript
 * import { clone } from '@oxog/kit/utils';
 *
 * class CustomClass {
 *   constructor(public value: number) {}
 * }
 *
 * const original = { custom: new CustomClass(42) };
 * const cloned = clone.withHandlers(original, {
 *   isCustom: (value) => value instanceof CustomClass,
 *   customClone: (value) => new CustomClass((value as CustomClass).value)
 * });
 * ```
 */
export function withHandlers<T>(
  value: T,
  handlers: {
    isCustom?: (value: unknown) => boolean;
    customClone?: (value: unknown) => unknown;
  } = {}
): T {
  const { isCustom, customClone } = handlers;

  const internalClone = <U>(val: U): U => {
    if (val === null || typeof val !== 'object') {
      return val;
    }

    if (isCustom && customClone && isCustom(val)) {
      return customClone(val) as U;
    }

    if (val instanceof Date) {
      return new Date(val.getTime()) as U;
    }

    if (val instanceof RegExp) {
      return new RegExp(val.source, val.flags) as U;
    }

    if (val instanceof Map) {
      const cloned = new Map();
      for (const [key, item] of val) {
        cloned.set(internalClone(key), internalClone(item));
      }
      return cloned as U;
    }

    if (val instanceof Set) {
      const cloned = new Set();
      for (const item of val) {
        cloned.add(internalClone(item));
      }
      return cloned as U;
    }

    if (Array.isArray(val)) {
      return val.map((item) => internalClone(item)) as U;
    }

    const cloned = {} as U;
    for (const key of Object.keys(val)) {
      cloned[key as keyof U] = internalClone(val[key as keyof U]);
    }

    return cloned;
  };

  return internalClone(value);
}

/**
 * Clone only specific properties
 *
 * @example
 * ```typescript
 * import { clone } from '@oxog/kit/utils';
 *
 * const original = { a: 1, b: 2, c: 3 };
 * const cloned = clone.pick(original, ['a', 'c']);
 * // { a: 1, c: 3 }
 * ```
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = clone(obj[key]);
    }
  }
  return result;
}

/**
 * Clone excluding specific properties
 *
 * @example
 * ```typescript
 * import { clone } from '@oxog/kit/utils';
 *
 * const original = { a: 1, b: 2, c: 3 };
 * const cloned = clone.omit(original, ['b']);
 * // { a: 1, c: 3 }
 * ```
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = {} as Omit<T, K>;
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key as K)) {
      (result as Record<string, unknown>)[key] = clone(obj[key as keyof T]);
    }
  }
  return result;
}

/**
 * Deep clone mutable version of readonly value
 *
 * @example
 * ```typescript
 * import { clone } from '@oxog/kit/utils';
 *
 * const readonly: Readonly<{ a: number }> = { a: 1 };
 * const mutable = clone.mutable(readonly);
 * mutable.a = 2;
 * ```
 */
export function mutable<T>(value: T): T {
  return clone(value);
}

/**
 * Deep clone readonly version of mutable value
 *
 * @example
 * ```typescript
 * import { clone } from '@oxog/kit/utils';
 *
 * const mutable = { a: 1 };
 * const readonly = clone.readonly(mutable);
 * // readonly is deeply cloned
 * ```
 */
export function readonly<T>(value: T): Readonly<T> {
  return clone(value);
}

/**
 * Clone and freeze deeply
 *
 * @example
 * ```typescript
 * import { clone } from '@oxog/kit/utils';
 *
 * const original = { a: { b: 1 } };
 * const frozen = clone.frozen(original);
 * frozen.a.b = 2; // Error in strict mode
 * ```
 */
export function frozen<T>(value: T): T {
  const cloned = clone(value);
  return deepFreeze(cloned);
}

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  Object.freeze(obj);

  if (Array.isArray(obj)) {
    for (const item of obj) {
      deepFreeze(item);
    }
  } else {
    for (const value of Object.values(obj)) {
      deepFreeze(value);
    }
  }

  return obj;
}

/**
 * Clone merging multiple values
 *
 * @example
 * ```typescript
 * import { clone } from '@oxog/kit/utils';
 *
 * const a = { x: 1, y: 1 };
 * const b = { y: 2, z: 2 };
 * const merged = clone.merge(a, b);
 * // { x: 1, y: 2, z: 2 }
 * ```
 */
export function merge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  const result = clone(target) as T & U;

  for (const key of Object.keys(source)) {
    const sourceValue = source[key as keyof U];
    const targetValue = (target as Record<string, unknown>)[key];

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      (result as Record<string, unknown>)[key] = merge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else {
      (result as Record<string, unknown>)[key] = clone(sourceValue);
    }
  }

  return result;
}
