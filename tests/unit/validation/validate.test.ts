/**
 * Tests for validation/validate module
 * 100% coverage target
 */

import { describe, it, expect } from 'vitest';
import {
  validate,
  validateValue,
  createValidator,
  isValid,
  Validator,
  validator,
  rules,
  type Schema,
  type ValidationResult,
  type ValidationRule,
} from '../../../src/validation/validate';

describe('rules', () => {
  describe('email', () => {
    it('should validate valid emails', () => {
      const rule = rules.email();
      expect(rule.test('test@example.com')).toBe(true);
      expect(rule.test('user.name@domain.co.uk')).toBe(true);
      expect(rule.test('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      const rule = rules.email();
      expect(rule.test('invalid')).toBe(false);
      expect(rule.test('missing@domain')).toBe(false);
      expect(rule.test('@domain.com')).toBe(false);
      expect(rule.test('user@')).toBe(false);
      expect(rule.test('')).toBe(false);
    });

    it('should reject non-string values', () => {
      const rule = rules.email();
      expect(rule.test(123)).toBe(false);
      expect(rule.test(null)).toBe(false);
      expect(rule.test(undefined)).toBe(false);
    });
  });

  describe('url', () => {
    it('should validate valid URLs', () => {
      const rule = rules.url();
      expect(rule.test('https://example.com')).toBe(true);
      expect(rule.test('http://localhost:3000')).toBe(true);
      expect(rule.test('ftp://files.example.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const rule = rules.url();
      expect(rule.test('not-a-url')).toBe(false);
      expect(rule.test('example.com')).toBe(false);
      expect(rule.test('')).toBe(false);
    });

    it('should reject non-string values', () => {
      const rule = rules.url();
      expect(rule.test(123)).toBe(false);
      expect(rule.test(null)).toBe(false);
    });
  });

  describe('minLength', () => {
    it('should validate strings with minimum length', () => {
      const rule = rules.minLength(3);
      expect(rule.test('abc')).toBe(true);
      expect(rule.test('abcd')).toBe(true);
    });

    it('should reject strings shorter than minimum', () => {
      const rule = rules.minLength(3);
      expect(rule.test('ab')).toBe(false);
      expect(rule.test('')).toBe(false);
    });

    it('should validate arrays with minimum length', () => {
      const rule = rules.minLength(2);
      expect(rule.test([1, 2])).toBe(true);
      expect(rule.test([1, 2, 3])).toBe(true);
    });

    it('should reject arrays shorter than minimum', () => {
      const rule = rules.minLength(2);
      expect(rule.test([1])).toBe(false);
      expect(rule.test([])).toBe(false);
    });

    it('should reject non-string/array values', () => {
      const rule = rules.minLength(3);
      expect(rule.test(123)).toBe(false);
      expect(rule.test({})).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('should validate strings within maximum length', () => {
      const rule = rules.maxLength(5);
      expect(rule.test('abc')).toBe(true);
      expect(rule.test('abcde')).toBe(true);
    });

    it('should reject strings exceeding maximum', () => {
      const rule = rules.maxLength(5);
      expect(rule.test('abcdef')).toBe(false);
    });

    it('should validate arrays within maximum length', () => {
      const rule = rules.maxLength(3);
      expect(rule.test([1, 2])).toBe(true);
      expect(rule.test([1, 2, 3])).toBe(true);
    });

    it('should reject arrays exceeding maximum', () => {
      const rule = rules.maxLength(3);
      expect(rule.test([1, 2, 3, 4])).toBe(false);
    });

    it('should reject non-string/array values', () => {
      const rule = rules.maxLength(5);
      expect(rule.test(123)).toBe(false);
      expect(rule.test({})).toBe(false);
    });
  });

  describe('min', () => {
    it('should validate numbers at or above minimum', () => {
      const rule = rules.min(5);
      expect(rule.test(5)).toBe(true);
      expect(rule.test(10)).toBe(true);
      expect(rule.test(5.5)).toBe(true);
    });

    it('should reject numbers below minimum', () => {
      const rule = rules.min(5);
      expect(rule.test(4)).toBe(false);
      expect(rule.test(0)).toBe(false);
      expect(rule.test(-10)).toBe(false);
    });

    it('should reject non-number values', () => {
      const rule = rules.min(5);
      expect(rule.test('5')).toBe(false);
      expect(rule.test(null)).toBe(false);
    });
  });

  describe('max', () => {
    it('should validate numbers at or below maximum', () => {
      const rule = rules.max(10);
      expect(rule.test(10)).toBe(true);
      expect(rule.test(5)).toBe(true);
      expect(rule.test(-5)).toBe(true);
    });

    it('should reject numbers above maximum', () => {
      const rule = rules.max(10);
      expect(rule.test(11)).toBe(false);
      expect(rule.test(100)).toBe(false);
    });

    it('should reject non-number values', () => {
      const rule = rules.max(10);
      expect(rule.test('10')).toBe(false);
      expect(rule.test(null)).toBe(false);
    });
  });

  describe('pattern', () => {
    it('should validate strings matching pattern', () => {
      const rule = rules.pattern(/^[A-Z]{3}$/);
      expect(rule.test('ABC')).toBe(true);
      expect(rule.test('XYZ')).toBe(true);
    });

    it('should reject strings not matching pattern', () => {
      const rule = rules.pattern(/^[A-Z]{3}$/);
      expect(rule.test('abc')).toBe(false);
      expect(rule.test('ABCD')).toBe(false);
      expect(rule.test('AB')).toBe(false);
    });

    it('should use custom message', () => {
      const rule = rules.pattern(/^[A-Z]{3}$/, 'Must be 3 uppercase letters');
      expect(rule.message).toBe('Must be 3 uppercase letters');
    });

    it('should reject non-string values', () => {
      const rule = rules.pattern(/^[A-Z]{3}$/);
      expect(rule.test(123)).toBe(false);
      expect(rule.test(null)).toBe(false);
    });
  });

  describe('enum', () => {
    it('should validate values in enum', () => {
      const rule = rules.enum('a', 'b', 'c');
      expect(rule.test('a')).toBe(true);
      expect(rule.test('b')).toBe(true);
      expect(rule.test('c')).toBe(true);
    });

    it('should reject values not in enum', () => {
      const rule = rules.enum('a', 'b', 'c');
      expect(rule.test('d')).toBe(false);
      expect(rule.test('')).toBe(false);
    });

    it('should work with numbers', () => {
      const rule = rules.enum(1, 2, 3);
      expect(rule.test(1)).toBe(true);
      expect(rule.test(4)).toBe(false);
    });

    it('should work with mixed types', () => {
      const rule = rules.enum('a', 1, true);
      expect(rule.test('a')).toBe(true);
      expect(rule.test(1)).toBe(true);
      expect(rule.test(true)).toBe(true);
      expect(rule.test('b')).toBe(false);
    });
  });

  describe('required', () => {
    it('should accept non-empty values', () => {
      const rule = rules.required();
      expect(rule.test('value')).toBe(true);
      expect(rule.test(0)).toBe(true);
      expect(rule.test(false)).toBe(true);
      expect(rule.test([])).toBe(true);
      expect(rule.test({})).toBe(true);
    });

    it('should reject null, undefined, and empty string', () => {
      const rule = rules.required();
      expect(rule.test(null)).toBe(false);
      expect(rule.test(undefined)).toBe(false);
      expect(rule.test('')).toBe(false);
    });
  });
});

describe('validate', () => {
  it('should validate simple schema', () => {
    const schema: Schema = {
      name: { type: 'string', required: true },
      age: { type: 'number' },
    };

    const result = validate({ name: 'John', age: 30 }, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toEqual({ name: 'John', age: 30 });
  });

  it('should fail on missing required fields', () => {
    const schema: Schema = {
      name: { type: 'string', required: true },
    };

    const result = validate({}, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('name is required');
  });

  it('should use default values for missing fields', () => {
    const schema: Schema = {
      name: { type: 'string', required: true, default: 'Default' },
      status: { type: 'string', default: 'active' },
    };

    const result = validate({}, schema);
    expect(result.data?.name).toBe('Default');
    expect(result.data?.status).toBe('active');
  });

  it('should fail on type mismatch', () => {
    const schema: Schema = {
      age: { type: 'number' },
    };

    const result = validate({ age: 'not a number' }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('age must be a number');
  });

  it('should validate all types', () => {
    const schema: Schema = {
      str: { type: 'string' },
      num: { type: 'number' },
      bool: { type: 'boolean' },
      obj: { type: 'object' },
      arr: { type: 'array' },
    };

    const validData = {
      str: 'hello',
      num: 42,
      bool: true,
      obj: { key: 'value' },
      arr: [1, 2, 3],
    };

    expect(validate(validData, schema).valid).toBe(true);

    expect(validate({ str: 123 }, { str: { type: 'string' } }).valid).toBe(false);
    expect(validate({ num: '42' }, { num: { type: 'number' } }).valid).toBe(false);
    expect(validate({ num: NaN }, { num: { type: 'number' } }).valid).toBe(false);
    expect(validate({ bool: 'true' }, { bool: { type: 'boolean' } }).valid).toBe(false);
    expect(validate({ obj: [] }, { obj: { type: 'object' } }).valid).toBe(false);
    expect(validate({ obj: null }, { obj: { type: 'object' } }).valid).toBe(false);
    expect(validate({ arr: {} }, { arr: { type: 'array' } }).valid).toBe(false);
  });

  it('should validate nested schemas', () => {
    const schema: Schema = {
      user: {
        type: 'object',
        schema: {
          name: { type: 'string', required: true },
          email: { type: 'string', rules: [rules.email()] },
        },
      },
    };

    const validResult = validate(
      { user: { name: 'John', email: 'john@example.com' } },
      schema
    );
    expect(validResult.valid).toBe(true);

    const invalidResult = validate(
      { user: { name: 'John', email: 'invalid' } },
      schema
    );
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.some((e) => e.includes('user.email'))).toBe(true);
  });

  it('should validate array items', () => {
    const schema: Schema = {
      tags: {
        type: 'array',
        itemSchema: { type: 'string', rules: [rules.minLength(2)] },
      },
    };

    const validResult = validate({ tags: ['ab', 'abc', 'abcd'] }, schema);
    expect(validResult.valid).toBe(true);

    const invalidResult = validate({ tags: ['a', 'ab'] }, schema);
    expect(invalidResult.valid).toBe(false);
  });

  it('should run validation rules', () => {
    const schema: Schema = {
      email: { type: 'string', rules: [rules.email()] },
      age: { type: 'number', rules: [rules.min(0), rules.max(150)] },
    };

    expect(validate({ email: 'valid@email.com', age: 30 }, schema).valid).toBe(true);
    expect(validate({ email: 'invalid' }, schema).valid).toBe(false);
    expect(validate({ age: -1 }, schema).valid).toBe(false);
    expect(validate({ age: 200 }, schema).valid).toBe(false);
  });

  it('should support custom validators', () => {
    const schema: Schema = {
      value: {
        validator: (v) => (v as number) % 2 === 0 || 'Must be even',
      },
    };

    expect(validate({ value: 4 }, schema).valid).toBe(true);
    expect(validate({ value: 3 }, schema).valid).toBe(false);
    expect(validate({ value: 3 }, schema).errors).toContain('value: Must be even');
  });

  it('should handle rule with function message', () => {
    const customRule: ValidationRule = {
      name: 'custom',
      test: (v) => (v as number) > 10,
      message: (v) => `Value ${v} is not greater than 10`,
    };

    const schema: Schema = {
      num: { rules: [customRule] },
    };

    const result = validate({ num: 5 }, schema);
    expect(result.errors).toContain('num: Value 5 is not greater than 10');
  });

  it('should skip undefined optional fields', () => {
    const schema: Schema = {
      optional: { type: 'string' },
    };

    const result = validate({}, schema);
    expect(result.valid).toBe(true);
    expect(result.data?.optional).toBeUndefined();
  });
});

describe('validateValue', () => {
  it('should validate a single value against rules', () => {
    const result = validateValue('test@email.com', [rules.email()]);
    expect(result.valid).toBe(true);
  });

  it('should return errors for invalid value', () => {
    const result = validateValue('invalid', [rules.email()]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Must be a valid email address');
  });

  it('should validate against multiple rules', () => {
    const result = validateValue('ab', [
      rules.minLength(3),
      rules.maxLength(10),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Must be at least 3 characters');
  });

  it('should collect all rule failures', () => {
    const result = validateValue(-5, [rules.min(0), rules.max(10)]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('Must be at least 0');
  });
});

describe('createValidator', () => {
  it('should create a reusable validator function', () => {
    const schema: Schema = {
      name: { type: 'string', required: true },
    };

    const validateUser = createValidator(schema);

    expect(validateUser({ name: 'John' }).valid).toBe(true);
    expect(validateUser({}).valid).toBe(false);
  });
});

describe('isValid', () => {
  it('should return true for valid results', () => {
    const result: ValidationResult = { valid: true, data: {}, errors: [] };
    expect(isValid(result)).toBe(true);
  });

  it('should return false for invalid results', () => {
    const result: ValidationResult = { valid: false, errors: ['error'] };
    expect(isValid(result)).toBe(false);
  });

  it('should return false when data is undefined', () => {
    const result: ValidationResult = { valid: true, data: undefined, errors: [] };
    expect(isValid(result)).toBe(false);
  });
});

describe('Validator class', () => {
  it('should build schema with field method', () => {
    const v = new Validator()
      .field('name', { type: 'string', required: true })
      .field('age', { type: 'number' });

    const result = v.validate({ name: 'John', age: 30 });
    expect(result.valid).toBe(true);
  });

  it('should validate with validate method', () => {
    const v = new Validator().field('email', {
      type: 'string',
      rules: [rules.email()],
    });

    expect(v.validate({ email: 'valid@email.com' }).valid).toBe(true);
    expect(v.validate({ email: 'invalid' }).valid).toBe(false);
  });

  it('should throw with assert method on invalid data', () => {
    const v = new Validator().field('name', { type: 'string', required: true });

    expect(() => v.assert({})).toThrow('Validation failed');
    expect(v.assert({ name: 'John' })).toEqual({ name: 'John' });
  });

  it('should return validated data with assert on valid data', () => {
    const v = new Validator().field('value', { type: 'number' });

    const data = v.assert({ value: 42 });
    expect(data).toEqual({ value: 42 });
  });
});

describe('validator factory', () => {
  it('should create a new Validator instance', () => {
    const v = validator();
    expect(v).toBeInstanceOf(Validator);
  });

  it('should support method chaining', () => {
    const result = validator()
      .field('name', { required: true })
      .field('email', { rules: [rules.email()] })
      .validate({ name: 'John', email: 'john@email.com' });

    expect(result.valid).toBe(true);
  });
});
