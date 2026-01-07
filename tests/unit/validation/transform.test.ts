/**
 * Tests for transform module
 */
import { describe, it, expect } from 'vitest';
import {
  pipeline,
  TransformPipeline,
  string,
  number,
  array,
  object,
  date,
  cast,
  Transformer,
  transformer,
} from '@oxog/kit/validation';

describe('TransformPipeline', () => {
  it('should create an empty pipeline', () => {
    const pipe = new TransformPipeline();
    expect(pipe.transforms).toEqual([]);
  });

  it('should add transforms with pipe()', () => {
    const pipe = new TransformPipeline<string, string>()
      .pipe((x: string) => x.toUpperCase())
      .pipe((x: string) => x + '!');

    expect(pipe.transforms.length).toBe(2);
  });

  it('should execute transforms in order', () => {
    const pipe = new TransformPipeline<number, number>()
      .pipe((x: number) => x + 1)
      .pipe((x: number) => x * 2);

    expect(pipe.execute(5)).toBe(12); // (5 + 1) * 2 = 12
  });

  it('should create reusable function with toFunction()', () => {
    const pipe = new TransformPipeline<string, string>()
      .pipe((x: string) => x.trim())
      .pipe((x: string) => x.toLowerCase());

    const fn = pipe.toFunction();
    expect(fn('  HELLO  ')).toBe('hello');
    expect(fn('  WORLD  ')).toBe('world');
  });
});

describe('pipeline', () => {
  it('should create pipeline from transforms', () => {
    const pipe = pipeline<string, string>(
      (x: string) => x.toUpperCase(),
      (x: string) => x + '!'
    );

    expect(pipe.execute('hello')).toBe('HELLO!');
  });

  it('should handle type transformations', () => {
    const pipe = pipeline<string, number>(
      (x: string) => parseInt(x, 10),
      (x: number) => x * 2
    );

    expect(pipe.execute('5')).toBe(10);
  });
});

describe('string transforms', () => {
  describe('lowercase', () => {
    it('should convert to lowercase', () => {
      const transform = string.lowercase();
      expect(transform('HELLO')).toBe('hello');
      expect(transform('Hello World')).toBe('hello world');
    });
  });

  describe('uppercase', () => {
    it('should convert to uppercase', () => {
      const transform = string.uppercase();
      expect(transform('hello')).toBe('HELLO');
      expect(transform('Hello World')).toBe('HELLO WORLD');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      const transform = string.capitalize();
      expect(transform('hello')).toBe('Hello');
      expect(transform('HELLO')).toBe('HELLO');
      expect(transform('hello world')).toBe('Hello world');
    });
  });

  describe('trim', () => {
    it('should trim whitespace', () => {
      const transform = string.trim();
      expect(transform('  hello  ')).toBe('hello');
      expect(transform('\t\nhello\n\t')).toBe('hello');
    });
  });

  describe('removeWhitespace', () => {
    it('should remove all whitespace', () => {
      const transform = string.removeWhitespace();
      expect(transform('hello world')).toBe('helloworld');
      expect(transform('  hello   world  ')).toBe('helloworld');
    });
  });

  describe('replace', () => {
    it('should replace text', () => {
      const transform = string.replace('world', 'universe');
      expect(transform('hello world')).toBe('hello universe');
    });

    it('should support regex replacement', () => {
      const transform = string.replace(/\d+/g, 'X');
      expect(transform('test123test456')).toBe('testXtestX');
    });
  });

  describe('truncate', () => {
    it('should truncate to length', () => {
      const transform = string.truncate(5);
      expect(transform('hello world')).toBe('hello...');
    });

    it('should use custom suffix', () => {
      const transform = string.truncate(5, '…');
      expect(transform('hello world')).toBe('hello…');
    });

    it('should not truncate if within limit', () => {
      const transform = string.truncate(20);
      expect(transform('hello')).toBe('hello');
    });
  });

  describe('slugify', () => {
    it('should create URL-safe slug', () => {
      const transform = string.slugify();
      expect(transform('Hello World')).toBe('hello-world');
      expect(transform('  Hello   World  ')).toBe('hello-world');
      expect(transform('Hello_World!')).toBe('hello-world');
    });
  });

  describe('camelCase', () => {
    it('should convert to camelCase', () => {
      const transform = string.camelCase();
      expect(transform('hello world')).toBe('helloWorld');
      expect(transform('Hello World')).toBe('helloWorld');
    });
  });

  describe('kebabCase', () => {
    it('should convert to kebab-case', () => {
      const transform = string.kebabCase();
      expect(transform('helloWorld')).toBe('hello-world');
      expect(transform('hello_world')).toBe('hello-world');
      expect(transform('hello world')).toBe('hello-world');
    });
  });

  describe('snakeCase', () => {
    it('should convert to snake_case', () => {
      const transform = string.snakeCase();
      expect(transform('helloWorld')).toBe('hello_world');
      expect(transform('hello-world')).toBe('hello_world');
      expect(transform('hello world')).toBe('hello_world');
    });
  });

  describe('pascalCase', () => {
    it('should convert to PascalCase', () => {
      const transform = string.pascalCase();
      expect(transform('hello world')).toBe('HelloWorld');
    });
  });
});

