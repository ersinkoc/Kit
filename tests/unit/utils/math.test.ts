/**
 * Tests for math utility module
 */
import { describe, it, expect } from 'vitest';
import { math } from '@oxog/kit/utils';

describe('math utilities', () => {
  describe('clamp/lerp/mapRange', () => {
    it('clamp clamps value', () => {
      expect(math.clamp(5, 0, 10)).toBe(5);
      expect(math.clamp(-5, 0, 10)).toBe(0);
      expect(math.clamp(15, 0, 10)).toBe(10);
    });

    it('lerp interpolates linearly', () => {
      expect(math.lerp(0, 100, 0)).toBe(0);
      expect(math.lerp(0, 100, 0.5)).toBe(50);
      expect(math.lerp(0, 100, 1)).toBe(100);
    });

    it('mapRange maps between ranges', () => {
      expect(math.mapRange(5, 0, 10, 0, 100)).toBe(50);
      expect(math.mapRange(0, 0, 10, 0, 100)).toBe(0);
      expect(math.mapRange(10, 0, 10, 0, 100)).toBe(100);
    });

    it('inRange checks range', () => {
      expect(math.inRange(5, 0, 10)).toBe(true);
      expect(math.inRange(15, 0, 10)).toBe(false);
      expect(math.inRange(10, 0, 10)).toBe(false); // exclusive max
      expect(math.inRange(5, 0)).toBe(true); // just min
    });
  });

  describe('rounding', () => {
    it('round rounds to precision', () => {
      expect(math.round(3.14159, 2)).toBe(3.14);
      expect(math.round(3.14159, 0)).toBe(3);
      expect(math.round(3.5, 0)).toBe(4);
    });

    it('ceil rounds up to precision', () => {
      expect(math.ceil(3.11, 1)).toBe(3.2);
      expect(math.ceil(3.14159, 2)).toBe(3.15);
    });

    it('floor rounds down to precision', () => {
      expect(math.floor(3.19, 1)).toBe(3.1);
      expect(math.floor(3.14159, 2)).toBe(3.14);
    });

    it('trunc truncates decimals', () => {
      expect(math.trunc(3.7)).toBe(3);
      expect(math.trunc(-3.7)).toBe(-3);
    });
  });

  describe('statistics', () => {
    it('sum adds numbers', () => {
      expect(math.sum([1, 2, 3, 4])).toBe(10);
      expect(math.sum([])).toBe(0);
    });

    it('average calculates mean', () => {
      expect(math.average([1, 2, 3, 4, 5])).toBe(3);
      expect(math.average([])).toBe(0);
    });

    it('median finds middle value', () => {
      expect(math.median([1, 2, 3, 4, 5])).toBe(3);
      expect(math.median([1, 2, 3, 4])).toBe(2.5);
      expect(math.median([])).toBe(0);
    });

    it('mode finds most frequent', () => {
      expect(math.mode([1, 2, 2, 3, 3, 3])).toBe(3);
      expect(math.mode([])).toBe(undefined);
    });

    it('min finds minimum', () => {
      expect(math.min([3, 1, 2])).toBe(1);
    });

    it('max finds maximum', () => {
      expect(math.max([1, 3, 2])).toBe(3);
    });

    it('minMax finds both', () => {
      expect(math.minMax([1, 3, 2])).toEqual({ min: 1, max: 3 });
    });

    it('stdDev calculates standard deviation', () => {
      const result = math.stdDev([1, 2, 3, 4, 5]);
      expect(result).toBeCloseTo(1.414, 2);
    });

    it('variance calculates variance', () => {
      expect(math.variance([1, 2, 3, 4, 5])).toBe(2);
    });

    it('range calculates range', () => {
      expect(math.range([1, 2, 3, 4, 5])).toBe(4);
      expect(math.range([])).toBe(0);
    });
  });

  describe('random', () => {
    it('random generates between min and max', () => {
      for (let i = 0; i < 100; i++) {
        const result = math.random(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it('randomInt generates integer', () => {
      for (let i = 0; i < 100; i++) {
        const result = math.randomInt(1, 10);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('sign/absolute', () => {
    it('abs returns absolute value', () => {
      expect(math.abs(-5)).toBe(5);
      expect(math.abs(5)).toBe(5);
    });

    it('sign returns sign', () => {
      expect(math.sign(-5)).toBe(-1);
      expect(math.sign(0)).toBe(0);
      expect(math.sign(5)).toBe(1);
    });

    it('isPositive checks positive', () => {
      expect(math.isPositive(5)).toBe(true);
      expect(math.isPositive(-5)).toBe(false);
      expect(math.isPositive(0)).toBe(false);
    });

    it('isNegative checks negative', () => {
      expect(math.isNegative(-5)).toBe(true);
      expect(math.isNegative(5)).toBe(false);
      expect(math.isNegative(0)).toBe(false);
    });

    it('isZero checks zero', () => {
      expect(math.isZero(0)).toBe(true);
      expect(math.isZero(0.0001)).toBe(false);
    });
  });

  describe('even/odd', () => {
    it('isEven checks even', () => {
      expect(math.isEven(4)).toBe(true);
      expect(math.isEven(3)).toBe(false);
    });

    it('isOdd checks odd', () => {
      expect(math.isOdd(3)).toBe(true);
      expect(math.isOdd(4)).toBe(false);
    });
  });

  describe('powers/roots', () => {
    it('pow raises to power', () => {
      expect(math.pow(2, 3)).toBe(8);
      expect(math.pow(2, 0)).toBe(1);
    });

    it('sqrt calculates square root', () => {
      expect(math.sqrt(9)).toBe(3);
      expect(math.sqrt(2)).toBeCloseTo(1.414, 2);
    });

    it('cbrt calculates cube root', () => {
      expect(math.cbrt(27)).toBe(3);
    });

    it('nthRoot calculates nth root', () => {
      expect(math.nthRoot(27, 3)).toBeCloseTo(3, 5);
      expect(math.nthRoot(16, 4)).toBeCloseTo(2, 5);
    });
  });

  describe('percent', () => {
    it('percent calculates percentage', () => {
      expect(math.percent(50, 200)).toBe(25);
      expect(math.percent(100, 100)).toBe(100);
    });

    it('fromPercent gets value from percentage', () => {
      expect(math.fromPercent(25, 200)).toBe(50);
      expect(math.fromPercent(50, 100)).toBe(50);
    });
  });

  describe('trigonometry', () => {
    it('degToRad converts degrees', () => {
      expect(math.degToRad(180)).toBeCloseTo(Math.PI, 5);
      expect(math.degToRad(90)).toBeCloseTo(Math.PI / 2, 5);
    });

    it('radToDeg converts radians', () => {
      expect(math.radToDeg(Math.PI)).toBeCloseTo(180, 5);
    });

    it('sin calculates sine', () => {
      expect(math.sin(Math.PI / 2)).toBeCloseTo(1, 5);
    });

    it('cos calculates cosine', () => {
      expect(math.cos(0)).toBe(1);
    });

    it('tan calculates tangent', () => {
      expect(math.tan(Math.PI / 4)).toBeCloseTo(1, 5);
    });

    it('asin calculates arcsine', () => {
      expect(math.asin(1)).toBeCloseTo(Math.PI / 2, 5);
    });

    it('acos calculates arccosine', () => {
      expect(math.acos(1)).toBe(0);
    });

    it('atan calculates arctangent', () => {
      expect(math.atan(1)).toBeCloseTo(Math.PI / 4, 5);
    });

    it('atan2 calculates atan2', () => {
      expect(math.atan2(1, 1)).toBeCloseTo(Math.PI / 4, 5);
    });
  });

  describe('logarithms', () => {
    it('log10 calculates base 10 log', () => {
      expect(math.log10(100)).toBe(2);
      expect(math.log10(1000)).toBe(3);
    });

    it('log calculates natural log', () => {
      expect(math.log(Math.E)).toBeCloseTo(1, 5);
    });

    it('logBase calculates arbitrary base log', () => {
      expect(math.logBase(8, 2)).toBeCloseTo(3, 5);
    });

    it('exp calculates exponential', () => {
      expect(math.exp(1)).toBeCloseTo(Math.E, 5);
    });
  });

  describe('hypot', () => {
    it('hypot calculates hypotenuse', () => {
      expect(math.hypot(3, 4)).toBe(5);
    });
  });

  describe('factorial/gcd/lcm', () => {
    it('factorial calculates factorial', () => {
      expect(math.factorial(5)).toBe(120);
      expect(math.factorial(0)).toBe(1);
      expect(math.factorial(1)).toBe(1);
      expect(math.factorial(-1)).toBe(NaN);
    });

    it('gcd calculates greatest common divisor', () => {
      expect(math.gcd(12, 18)).toBe(6);
      expect(math.gcd(7, 3)).toBe(1);
    });

    it('lcm calculates least common multiple', () => {
      expect(math.lcm(4, 6)).toBe(12);
      expect(math.lcm(0, 5)).toBe(0);
    });
  });

  describe('prime', () => {
    it('isPrime checks primality', () => {
      expect(math.isPrime(2)).toBe(true);
      expect(math.isPrime(3)).toBe(true);
      expect(math.isPrime(4)).toBe(false);
      expect(math.isPrime(7)).toBe(true);
      expect(math.isPrime(1)).toBe(false);
      expect(math.isPrime(0)).toBe(false);
    });

    it('nextPrime finds next prime', () => {
      expect(math.nextPrime(7)).toBe(11);
      expect(math.nextPrime(2)).toBe(3);
    });
  });

  describe('number checks', () => {
    it('isFinite checks finite', () => {
      expect(math.isFinite(42)).toBe(true);
      expect(math.isFinite(Infinity)).toBe(false);
      expect(math.isFinite(-Infinity)).toBe(false);
    });

    it('isInteger checks integer', () => {
      expect(math.isInteger(5)).toBe(true);
      expect(math.isInteger(5.5)).toBe(false);
    });

    it('isSafeInteger checks safe integer', () => {
      expect(math.isSafeInteger(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(math.isSafeInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    });
  });

  describe('conversions', () => {
    it('toInt converts to integer', () => {
      expect(math.toInt(3.7)).toBe(3);
      expect(math.toInt(-3.7)).toBe(-3);
    });

    it('toFloat returns float', () => {
      expect(math.toFloat(3)).toBe(3);
    });
  });

  describe('constants', () => {
    it('PI is Math.PI', () => {
      expect(math.PI).toBe(Math.PI);
    });

    it('E is Math.E', () => {
      expect(math.E).toBe(Math.E);
    });

    it('PHI is golden ratio', () => {
      expect(math.PHI).toBeCloseTo(1.618, 2);
    });
  });
});
