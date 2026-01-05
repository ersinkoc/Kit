/**
 * Data transformation utilities
 */

/**
 * Transform function type
 */
export type TransformFunction<TInput = unknown, TOutput = unknown> = (
  value: TInput
) => TOutput;

/**
 * Transform pipeline
 */
export class TransformPipeline<TInput = unknown, TOutput = unknown> {
  public transforms: TransformFunction[] = [];

  /**
   * Add a transform to the pipeline
   */
  pipe<TNextOutput = unknown>(
    transform: TransformFunction<TOutput, TNextOutput>
  ): TransformPipeline<TInput, TNextOutput> {
    const pipeline = new TransformPipeline<TInput, TNextOutput>();
    pipeline.transforms = [...this.transforms, transform as TransformFunction];
    return pipeline;
  }

  /**
   * Execute the pipeline
   */
  execute(value: TInput): TOutput {
    let result: unknown = value;
    for (const transform of this.transforms) {
      result = transform(result);
    }
    return result as TOutput;
  }

  /**
   * Create a reusable function from the pipeline
   */
  toFunction(): (value: TInput) => TOutput {
    return (value) => this.execute(value);
  }
}

/**
 * Create a transform pipeline
 */
export function pipeline<TInput = unknown, TOutput = unknown>(
  ...transforms: TransformFunction[]
): TransformPipeline<TInput, TOutput> {
  const result = new TransformPipeline<TInput, TOutput>();
  result.transforms = transforms;
  return result;
}

/**
 * Common string transforms
 */
export const string = {
  /** Convert to lowercase */
  lowercase: (): TransformFunction<string, string> => (value) => value.toLowerCase(),

  /** Convert to uppercase */
  uppercase: (): TransformFunction<string, string> => (value) => value.toUpperCase(),

  /** Capitalize first letter */
  capitalize: (): TransformFunction<string, string> => (value) =>
    value.charAt(0).toUpperCase() + value.slice(1),

  /** Trim whitespace */
  trim: (): TransformFunction<string, string> => (value) => value.trim(),

  /** Remove all whitespace */
  removeWhitespace: (): TransformFunction<string, string> => (value) =>
    value.replace(/\s/g, ''),

  /** Replace text */
  replace: (search: string | RegExp, replacement: string): TransformFunction<string, string> =>
    (value) => value.replace(search, replacement),

  /** Truncate to length */
  truncate: (length: number, suffix = '...'): TransformFunction<string, string> =>
    (value) => value.length > length ? value.slice(0, length) + suffix : value,

  /** Slugify */
  slugify: (): TransformFunction<string, string> => (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, ''),

  /** Camel case */
  camelCase: (): TransformFunction<string, string> => (value) =>
    value
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, ''),

  /** Kebab case */
  kebabCase: (): TransformFunction<string, string> => (value) =>
    value
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase(),

  /** Snake case */
  snakeCase: (): TransformFunction<string, string> => (value) =>
    value
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase(),

  /** Pascal case */
  pascalCase: (): TransformFunction<string, string> => (value) =>
    value
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, ''),
};

/**
 * Common number transforms
 */
export const number = {
  /** Round to decimal places */
  round: (digits = 0): TransformFunction<number, number> =>
    (value) => Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits),

  /** Floor */
  floor: (): TransformFunction<number, number> => (value) => Math.floor(value),

  /** Ceiling */
  ceil: (): TransformFunction<number, number> => (value) => Math.ceil(value),

  /** Absolute value */
  abs: (): TransformFunction<number, number> => (value) => Math.abs(value),

  /** Clamp between min and max */
  clamp: (min: number, max: number): TransformFunction<number, number> =>
    (value) => Math.min(Math.max(value, min), max),

  /** Add value */
  add: (amount: number): TransformFunction<number, number> => (value) => value + amount,

  /** Subtract value */
  subtract: (amount: number): TransformFunction<number, number> => (value) => value - amount,

  /** Multiply by value */
  multiply: (factor: number): TransformFunction<number, number> => (value) => value * factor,

  /** Divide by value */
  divide: (divisor: number): TransformFunction<number, number> => (value) => value / divisor,

  /** Modulo */
  modulo: (mod: number): TransformFunction<number, number> => (value) => value % mod,

  /** Convert to string */
  toString: (radix = 10): TransformFunction<number, string> => (value) => value.toString(radix),

  /** Format with thousand separators */
  format: (locale = 'en-US'): TransformFunction<number, string> =>
    (value) => value.toLocaleString(locale),
};

