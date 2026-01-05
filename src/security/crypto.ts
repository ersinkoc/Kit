import { createHash, createHmac, createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';
import type { BinaryLike } from 'node:crypto';

/**
 * Cryptographic utilities
 *
 * @example
 * ```typescript
 * import { crypto } from '@oxog/kit/security';
 *
 * const hash = crypto.hash('sha256', 'password');
 * const token = crypto.randomString(32);
 * const encrypted = crypto.encrypt('data', 'secret-key');
 * ```
 */
export class Crypto {
  /**
   * Generate hash using specified algorithm
   */
  hash(algorithm: 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512', data: BinaryLike): string {
    return createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Generate HMAC hash
   */
  hmac(algorithm: 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512', data: BinaryLike, key: BinaryLike): string {
    return createHmac(algorithm, key).update(data).digest('hex');
  }

  /**
   * Generate random bytes
   */
  randomBytes(size: number): Buffer {
    return randomBytes(size);
  }

  /**
   * Generate random string from charset
   */
  randomString(length: number, charset: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charset[bytes[i]! % charset.length];
    }

    return result;
  }

  /**
   * Generate random integer in range
   */
  randomInt(min: number, max: number): number {
    const range = max - min + 1;
    const bytes = randomBytes(4);
    const randomValue = bytes.readUInt32BE(0) % range;
    return min + randomValue;
  }

  /**
   * Generate random UUID v4
   */
  randomUUID(): string {
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
   * Encrypt data using AES-256-GCM
   */
  encrypt(data: BinaryLike, key: BinaryLike, algorithm: string = 'aes-256-gcm'): { encrypted: string; iv: string; authTag: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(algorithm, key, iv) as any;

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(encrypted: string, key: BinaryLike, iv: string, authTag: string, algorithm: string = 'aes-256-gcm'): string {
    const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'base64')) as any;
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    const decrypted = decipher.update(Buffer.from(encrypted, 'base64'));
    const decryptedData = Buffer.concat([decrypted, decipher.final()]);

    return decryptedData.toString();
  }

  /**
   * Timing-safe comparison
   */
  timingSafeEqual(a: BinaryLike, b: BinaryLike): boolean {
    try {
      return timingSafeEqual(Buffer.from(a as string), Buffer.from(b as string));
    } catch {
      return false;
    }
  }
}

/**
 * Create a new crypto instance
 *
 * @example
 * ```typescript
 * const crypto = createCrypto();
 * const hash = crypto.hash('sha256', 'data');
 * ```
 */
export function createCrypto(): Crypto {
  return new Crypto();
}

/**
 * Default crypto instance
 */
export const crypto = createCrypto();
