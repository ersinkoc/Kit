/**
 * Validation utilities for data validation
 */

/**
 * Validation result
 */
export interface ValidationResult<T = unknown> {
  /** Whether validation passed */
  valid: boolean;
  /** Validated and transformed data */
  data?: T;
  /** Validation errors */
  errors: string[];
}

/**
 * Validation rule
 */
export interface ValidationRule {
  /** Rule name */
  name: string;
  /** Validation function */
  test: (value: unknown) => boolean;
  /** Error message */
  message: string | ((value: unknown) => string);
}

/**
 * Schema definition
 */
export interface Schema<T = Record<string, unknown>> {
  [key: string]: {
    /** Required field */
    required?: boolean;
    /** Type check */
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    /** Validation rules */
    rules?: ValidationRule[];
    /** Nested schema for objects */
    schema?: Schema;
    /** Item schema for arrays */
    itemSchema?: Schema;
    /** Default value */
    default?: unknown;
    /** Custom validator */
    validator?: (value: unknown) => boolean | string;
  } & {
    [key: string]: unknown;
  };
}

/**
 * Common validation rules
 */
export const rules = {
  /** Email validation */
  email: (): ValidationRule => ({
    name: 'email',
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message: 'Must be a valid email address',
  }),

  /** URL validation */
  url: (): ValidationRule => ({
    name: 'url',
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Must be a valid URL',
  }),

  /** Minimum length (for strings/arrays) */
  minLength: (min: number): ValidationRule => ({
    name: 'minLength',
    test: (value: unknown) => {
      if (typeof value === 'string') return value.length >= min;
      if (Array.isArray(value)) return value.length >= min;
      return false;
    },
    message: `Must be at least ${min} characters`,
  }),

  /** Maximum length (for strings/arrays) */
  maxLength: (max: number): ValidationRule => ({
    name: 'maxLength',
    test: (value: unknown) => {
      if (typeof value === 'string') return value.length <= max;
      if (Array.isArray(value)) return value.length <= max;
      return false;
    },
    message: `Must be at most ${max} characters`,
  }),

  /** Minimum value (for numbers) */
  min: (min: number): ValidationRule => ({
    name: 'min',
    test: (value: unknown) => typeof value === 'number' && value >= min,
    message: `Must be at least ${min}`,
  }),

  /** Maximum value (for numbers) */
  max: (max: number): ValidationRule => ({
    name: 'max',
    test: (value: unknown) => typeof value === 'number' && value <= max,
    message: `Must be at most ${max}`,
  }),

  /** Pattern validation */
  pattern: (regex: RegExp, customMessage?: string): ValidationRule => ({
    name: 'pattern',
    test: (value: unknown) => typeof value === 'string' && regex.test(value),
    message: customMessage || 'Must match the required pattern',
  }),

  /** Enum validation */
  enum: (...values: unknown[]): ValidationRule => ({
    name: 'enum',
    test: (value: unknown) => values.includes(value),
    message: `Must be one of: ${values.join(', ')}`,
  }),

  /** Required field validation */
  required: (): ValidationRule => ({
    name: 'required',
    test: (value: unknown) =>
      value !== null && value !== undefined && value !== '',
    message: 'This field is required',
  }),
};

/**
 * Validate data against a schema
 */
