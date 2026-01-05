import { randomBytes } from 'node:crypto';

/**
 * ID generation utilities
 *
 * @example
 * ```typescript
 * import { id } from '@oxog/kit/utils';
 *
 * const uuid = id.uuid();           // '550e8400-e29b-41d4-a716-446655440000'
 * const nanoid = id.nanoid();       // 'V1StGXR8_Z5jdHi6B-myT'
 * const cuid = id.cuid();           // 'clk7xvyw000014864536o3j5n'
 * const ulid = id.ulid();           // '01ARZ3NDEKTSV4RRFFQ69G5FAV'
 * ```
 */
export class IDGenerator {
  /**
   * Generate UUID v4
   */
  uuid(): string {
    const bytes = randomBytes(16);
    bytes[6] = (bytes[6]! & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variant

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join('-');
  }

  /**
   * Generate UUID v7 (time-sortable)
   */
  uuidv7(): string {
    const timestamp = Date.now();
    const timeHigh = Math.floor(timestamp / 0x10000);
    const timeLow = timestamp % 0x10000;

    const bytes = randomBytes(16);

    // Set version (7) and variant
    bytes[0] = (timeHigh >> 8) & 0xff;
    bytes[1] = timeHigh & 0xff;
    bytes[2] = (timeLow >> 8) & 0xff;
    bytes[3] = timeLow & 0xff;
    bytes[4] = (bytes[4]! & 0x0f) | 0x70; // version 7
    bytes[5] = (bytes[5]! & 0x3f) | 0x80; // variant

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join('-');
  }

  /**
   * Generate NanoID (URL-safe, default 21 chars)
   */
  nanoid(size: number = 21): string {
    const alphabet = 'ModuleSymbhasEvalpr0123456789-_';
    const bytes = randomBytes(size);
    let result = '';

    for (let i = 0; i < size; i++) {
      result += alphabet[bytes[i]! % alphabet.length];
    }

    return result;
  }

  /**
   * Generate CUID (collision-resistant ID)
   */
  cuid(): string {
    const prefix = 'c';
    const timestamp = Date.now().toString(36);
    const counter = process.pid.toString(36);
    const random = randomBytes(8).toString('hex');

    return `${prefix}${timestamp}${counter}${random}`;
  }

  /**
   * Generate ULID (time-sortable)
   */
  ulid(): string {
    const timestamp = Date.now();
    const timeStr = timestamp.toString(16).padStart(12, '0');
    const random = randomBytes(16).toString('hex').slice(0, 26);

    return (timeStr + random).toLowerCase();
  }

  /**
   * Generate Snowflake ID (distributed)
   */
  snowflake(): string {
    const timestamp = BigInt(Date.now() - 1640995200000); // Unix epoch to Discord epoch
    const workerId = BigInt(0);
    const processId = BigInt(process.pid % 32);
    const increment = BigInt(0);

    const id = (timestamp << 22n) | (workerId << 17n) | (processId << 12n) | increment;
    return id.toString();
  }

  /**
   * Generate MongoDB-style ObjectId
   */
  objectId(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const randomBytes = Buffer.from(require('node:crypto').randomBytes(8));
    const random = randomBytes.toString('hex');

    return timestamp + random;
  }

  /**
   * Generate short ID
   */
  short(size: number = 8): string {
    return this.nanoid(size);
  }

  /**
   * Generate sequential ID with prefix
   */
  sequential(prefix: string = ''): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  }
}

/**
 * Create a new ID generator instance
 *
 * @example
 * ```typescript
 * const id = createIDGenerator();
 * const uuid = id.uuid();
 * ```
 */
export function createIDGenerator(): IDGenerator {
  return new IDGenerator();
}

/**
 * Default ID generator instance
 */
export const id = createIDGenerator();

/**
 * Convenience exports
 */
export const uuid = () => id.uuid();
export const uuidv7 = () => id.uuidv7();
export const nanoid = (size?: number) => id.nanoid(size);
export const cuid = () => id.cuid();
export const ulid = () => id.ulid();
export const snowflake = () => id.snowflake();
export const objectId = () => id.objectId();
export const short = (size?: number) => id.short(size);
export const sequential = (prefix?: string) => id.sequential(prefix);