describe('number transforms', () => {
  describe('round', () => {
    it('should round to digits', () => {
      expect(number.round()(3.7)).toBe(4);
      expect(number.round(2)(3.14159)).toBe(3.14);
      expect(number.round(1)(3.75)).toBe(3.8);
    });
  });

  describe('floor', () => {
    it('should floor numbers', () => {
      expect(number.floor()(3.9)).toBe(3);
      expect(number.floor()(-3.1)).toBe(-4);
    });
  });

  describe('ceil', () => {
    it('should ceil numbers', () => {
      expect(number.ceil()(3.1)).toBe(4);
      expect(number.ceil()(-3.9)).toBe(-3);
    });
  });

  describe('abs', () => {
    it('should return absolute value', () => {
      expect(number.abs()(-5)).toBe(5);
      expect(number.abs()(5)).toBe(5);
    });
  });

  describe('clamp', () => {
    it('should clamp between min and max', () => {
      const transform = number.clamp(0, 100);
      expect(transform(-10)).toBe(0);
      expect(transform(50)).toBe(50);
      expect(transform(150)).toBe(100);
    });
  });

  describe('arithmetic operations', () => {
    it('should add', () => {
      expect(number.add(5)(10)).toBe(15);
    });

    it('should subtract', () => {
      expect(number.subtract(5)(10)).toBe(5);
    });

    it('should multiply', () => {
      expect(number.multiply(3)(10)).toBe(30);
    });

    it('should divide', () => {
      expect(number.divide(2)(10)).toBe(5);
    });

    it('should modulo', () => {
      expect(number.modulo(3)(10)).toBe(1);
    });
  });

  describe('toString', () => {
    it('should convert to string', () => {
      expect(number.toString()(255)).toBe('255');
      expect(number.toString(16)(255)).toBe('ff');
      expect(number.toString(2)(5)).toBe('101');
    });
  });

  describe('format', () => {
    it('should format with locale', () => {
      const transform = number.format('en-US');
      expect(transform(1234567)).toBe('1,234,567');
    });
  });
});

