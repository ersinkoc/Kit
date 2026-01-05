/**
 * Tests for array utility module
 */
import { describe, it, expect } from 'vitest';
import { array } from '@oxog/kit/utils';

describe('array utilities', () => {
  describe('first/last/at', () => {
    it('first returns first element', () => {
      expect(array.first([1, 2, 3])).toBe(1);
      expect(array.first([])).toBe(undefined);
    });

    it('last returns last element', () => {
      expect(array.last([1, 2, 3])).toBe(3);
      expect(array.last([])).toBe(undefined);
    });

    it('at returns element at index', () => {
      expect(array.at([1, 2, 3], 0)).toBe(1);
      expect(array.at([1, 2, 3], 1)).toBe(2);
      expect(array.at([1, 2, 3], -1)).toBe(3);
    });
  });

  describe('isEmpty/length', () => {
    it('isEmpty checks if array is empty', () => {
      expect(array.isEmpty([])).toBe(true);
      expect(array.isEmpty([1])).toBe(false);
    });

    it('length returns array length', () => {
      expect(array.length([1, 2, 3])).toBe(3);
    });
  });

  describe('reverse/sort/sortBy', () => {
    it('reverse returns reversed array', () => {
      expect(array.reverse([1, 2, 3])).toEqual([3, 2, 1]);
    });

    it('sort returns sorted array', () => {
      expect(array.sort([3, 1, 2])).toEqual([1, 2, 3]);
    });

    it('sortBy sorts by key', () => {
      expect(array.sortBy([{ a: 2 }, { a: 1 }], (x) => x.a)).toEqual([{ a: 1 }, { a: 2 }]);
    });
  });

  describe('chunk', () => {
    it('chunks array', () => {
      expect(array.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('flatten/flattenDeep', () => {
    it('flatten flattens one level', () => {
      expect(array.flatten([[1], [2], [3]])).toEqual([1, 2, 3]);
    });

    it('flattenDeep flattens recursively', () => {
      expect(array.flattenDeep([[1], [[2]], [[[3]]]])).toEqual([1, 2, 3]);
    });
  });

  describe('unique/uniqueBy', () => {
    it('unique removes duplicates', () => {
      expect(array.unique([1, 2, 2, 3])).toEqual([1, 2, 3]);
    });

    it('uniqueBy removes by key', () => {
      expect(array.uniqueBy([{ id: 1 }, { id: 2 }, { id: 1 }], (x) => x.id)).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('groupBy', () => {
    it('groups by key', () => {
      expect(array.groupBy([{ t: 'a' }, { t: 'b' }, { t: 'a' }], (x) => x.t)).toEqual({
        a: [{ t: 'a' }, { t: 'a' }],
        b: [{ t: 'b' }],
      });
    });
  });

  describe('difference/intersection/union', () => {
    it('difference', () => expect(array.difference([1, 2, 3], [2])).toEqual([1, 3]));
    it('intersection', () => expect(array.intersection([1, 2, 3], [2, 3])).toEqual([2, 3]));
    it('union', () => expect(array.union([1, 2], [2, 3])).toEqual([1, 2, 3]));
  });

  describe('compact/concat', () => {
    it('compact removes falsy', () => expect(array.compact([0, 1, false, 2])).toEqual([1, 2]));
    it('concat joins', () => expect(array.concat([1], [2])).toEqual([1, 2]));
  });

  describe('find operations', () => {
    it('find', () => expect(array.find([1, 2, 3], (x) => x > 1)).toBe(2));
    it('findIndex', () => expect(array.findIndex([1, 2, 3], (x) => x > 1)).toBe(1));
    it('findLast', () => expect(array.findLast([1, 2, 3, 2], (x) => x === 2)).toBe(2));
    it('findLastIndex', () => expect(array.findLastIndex([1, 2, 3, 2], (x) => x === 2)).toBe(3));
  });

  describe('includes', () => {
    it('checks inclusion', () => {
      expect(array.includes([1, 2, 3], 2)).toBe(true);
      expect(array.includes([1, 2, 3], 4)).toBe(false);
    });
  });

  describe('filter/map/reduce', () => {
    it('filter', () => expect(array.filter([1, 2, 3], (x) => x > 1)).toEqual([2, 3]));
    it('map', () => expect(array.map([1, 2], (x) => x * 2)).toEqual([2, 4]));
    it('reduce', () => expect(array.reduce([1, 2, 3], (a, b) => a + b, 0)).toBe(6));
  });

  describe('every/some', () => {
    it('every', () => expect(array.every([1, 2, 3], (x) => x > 0)).toBe(true));
    it('some', () => expect(array.some([1, 2, 3], (x) => x > 2)).toBe(true));
  });

  describe('math operations', () => {
    it('sum', () => expect(array.sum([1, 2, 3])).toBe(6));
    it('average', () => expect(array.average([1, 2, 3])).toBe(2));
    it('min', () => expect(array.min([3, 1, 2])).toBe(1));
    it('max', () => expect(array.max([1, 3, 2])).toBe(3));
    it('minMax', () => expect(array.minMax([1, 3])).toEqual({ min: 1, max: 3 }));
  });

  describe('range', () => {
    it('creates range', () => expect(array.range(3)).toEqual([0, 1, 2]));
  });

  describe('pick/omit', () => {
    it('pick', () => expect(array.pick([1, 2, 3], [0, 2])).toEqual([1, 3]));
    it('omit', () => expect(array.omit([1, 2, 3], [1])).toEqual([1, 3]));
  });

  describe('move/insert/remove/replace', () => {
    it('move', () => expect(array.move([1, 2, 3], 0, 2)).toEqual([2, 3, 1]));
    it('insert', () => expect(array.insert([1, 3], 1, 2)).toEqual([1, 2, 3]));
    it('remove', () => expect(array.remove([1, 2, 3], 1)).toEqual([1, 3]));
    it('replace', () => expect(array.replace([1, 2, 3], 1, 5)).toEqual([1, 5, 3]));
  });

  describe('partition', () => {
    it('partitions', () => expect(array.partition([1, 2, 3], (x) => x > 1)).toEqual([[2, 3], [1]]));
  });

  describe('zip/unzip', () => {
    it('zip', () => expect(array.zip([1, 2], ['a', 'b'])).toEqual([[1, 'a'], [2, 'b']]));
    it('unzip', () => expect(array.unzip([[1, 'a'], [2, 'b']])).toEqual([[1, 2], ['a', 'b']]));
  });

  describe('equals', () => {
    it('checks equality', () => {
      expect(array.equals([1, 2], [1, 2])).toBe(true);
      expect(array.equals([1, 2], [1, 3])).toBe(false);
    });
  });

  describe('rotate', () => {
    it('rotates', () => expect(array.rotate([1, 2, 3, 4], 2)).toEqual([3, 4, 1, 2]));
  });

  describe('permutations/combinations/cartesian', () => {
    it('permutations', () => expect(array.permutations([1, 2])).toEqual([[1, 2], [2, 1]]));
    it('combinations', () => expect(array.combinations([1, 2, 3], 2)).toEqual([[1, 2], [1, 3], [2, 3]]));
    it('cartesian', () => expect(array.cartesian([1], ['a', 'b'])).toEqual([[1, 'a'], [1, 'b']]));
  });
});