/**
 * Common array transforms
 */
export const array = {
  /** Map over array */
  map: <T, U>(fn: (item: T, index: number) => U): TransformFunction<T[], U[]> =>
    (value) => value.map(fn),

  /** Filter array */
  filter: <T>(fn: (item: T, index: number) => boolean): TransformFunction<T[], T[]> =>
    (value) => value.filter(fn),

  /** Reduce array */
  reduce: <T, U>(
    fn: (acc: U, item: T, index: number) => U,
    initial: U
  ): TransformFunction<T[], U> => (value) => value.reduce(fn, initial),

  /** Reverse array */
  reverse: <T>(): TransformFunction<T[], T[]> => (value) => [...value].reverse(),

  /** Sort array */
  sort: <T>(compareFn?: (a: T, b: T) => number): TransformFunction<T[], T[]> =>
    (value) => [...value].sort(compareFn),

  /** Flatten array */
  flatten: <T>(): TransformFunction<T[][], T[]> => (value) => value.flat(),

  /** Unique values */
  unique: <T>(): TransformFunction<T[], T[]> => (value) => [...new Set(value)],

  /** Chunk array */
  chunk: <T>(size: number): TransformFunction<T[], T[][]> =>
    (value) => {
      const chunks: T[][] = [];
      for (let i = 0; i < value.length; i += size) {
        chunks.push(value.slice(i, i + size));
      }
      return chunks;
    },

  /** Take first n elements */
  take: <T>(n: number): TransformFunction<T[], T[]> => (value) => value.slice(0, n),

  /** Skip first n elements */
  skip: <T>(n: number): TransformFunction<T[], T[]> => (value) => value.slice(n),

  /** Get first element */
  first: <T>(): TransformFunction<T[], T | undefined> => (value) => value[0],

  /** Get last element */
  last: <T>(): TransformFunction<T[], T | undefined> => (value) => value[value.length - 1],
};

/**
 * Common object transforms
 */
export const object = {
  /** Pick keys */
  pick: <T extends object, K extends keyof T>(
    ...keys: K[]
  ): TransformFunction<T, Pick<T, K>> =>
    (value) => {
      const result = {} as Pick<T, K>;
      for (const key of keys) {
        if (key in value) {
          result[key] = value[key];
        }
      }
      return result;
    },

  /** Omit keys */
  omit: <T extends object, K extends keyof T>(
    ...keys: K[]
  ): TransformFunction<T, Omit<T, K>> =>
    (value) => {
      const result = { ...value };
      for (const key of keys) {
        delete result[key];
      }
      return result as Omit<T, K>;
    },

  /** Map values */
  mapValues: <T extends object, U>(
    fn: (value: T[keyof T], key: keyof T) => U
  ): TransformFunction<T, Record<keyof T, U>> =>
    (value) => {
      const result = {} as Record<keyof T, U>;
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          result[key] = fn(value[key], key);
        }
      }
      return result;
    },

  /** Map keys */
  mapKeys: <T extends object>(
    fn: (key: keyof T) => string | number | symbol
  ): TransformFunction<T, Record<string | number | symbol, T[keyof T]>> =>
    (value) => {
      const result = {} as Record<string | number | symbol, T[keyof T]>;
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const newKey = fn(key);
          result[newKey] = value[key];
        }
      }
      return result;
    },

  /** Merge objects */
  merge: <T extends object>(...sources: Partial<T>[]): TransformFunction<T, T> =>
    (value) => Object.assign({}, value, ...sources) as T,

  /** Deep clone */
  clone: <T extends object>(): TransformFunction<T, T> => (value) => JSON.parse(JSON.stringify(value)) as T,
};