export function validate<T extends Record<string, unknown>>(
  data: Record<string, unknown>,
  schema: Schema<T>
): ValidationResult<T> {
  const errors: string[] = [];
  const result: Record<string, unknown> = {};

  for (const [key, def] of Object.entries(schema)) {
    const value = data[key];

    // Check required
    if (def.required && (value === null || value === undefined)) {
      errors.push(`${key} is required`);
      if (def.default !== undefined) {
        result[key] = def.default;
      }
      continue;
    }

    // Skip validation if value is undefined and not required
    if (value === undefined) {
      if (def.default !== undefined) {
        result[key] = def.default;
      }
      continue;
    }

    // Type check
    if (def.type) {
      let typeValid = true;
      switch (def.type) {
        case 'string':
          typeValid = typeof value === 'string';
          break;
        case 'number':
          typeValid = typeof value === 'number' && !isNaN(value);
          break;
        case 'boolean':
          typeValid = typeof value === 'boolean';
          break;
        case 'object':
          typeValid = typeof value === 'object' && value !== null && !Array.isArray(value);
          break;
        case 'array':
          typeValid = Array.isArray(value);
          break;
      }
      if (!typeValid) {
        errors.push(`${key} must be a ${def.type}`);
        continue;
      }
    }

    // Validate nested schema
    if (def.schema && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nested = validate(value as Record<string, unknown>, def.schema);
      if (!nested.valid) {
        errors.push(...nested.errors.map((e) => `${key}.${e}`));
      } else {
        result[key] = nested.data;
      }
      continue;
    }

    // Validate array items
    if (def.itemSchema && Array.isArray(value)) {
      const itemErrors: string[] = [];
      const validItems: unknown[] = [];

      value.forEach((item, index) => {
        const itemResult = validate(
          { item } as Record<string, unknown>,
          { item: def.itemSchema! }
        );
        if (!itemResult.valid) {
          itemErrors.push(...itemResult.errors.map((e) => `[${index}].${e}`));
        } else {
          validItems.push((itemResult.data as Record<string, unknown>).item);
        }
      });

      if (itemErrors.length > 0) {
        errors.push(...itemErrors);
      } else {
        result[key] = validItems;
      }
      continue;
    }

    // Run validation rules
    if (def.rules) {
      for (const rule of def.rules) {
        if (!rule.test(value)) {
          const message = typeof rule.message === 'function' ? rule.message(value) : rule.message;
          errors.push(`${key}: ${message}`);
          break;
        }
      }
    }

    // Custom validator
    if (def.validator) {
      const customResult = def.validator(value);
      if (customResult !== true) {
        errors.push(`${key}: ${customResult}`);
        continue;
      }
    }

    result[key] = value;
  }

  return {
    valid: errors.length === 0,
    data: result as T,
    errors,
  };
}

/**
 * Validate a single value against rules
 */
export function validateValue(
  value: unknown,
  rules: ValidationRule[]
): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.test(value)) {
      const message = typeof rule.message === 'function' ? rule.message(value) : rule.message;
      errors.push(message);
    }
  }

  return {
    valid: errors.length === 0,
    data: value,
    errors,
  };
}

/**
 * Create a reusable validator from a schema
 */
export function createValidator<T extends Record<string, unknown>>(schema: Schema<T>) {
  return (data: Record<string, unknown>): ValidationResult<T> => {
    return validate(data, schema);
  };
}

/**
 * Type guard for validation result
 */
export function isValid<T>(result: ValidationResult<T>): result is ValidationResult<T> & { data: T } {
  return result.valid && result.data !== undefined;
}

/**
 * Validator class for chainable validation
 */
export class Validator<T extends Record<string, unknown> = Record<string, unknown>> {
  private schema: Schema<T> = {} as Schema<T>;

  /**
   * Add a field to the schema
   */
  field<K extends string>(
    name: K,
    definition: {
      required?: boolean;
      type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
      rules?: ValidationRule[];
      schema?: Schema;
      itemSchema?: Schema;
      default?: unknown;
      validator?: (value: unknown) => boolean | string;
    }
  ): Validator<T> {
    (this.schema as Record<string, unknown>)[name] = definition;
    return this;
  }

  /**
   * Validate data against the schema
   */
  validate(data: Record<string, unknown>): ValidationResult<T> {
    return validate(data, this.schema);
  }

  /**
   * Check if data is valid (throws if not)
   */
  assert(data: Record<string, unknown>): T {
    const result = this.validate(data);
    if (!result.valid) {
      throw new Error(`Validation failed: ${result.errors.join(', ')}`);
    }
    return result.data!;
  }
}

/**
 * Create a new Validator instance
 */
export function validator<T extends Record<string, unknown> = Record<string, unknown>>(): Validator<T> {
  return new Validator<T>();
}

/**
 * Default validator instance
 */
export const validate_default = validator();
