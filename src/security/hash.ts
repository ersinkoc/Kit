import { createHash as cryptoCreateHash, randomBytes, timingSafeEqual as cryptoTimingSafeEqual } from 'node:crypto';

/**
 * Hash options for password hashing
 */
export interface HashOptions {
  /** Algorithm type */
  algorithm?: 'pbkdf2';
  /** Number of iterations (cost factor) */
  cost?: number;
  /** Key length (derived key length) */
  keyLength?: number;
  /** Salt length */
  saltLength?: number;
}

/**
 * Password hashing utilities (PBKDF2-based)
 *
 * @example
 * ```typescript
 * import { hash } from '@oxog/kit/security';
 *
 * const hashedPassword = hash.password('secret123', { cost: 10000 });
 * const isValid = hash.verify('secret123', hashedPassword);
 * ```
 */
export class PasswordHash {
  private defaultOptions: HashOptions = {
    algorithm: 'pbkdf2',
    cost: 100000,
    keyLength: 64,
    saltLength: 32,
  };

  /**
   * Hash a password using PBKDF2
   */
  password(password: string, options: HashOptions = {}): string {
    const opts = { ...this.defaultOptions, ...options };

    // Generate random salt
    const salt = randomBytes(opts.saltLength!);

    // Derive key using iterative hashing
    const passwordBuffer = Buffer.from(password, 'utf-8');
    let result = cryptoCreateHash('sha256')
      .update(Buffer.concat([passwordBuffer, salt]))
      .digest();

    // Perform remaining iterations for cost factor
    for (let i = 1; i < opts.cost!; i++) {
      result = cryptoCreateHash('sha256')
        .update(Buffer.concat([passwordBuffer, salt, result]))
        .digest();
    }

    // Format: $pbkdf2$cost$salt$hash
    return `$pbkdf2$${opts.cost}$${salt.toString('base64')}$${result.toString('base64')}`;
  }

  /**
   * Verify a password against a hash
   */
  verify(password: string, hashString: string): boolean {
    try {
      const parts = hashString.split('$');
      if (parts.length !== 5 || parts[1] !== 'pbkdf2') {
        return false;
      }

      const [, , costStr, saltBase64, hashBase64] = parts;

      if (!costStr || !saltBase64 || !hashBase64) {
        return false;
      }

      const cost = parseInt(costStr, 10);
      const salt = Buffer.from(saltBase64, 'base64');
      const expectedHash = Buffer.from(hashBase64, 'base64');

      // Derive key from password using same algorithm
      const passwordBuffer = Buffer.from(password, 'utf-8');
      let result = cryptoCreateHash('sha256')
        .update(Buffer.concat([passwordBuffer, salt]))
        .digest();

      // Perform iterations
      for (let i = 1; i < cost; i++) {
        result = cryptoCreateHash('sha256')
          .update(Buffer.concat([passwordBuffer, salt, result]))
          .digest();
      }

      // Compare using timing-safe comparison
      return cryptoTimingSafeEqual(result, expectedHash);
    } catch {
      return false;
    }
  }

  /**
   * Check if hash needs rehashing
   */
  needsRehash(hashString: string, options: HashOptions = {}): boolean {
    const opts = { ...this.defaultOptions, ...options };
    const parts = hashString.split('$');

    if (parts.length !== 5 || parts[1] !== 'pbkdf2') {
      return true;
    }

    const costStr = parts[2];
    if (!costStr) {
      return true;
    }

    const cost = parseInt(costStr, 10);
    return cost !== opts.cost;
  }
}

/**
 * Create a new password hash instance
 *
 * @example
 * ```typescript
 * const hash = createPasswordHash();
 * const hashed = hash.password('secret', { cost: 10000 });
 * ```
 */
export function createPasswordHash(): PasswordHash {
  return new PasswordHash();
}

/**
 * Default password hash instance
 */
export const hash = createPasswordHash();