/**
 * Common date transforms
 */
export const date = {
  /** Format date */
  format: (formatStr = 'ISO'): TransformFunction<Date | string, string> =>
    (value) => {
      const date = typeof value === 'string' ? new Date(value) : value;
      if (formatStr === 'ISO') return date.toISOString();
      if (formatStr === 'locale') return date.toLocaleString();
      if (formatStr === 'date') return date.toLocaleDateString();
      if (formatStr === 'time') return date.toLocaleTimeString();
      return date.toString();
    },

  /** Add time */
  add: (milliseconds: number): TransformFunction<Date, Date> =>
    (value) => new Date(value.getTime() + milliseconds),

  /** Subtract time */
  subtract: (milliseconds: number): TransformFunction<Date, Date> =>
    (value) => new Date(value.getTime() - milliseconds),

  /** Start of day */
  startOfDay: (): TransformFunction<Date, Date> =>
    (value) => {
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      return date;
    },

  /** End of day */
  endOfDay: (): TransformFunction<Date, Date> =>
    (value) => {
      const date = new Date(value);
      date.setHours(23, 59, 59, 999);
      return date;
    },

  /** Start of month */
  startOfMonth: (): TransformFunction<Date, Date> =>
    (value) => {
      const date = new Date(value);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    },

  /** End of month */
  endOfMonth: (): TransformFunction<Date, Date> =>
    (value) => {
      const date = new Date(value);
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
      return date;
    },
};

/**
 * Type conversion transforms
 */
export const cast = {
  /** To string */
  toString: (): TransformFunction<unknown, string> => (value) => String(value),

  /** To number */
  toNumber: (): TransformFunction<unknown, number> => (value) => Number(value),

  /** To boolean */
  toBoolean: (): TransformFunction<unknown, boolean> =>
    (value) => Boolean(value && value !== 'false' && value !== '0'),

  /** To date */
  toDate: (): TransformFunction<unknown, Date> =>
    (value) => value instanceof Date ? value : new Date(value as string | number),

  /** To array */
  toArray: (): TransformFunction<unknown, unknown[]> =>
    (value) => (Array.isArray(value) ? value : [value]),

  /** Parse JSON */
  parseJSON: (): TransformFunction<string, object> => (value) => JSON.parse(value),

  /** Stringify JSON */
  stringifyJSON: (space?: number | string): TransformFunction<object, string> =>
    (value) => JSON.stringify(value, null, space),
};

/**
 * Transform class for chainable transformations
 */
export class Transformer<TInput = unknown, TOutput = unknown> {
  private pipeline: TransformPipeline<TInput, TOutput>;

  constructor(pipeline?: TransformPipeline<TInput, TOutput>) {
    this.pipeline = pipeline || new TransformPipeline<TInput, TOutput>();
  }

  /**
   * Add a transform to the chain
   */
  pipe<TNextOutput = unknown>(
    transform: TransformFunction<TOutput, TNextOutput>
  ): Transformer<TInput, TNextOutput> {
    return new Transformer(this.pipeline.pipe(transform));
  }

  /**
   * Execute the transformation
   */
  transform(value: TInput): TOutput {
    return this.pipeline.execute(value);
  }

  /**
   * Create a reusable function
   */
  toFunction(): (value: TInput) => TOutput {
    return this.pipeline.toFunction();
  }
}

/**
 * Create a new transformer
 */
export function transformer<TInput = unknown, TOutput = unknown>(
  initial?: TransformFunction<TInput, TOutput>
): Transformer<TInput, TOutput> {
  const pipe = new TransformPipeline<TInput, TOutput>();
  if (initial) {
    pipe.transforms.push(initial as TransformFunction);
  }
  return new Transformer(pipe);
}

/**
 * Default transformer instance
 */
export const transform_default = transformer();
