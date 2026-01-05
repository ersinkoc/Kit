/**
 * Tests for object utility module
 */
import { describe, it, expect } from 'vitest';
import { object } from '@oxog/kit/utils';

describe('object utilities', () => {
  describe('keys/values/entries', () => {
    it('keys returns object keys', () => {
      expect(object.keys({ a: 1, b: 2 })).toEqual(['a', 'b']);
    });

    it('values returns object values', () => {
      expect(object.values({ a: 1, b: 2 })).toEqual([1, 2]);
    });

    it('entries returns key-value pairs', () => {
      expect(object.entries({ a: 1, b: 2 })).toEqual([['a', 1], ['b', 2]]);
    });
  });

  describe('isEmpty', () => {
    it('checks if object is empty', () => {
      expect(object.isEmpty({})).toBe(true);
      expect(object.isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('identifies plain objects', () => {
      expect(object.isPlainObject({})).toBe(true);
      expect(object.isPlainObject({ a: 1 })).toBe(true);
      expect(object.isPlainObject([])).toBe(false);
      expect(object.isPlainObject(null)).toBe(false);
    });
  });

  describe('clone', () => {
    it('deep clones objects', () => {
      const original = { a: { b: { c: 1 } } };
      const cloned = object.clone(original);
      cloned.a.b.c = 2;
      expect(original.a.b.c).toBe(1);
    });
  });

  describe('merge', () => {
    it('merges objects', () => {
      expect(object.merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
    });

    it('merges deeply', () => {
      expect(object.merge({ a: { x: 1 } }, { a: { y: 2 } })).toEqual({ a: { x: 1, y: 2 } });
    });
  });

  describe('pick/omit', () => {
    it('pick selects keys', () => {
      expect(object.pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('omit excludes keys', () => {
      expect(object.omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('get/set/has/unset', () => {
    it('get retrieves nested value', () => {
      expect(object.get({ a: { b: { c: 1 } } }, 'a.b.c')).toBe(1);
      expect(object.get({ a: { b: { c: 1 } } }, 'a.x.y', 'default')).toBe('default');
    });

    it('set sets nested value', () => {
      const obj = { a: {} } as Record<string, unknown>;
      object.set(obj, 'a.b.c', 1);
      expect((obj.a as Record<string, Record<string, number>>).b.c).toBe(1);
    });

    it('has checks if path exists', () => {
      expect(object.has({ a: { b: { c: 1 } } }, 'a.b.c')).toBe(true);
      expect(object.has({ a: { b: { c: 1 } } }, 'a.x.y')).toBe(false);
    });

    it('unset deletes nested value', () => {
      const obj = { a: { b: { c: 1 } } };
      expect(object.unset(obj, 'a.b.c')).toBe(true);
      expect((obj.a.b as Record<string, unknown>).c).toBe(undefined);
    });
  });

  describe('toPairs/fromPairs', () => {
    it('toPairs converts to pairs', () => {
      expect(object.toPairs({ a: 1, b: 2 })).toEqual([['a', 1], ['b', 2]]);
    });

    it('fromPairs converts from pairs', () => {
      expect(object.fromPairs([['a', 1], ['b', 2]])).toEqual({ a: 1, b: 2 });
    });
  });

  describe('invert', () => {
    it('inverts keys and values', () => {
      expect(object.invert({ a: 'x', b: 'y' })).toEqual({ x: 'a', y: 'b' });
    });
  });

  describe('mapValues/mapKeys', () => {
    it('mapValues transforms values', () => {
      expect(object.mapValues({ a: 1, b: 2 }, (x) => (x as number) * 2)).toEqual({ a: 2, b: 4 });
    });

    it('mapKeys transforms keys', () => {
      expect(object.mapKeys({ a: 1, b: 2 }, (_, k) => String(k).toUpperCase())).toEqual({ A: 1, B: 2 });
    });
  });

  describe('defaults', () => {
    it('defaults fills missing values', () => {
      expect(object.defaults({ a: 1 }, { a: 0, b: 0 })).toEqual({ a: 1, b: 0 });
    });
  });

  describe('isEqual', () => {
    it('compares primitives', () => {
      expect(object.isEqual(1, 1)).toBe(true);
      expect(object.isEqual(1, 2)).toBe(false);
    });

    it('compares objects deeply', () => {
      expect(object.isEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(object.isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    });
  });

  describe('size', () => {
    it('returns number of keys', () => {
      expect(object.size({ a: 1, b: 2, c: 3 })).toBe(3);
    });
  });

  describe('filter', () => {
    it('filters by predicate', () => {
      expect(object.filter({ a: 1, b: 2, c: 3 }, (x) => (x as number) > 1)).toEqual({ b: 2, c: 3 });
    });
  });

  describe('hasKey/hasValue', () => {
    it('hasKey checks key existence', () => {
      expect(object.hasKey({ a: 1 }, 'a')).toBe(true);
      expect(object.hasKey({ a: 1 }, 'b')).toBe(false);
    });

    it('hasValue checks value existence', () => {
      expect(object.hasValue({ a: 1, b: 2 }, 1)).toBe(true);
      expect(object.hasValue({ a: 1, b: 2 }, 3)).toBe(false);
    });
  });

  describe('omitUndefined/omitNull/compact', () => {
    it('omitUndefined removes undefined', () => {
      expect(object.omitUndefined({ a: 1, b: undefined, c: 3 })).toEqual({ a: 1, c: 3 });
    });

    it('omitNull removes null', () => {
      expect(object.omitNull({ a: 1, b: null, c: 3 })).toEqual({ a: 1, c: 3 });
    });

    it('compact removes null and undefined', () => {
      expect(object.compact({ a: 1, b: null, c: undefined, d: 3 })).toEqual({ a: 1, d: 3 });
    });
  });
});