describe('array transforms', () => {
  describe('map', () => {
    it('should map over array', () => {
      const transform = array.map<number, number>((x) => x * 2);
      expect(transform([1, 2, 3])).toEqual([2, 4, 6]);
    });
  });

  describe('filter', () => {
    it('should filter array', () => {
      const transform = array.filter<number>((x) => x > 2);
      expect(transform([1, 2, 3, 4])).toEqual([3, 4]);
    });
  });

  describe('reduce', () => {
    it('should reduce array', () => {
      const transform = array.reduce<number, number>((acc, x) => acc + x, 0);
      expect(transform([1, 2, 3, 4])).toBe(10);
    });
  });

  describe('reverse', () => {
    it('should reverse array without mutating', () => {
      const original = [1, 2, 3];
      const transform = array.reverse<number>();
      expect(transform(original)).toEqual([3, 2, 1]);
      expect(original).toEqual([1, 2, 3]); // Original unchanged
    });
  });

  describe('sort', () => {
    it('should sort array without mutating', () => {
      const original = [3, 1, 2];
      const transform = array.sort<number>();
      expect(transform(original)).toEqual([1, 2, 3]);
      expect(original).toEqual([3, 1, 2]); // Original unchanged
    });

    it('should support custom comparator', () => {
      const transform = array.sort<number>((a, b) => b - a);
      expect(transform([1, 2, 3])).toEqual([3, 2, 1]);
    });
  });

  describe('flatten', () => {
    it('should flatten nested arrays', () => {
      const transform = array.flatten<number>();
      expect(transform([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });
  });

  describe('unique', () => {
    it('should return unique values', () => {
      const transform = array.unique<number>();
      expect(transform([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
    });
  });

  describe('chunk', () => {
    it('should chunk array', () => {
      const transform = array.chunk<number>(2);
      expect(transform([1, 2, 3, 4, 5])).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('take', () => {
    it('should take first n elements', () => {
      const transform = array.take<number>(3);
      expect(transform([1, 2, 3, 4, 5])).toEqual([1, 2, 3]);
    });
  });

  describe('skip', () => {
    it('should skip first n elements', () => {
      const transform = array.skip<number>(2);
      expect(transform([1, 2, 3, 4, 5])).toEqual([3, 4, 5]);
    });
  });

  describe('first', () => {
    it('should return first element', () => {
      const transform = array.first<number>();
      expect(transform([1, 2, 3])).toBe(1);
      expect(transform([])).toBe(undefined);
    });
  });

  describe('last', () => {
    it('should return last element', () => {
      const transform = array.last<number>();
      expect(transform([1, 2, 3])).toBe(3);
      expect(transform([])).toBe(undefined);
    });
  });
});

describe('object transforms', () => {
  describe('pick', () => {
    it('should pick specified keys', () => {
      const transform = object.pick<{ a: number; b: number; c: number }, 'a' | 'b'>('a', 'b');
      expect(transform({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, b: 2 });
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const transform = object.omit<{ a: number; b: number; c: number }, 'c'>('c');
      expect(transform({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, b: 2 });
    });
  });

  describe('mapValues', () => {
    it('should map values', () => {
      const transform = object.mapValues<{ a: number; b: number }, number>((v) => (v as number) * 2);
      expect(transform({ a: 1, b: 2 })).toEqual({ a: 2, b: 4 });
    });
  });

  describe('mapKeys', () => {
    it('should map keys', () => {
      const transform = object.mapKeys<{ a: number; b: number }>((k) => `_${String(k)}`);
      expect(transform({ a: 1, b: 2 })).toEqual({ _a: 1, _b: 2 });
    });
  });

  describe('merge', () => {
    it('should merge objects', () => {
      const transform = object.merge<{ a: number; b: number }>({ b: 3 });
      expect(transform({ a: 1, b: 2 })).toEqual({ a: 1, b: 3 });
    });
  });

  describe('clone', () => {
    it('should deep clone object', () => {
      const transform = object.clone<{ a: { b: number } }>();
      const original = { a: { b: 1 } };
      const cloned = transform(original);
      cloned.a.b = 2;
      expect(original.a.b).toBe(1);
    });
  });
});

describe('date transforms', () => {
  describe('format', () => {
    it('should format as ISO', () => {
      const transform = date.format('ISO');
      const d = new Date('2025-01-15T10:30:00Z');
      expect(transform(d)).toBe('2025-01-15T10:30:00.000Z');
    });

    it('should accept string input', () => {
      const transform = date.format('ISO');
      expect(transform('2025-01-15T10:30:00Z')).toBe('2025-01-15T10:30:00.000Z');
    });
  });

  describe('add', () => {
    it('should add milliseconds', () => {
      const transform = date.add(1000); // 1 second
      const d = new Date('2025-01-15T10:30:00Z');
      expect(transform(d).toISOString()).toBe('2025-01-15T10:30:01.000Z');
    });
  });

  describe('subtract', () => {
    it('should subtract milliseconds', () => {
      const transform = date.subtract(1000); // 1 second
      const d = new Date('2025-01-15T10:30:00Z');
      expect(transform(d).toISOString()).toBe('2025-01-15T10:29:59.000Z');
    });
  });

  describe('startOfDay', () => {
    it('should return start of day', () => {
      const transform = date.startOfDay();
      const d = new Date('2025-01-15T15:45:30');
      const result = transform(d);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('endOfDay', () => {
    it('should return end of day', () => {
      const transform = date.endOfDay();
      const d = new Date('2025-01-15T10:30:00');
      const result = transform(d);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('startOfMonth', () => {
    it('should return start of month', () => {
      const transform = date.startOfMonth();
      const d = new Date('2025-01-15T15:45:30');
      const result = transform(d);
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
    });
  });

  describe('endOfMonth', () => {
    it('should return end of month', () => {
      const transform = date.endOfMonth();
      const d = new Date('2025-01-15T10:30:00');
      const result = transform(d);
      expect(result.getDate()).toBe(31);
      expect(result.getHours()).toBe(23);
    });
  });
});

describe('cast transforms', () => {
  describe('toString', () => {
    it('should convert to string', () => {
      expect(cast.toString()(123)).toBe('123');
      expect(cast.toString()(true)).toBe('true');
      expect(cast.toString()(null)).toBe('null');
    });
  });

  describe('toNumber', () => {
    it('should convert to number', () => {
      expect(cast.toNumber()('123')).toBe(123);
      expect(cast.toNumber()('3.14')).toBe(3.14);
    });
  });

  describe('toBoolean', () => {
    it('should convert to boolean', () => {
      expect(cast.toBoolean()('true')).toBe(true);
      expect(cast.toBoolean()('false')).toBe(false);
      expect(cast.toBoolean()('0')).toBe(false);
      expect(cast.toBoolean()(1)).toBe(true);
      expect(cast.toBoolean()(0)).toBe(false);
    });
  });

  describe('toDate', () => {
    it('should convert to date', () => {
      const result = cast.toDate()('2025-01-15');
      expect(result instanceof Date).toBe(true);
    });

    it('should pass through Date objects', () => {
      const d = new Date();
      expect(cast.toDate()(d)).toBe(d);
    });
  });

  describe('toArray', () => {
    it('should convert to array', () => {
      expect(cast.toArray()('hello')).toEqual(['hello']);
      expect(cast.toArray()([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('parseJSON', () => {
    it('should parse JSON string', () => {
      expect(cast.parseJSON()('{"a":1}')).toEqual({ a: 1 });
      expect(cast.parseJSON()('[1,2,3]')).toEqual([1, 2, 3]);
    });
  });

  describe('stringifyJSON', () => {
    it('should stringify to JSON', () => {
      expect(cast.stringifyJSON()({ a: 1 })).toBe('{"a":1}');
    });

    it('should support indentation', () => {
      expect(cast.stringifyJSON(2)({ a: 1 })).toBe('{\n  "a": 1\n}');
    });
  });
});

describe('Transformer', () => {
  it('should chain transforms with pipe()', () => {
    const t = new Transformer<string, string>()
      .pipe((x: string) => x.toUpperCase())
      .pipe((x: string) => x + '!');

    expect(t.transform('hello')).toBe('HELLO!');
  });

  it('should create reusable function', () => {
    const t = new Transformer<number, number>()
      .pipe((x: number) => x + 1)
      .pipe((x: number) => x * 2);

    const fn = t.toFunction();
    expect(fn(5)).toBe(12);
    expect(fn(10)).toBe(22);
  });
});

describe('transformer', () => {
  it('should create transformer with initial transform', () => {
    const t = transformer<string, string>((x) => x.toUpperCase());
    expect(t.transform('hello')).toBe('HELLO');
  });

  it('should allow chaining after creation', () => {
    const t = transformer<string, string>((x) => x.trim())
      .pipe((x) => x.toUpperCase());

    expect(t.transform('  hello  ')).toBe('HELLO');
  });
});

describe('complex pipelines', () => {
  it('should handle multi-step string transformations', () => {
    const pipe = pipeline<string, string>(
      string.trim(),
      string.lowercase(),
      string.slugify()
    );

    expect(pipe.execute('  Hello World!  ')).toBe('hello-world');
  });

  it('should handle multi-step number transformations', () => {
    const pipe = pipeline<number, number>(
      number.abs(),
      number.multiply(100),
      number.round(2)
    );

    expect(pipe.execute(-0.1234)).toBe(12.34);
  });

  it('should handle type changes in pipeline', () => {
    const pipe = pipeline<number, string>(
      number.round(2),
      number.format('en-US')
    );

    expect(pipe.execute(1234567.8912)).toBe('1,234,567.89');
  });
});
