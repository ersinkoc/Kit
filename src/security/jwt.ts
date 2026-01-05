import { createHmac } from 'node:crypto';
import { Buffer } from 'node:buffer';

/**
 * JWT payload structure
 */
export interface JWTPayload {
  iss?: string; // Issuer
  sub?: string; // Subject
  aud?: string | string[]; // Audience
  exp?: number; // Expiration time
  nbf?: number; // Not before
  iat?: number; // Issued At
  jti?: string; // JWT ID
  [key: string]: unknown;
}

/**
 * JWT options
 */
export interface JWTOptions {
  /** Expiration time (e.g., '1h', '7d') */
  expiresIn?: string;
  /** Algorithm */
  algorithm?: 'HS256' | 'HS384' | 'HS512';
  /** Issuer */
  issuer?: string;
  /** Audience */
  audience?: string | string[];
}

/**
 * JSON Web Token utilities
 *
 * @example
 * ```typescript
 * import { jwt } from '@oxog/kit/security';
 *
 * const token = jwt.sign({ userId: 123 }, 'secret', { expiresIn: '1h' });
 * const payload = jwt.verify(token, 'secret');
 * ```
 */
export class JWT {
  private base64UrlEncode(str: string): string {
    return str
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    str += '='.repeat((4 - str.length % 4) % 4);
    return str
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  }

  /**
   * Sign a payload into a JWT
   */
  sign(payload: JWTPayload, secret: string, options: JWTOptions = {}): string {
    const now = Math.floor(Date.now() / 1000);

    // Add standard claims
    const fullPayload: JWTPayload = {
      iat: now,
      ...payload,
    };

    if (options.expiresIn) {
      fullPayload.exp = now + this.parseDuration(options.expiresIn);
    }

    if (options.issuer) {
      fullPayload.iss = options.issuer;
    }

    if (options.audience) {
      fullPayload.aud = options.audience;
    }

    // Encode header
    const header = {
      typ: 'JWT',
      alg: options.algorithm || 'HS256',
    };

    const encodedHeader = this.base64UrlEncode(Buffer.from(JSON.stringify(header)).toString('base64'));
    const encodedPayload = this.base64UrlEncode(Buffer.from(JSON.stringify(fullPayload)).toString('base64'));

    // Create signature
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac(options.algorithm || 'sha256', secret)
      .update(data)
      .digest('base64');
    const encodedSignature = this.base64UrlEncode(signature);

    return `${data}.${encodedSignature}`;
  }

  /**
   * Verify a JWT and return payload
   */
  verify(token: string, secret: string, options: JWTOptions = {}): JWTPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // Verify signature
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.base64UrlEncode(
      createHmac(options.algorithm || 'sha256', secret)
        .update(data)
        .digest('base64')
    );

    if (encodedSignature !== expectedSignature) {
      return null;
    }

    // Decode payload
    if (!encodedPayload) {
      return null;
    }
    const payloadStr = Buffer.from(this.base64UrlDecode(encodedPayload), 'base64').toString();
    const payload: JWTPayload = JSON.parse(payloadStr);

    // Verify expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Verify not before
    if (payload.nbf && payload.nbf > Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Verify issuer
    if (options.issuer && payload.iss !== options.issuer) {
      return null;
    }

    // Verify audience
    if (options.audience) {
      const aud = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
      const allowedAud = Array.isArray(options.audience) ? options.audience : [options.audience];
      if (!aud.some((a) => allowedAud.includes(a))) {
        return null;
      }
    }

    return payload;
  }

  /**
   * Decode JWT without verification
   */
  decode(token: string): JWTPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const encodedPayload = parts[1];
      if (!encodedPayload) {
        return null;
      }
      const payloadStr = Buffer.from(this.base64UrlDecode(encodedPayload), 'base64').toString();
      return JSON.parse(payloadStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isExpired(token: string): boolean {
    const payload = this.decode(token);
    if (!payload || !payload.exp) {
      return false;
    }
    return payload.exp < Math.floor(Date.now() / 1000);
  }

  /**
   * Parse duration string to seconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)(s|m|h|d)$/);
    if (!match) {
      return 0;
    }

    const value = parseInt(match[1] ?? '0', 10);
    const unit = match[2] ?? 's';

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 0;
    }
  }
}

/**
 * Create a new JWT instance
 *
 * @example
 * ```typescript
 * const jwt = createJWT();
 * const token = jwt.sign({ userId: 123 }, 'secret', { expiresIn: '1h' });
 * ```
 */
export function createJWT(): JWT {
  return new JWT();
}

/**
 * Default JWT instance
 */
export const jwt = createJWT();
