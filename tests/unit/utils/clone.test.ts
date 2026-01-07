/**
 * Tests for clone utility module
 */
import { describe, it, expect } from 'vitest';
import { clone } from '@oxog/kit/utils';

describe('clone utilities', () => {
  describe('clone (deep)', () => {
    it('clones primitives', () => {
      expect(clone.clone(42)).toBe(42);
      expect(clone.clone('hello')).toBe('hello');
      expect(clone.clone(null)).toBe(null);
      expect(clone.clone(undefined)).toBe(undefined);
      expect(clone.clone(true)).toBe(true);
    });

    it('clones plain objects deeply', () => {
      const original = { a: { b: { c: 1 } } };
      const cloned = clone.clone(original);
      cloned.a.b.c = 2;
      expect(original.a.b.c).toBe(1);
    });

    it('clones arrays deeply', () => {
      const original = [1, [2, [3]]];
      const cloned = clone.clone(original);
      (cloned[1] as number[])[0] = 99;
      expect((original[1] as number[])[0]).toBe(2);
    });

    it('clones Date objects', () => {
      const original = new Date(2025, 0, 1);
      const cloned = clone.clone(original);
      expect(cloned).toBeInstanceOf(Date);
      expect(cloned.getTime()).toBe(original.getTime());
      cloned.setFullYear(2026);
      expect(original.getFullYear()).toBe(2025);
    });

    it('clones RegExp objects', () => {
      const original = /test/gi;
      const cloned = clone.clone(original);
      expect(cloned).toBeInstanceOf(RegExp);
      expect(cloned.source).toBe('test');
      expect(cloned.flags).toBe('gi');
    });

    it('clones Map objects', () => {
      const original = new Map([['a', { x: 1 }]]);
      const cloned = clone.clone(original);
      expect(cloned).toBeInstanceOf(Map);
      cloned.get('a')!.x = 2;
      expect(original.get('a')!.x).toBe(1);
    });

    it('clones Set objects', () => {
      const obj = { x: 1 };
      const original = new Set([obj]);
      const cloned = clone.clone(original);
      expect(cloned).toBeInstanceOf(Set);
      expect(cloned.size).toBe(1);
    });

    it('clones ArrayBuffer', () => {
      const original = new ArrayBuffer(8);
      const view = new Uint8Array(original);
      view[0] = 42;
      const cloned = clone.clone(original);
      expect(cloned).toBeInstanceOf(ArrayBuffer);
      expect(cloned.byteLength).toBe(8);
      const clonedView = new Uint8Array(cloned);
      expect(clonedView[0]).toBe(42);
    });
  });

  describe('shallow', () => {
    it('shallow clones objects', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = clone.shallow(original);
      expect(cloned).toEqual(original);
      cloned.b.c = 3;
      expect(original.b.c).toBe(3); // shallow copy
    });

    it('shallow clones arrays', () => {
      const original = [1, 2, [3]];
      const cloned = clone.shallow(original);
      (cloned[2] as number[]).push(4);
      expect((original[2] as number[])).toContain(4);
    });

    it('shallow clones Date', () => {
      const original = new Date(2025, 0, 1);
      const cloned = clone.shallow(original);
      expect(cloned.getTime()).toBe(original.getTime());
    });

    it('shallow clones Map', () => {
      const original = new Map([['a', 1]]);
      const cloned = clone.shallow(original);
      expect(cloned).toBeInstanceOf(Map);
      expect(cloned.get('a')).toBe(1);
    });

    it('shallow clones Set', () => {
      const original = new Set([1, 2, 3]);
      const cloned = clone.shallow(original);
      expect(cloned).toBeInstanceOf(Set);
      expect(cloned.size).toBe(3);
    });

    it('returns primitives as-is', () => {
      expect(clone.shallow(42)).toBe(42);
      expect(clone.shallow('hello')).toBe('hello');
      expect(clone.shallow(null)).toBe(null);
    });
  });

  describe('withHandlers', () => {
    class CustomClass {
      constructor(public value: number) {}
    }

    it('clones with custom handler', () => {
      const original = { custom: new CustomClass(42) };
      const cloned = clone.withHandlers(original, {
        isCustom: (val) => val instanceof CustomClass,
        customClone: (val) => new CustomClass((val as CustomClass).value * 2),
      });
      expect(cloned.custom.value).toBe(84);
    });

    it('falls back to standard cloning without handlers', () => {
      const original = { a: { b: 1 } };
      const cloned = clone.withHandlers(original);
      cloned.a.b = 2;
      expect(original.a.b).toBe(1);
    });
  });

  describe('pick', () => {
    it('picks and clones specific keys', () => {
      const original = { a: 1, b: { x: 2 }, c: 3 };
      const cloned = clone.pick(original, ['a', 'b']);
      expect(cloned).toEqual({ a: 1, b: { x: 2 } });
      cloned.b.x = 99;
      expect(original.b.x).toBe(2); // deep clone
    });

    it('ignores non-existent keys', () => {
      const original = { a: 1 };
      const cloned = clone.pick(original, ['a', 'b' as keyof typeof original]);
      expect(cloned).toEqual({ a: 1 });
    });
  });

  describe('omit', () => {
    it('omits and clones remaining keys', () => {
      const original = { a: 1, b: { x: 2 }, c: 3 };
      const cloned = clone.omit(original, ['b']);
      expect(cloned).toEqual({ a: 1, c: 3 });
    });

    it('deep clones omitted result', () => {
      const original = { a: { x: 1 }, b: 2 };
      const cloned = clone.omit(original, ['b']);
      cloned.a.x = 99;
      expect(original.a.x).toBe(1);
    });
  });

  describe('mutable/readonly', () => {
    it('mutable creates mutable clone', () => {
      const readonly: Readonly<{ a: number }> = { a: 1 };
      const mutable = clone.mutable(readonly);
      mutable.a = 2;
      expect(mutable.a).toBe(2);
    });

    it('readonly creates deep clone', () => {
      const mutable = { a: { b: 1 } };
      const readonlyClone = clone.readonly(mutable);
      expect(readonlyClone.a.b).toBe(1);
    });
  });

  describe('frozen', () => {
    it('creates deeply frozen clone', () => {
      const original = { a: { b: 1 } };
      const frozen = clone.frozen(original);
      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.a)).toBe(true);
    });

    it('does not modify original', () => {
      const original = { a: 1 };
      clone.frozen(original);
      expect(Object.isFrozen(original)).toBe(false);
    });
  });

  describe('merge', () => {
    it('merges objects', () => {
      const a = { x: 1, y: 1 };
      const b = { y: 2, z: 2 };
      const merged = clone.merge(a, b);
      expect(merged).toEqual({ x: 1, y: 2, z: 2 });
    });

    it('merges deeply', () => {
      const a = { nested: { x: 1, y: 1 } };
      const b = { nested: { y: 2, z: 2 } };
      const merged = clone.merge(a, b);
      expect(merged.nested).toEqual({ x: 1, y: 2, z: 2 });
    });

    it('does not modify originals', () => {
      const a = { x: 1 };
      const b = { y: 2 };
      clone.merge(a, b);
      expect(a).toEqual({ x: 1 });
      expect(b).toEqual({ y: 2 });
    });

    it('handles arrays by replacing', () => {
      const a = { arr: [1, 2] };
      const b = { arr: [3, 4, 5] };
      const merged = clone.merge(a, b);
      expect(merged.arr).toEqual([3, 4, 5]);
    });
  });
});
