/**
 * Tests for JWT module
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JWT, createJWT, jwt } from '@oxog/kit/security';

describe('JWT', () => {
  const secret = 'test-secret-key-12345';

  describe('sign', () => {
    it('should create a valid JWT token', () => {
      const token = jwt.sign({ userId: 123 }, secret);
      expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    });

    it('should include payload in token', () => {
      const payload = { userId: 123, name: 'John' };
      const token = jwt.sign(payload, secret);
      const decoded = jwt.decode(token);
      expect(decoded!.userId).toBe(123);
      expect(decoded!.name).toBe('John');
    });

    it('should add iat (issued at) claim', () => {
      const before = Math.floor(Date.now() / 1000);
      const token = jwt.sign({}, secret);
      const after = Math.floor(Date.now() / 1000);

      const decoded = jwt.decode(token);
      expect(decoded!.iat).toBeGreaterThanOrEqual(before);
      expect(decoded!.iat).toBeLessThanOrEqual(after);
    });

    it('should add exp claim with expiresIn option', () => {
      const token = jwt.sign({}, secret, { expiresIn: '1h' });
      const decoded = jwt.decode(token);

      const expectedExp = Math.floor(Date.now() / 1000) + 3600;
      expect(decoded!.exp).toBeGreaterThanOrEqual(expectedExp - 1);
      expect(decoded!.exp).toBeLessThanOrEqual(expectedExp + 1);
    });

    it('should parse various duration formats', () => {
      const tests = [
        { duration: '30s', seconds: 30 },
        { duration: '5m', seconds: 300 },
        { duration: '2h', seconds: 7200 },
        { duration: '7d', seconds: 604800 },
      ];

      for (const { duration, seconds } of tests) {
        const token = jwt.sign({}, secret, { expiresIn: duration });
        const decoded = jwt.decode(token);
        const expectedExp = (decoded!.iat as number) + seconds;
        expect(decoded!.exp).toBe(expectedExp);
      }
    });

    it('should add issuer claim with issuer option', () => {
      const token = jwt.sign({}, secret, { issuer: 'my-app' });
      const decoded = jwt.decode(token);
      expect(decoded!.iss).toBe('my-app');
    });

    it('should add audience claim with audience option', () => {
      const token = jwt.sign({}, secret, { audience: 'my-audience' });
      const decoded = jwt.decode(token);
      expect(decoded!.aud).toBe('my-audience');
    });

    it('should handle array audience', () => {
      const token = jwt.sign({}, secret, { audience: ['aud1', 'aud2'] });
      const decoded = jwt.decode(token);
      expect(decoded!.aud).toEqual(['aud1', 'aud2']);
    });

    it('should preserve existing payload claims', () => {
      const token = jwt.sign({ iat: 12345 }, secret);
      const decoded = jwt.decode(token);
      // With current implementation, payload iat overwrites default iat
      expect(decoded!.iat).toBe(12345);
    });
  });

  describe('verify', () => {
    it('should verify valid token', () => {
      const token = jwt.sign({ userId: 123 }, secret);
      const payload = jwt.verify(token, secret);
      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe(123);
    });

    it('should return null for invalid signature', () => {
      const token = jwt.sign({ userId: 123 }, secret);
      const payload = jwt.verify(token, 'wrong-secret');
      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      expect(jwt.verify('invalid', secret)).toBeNull();
      expect(jwt.verify('a.b', secret)).toBeNull();
      expect(jwt.verify('a.b.c.d', secret)).toBeNull();
    });

    it('should return null for expired token', () => {
      const token = jwt.sign({ userId: 123 }, secret, { expiresIn: '1s' });

      // Mock time to be 2 seconds in the future
      const originalDateNow = Date.now;
      Date.now = () => originalDateNow() + 2000;

      const payload = jwt.verify(token, secret);
      expect(payload).toBeNull();

      Date.now = originalDateNow;
    });

    it('should return null for token not yet valid (nbf)', () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jwt.sign({ nbf: now + 3600 }, secret);

      const payload = jwt.verify(token, secret);
      expect(payload).toBeNull();
    });

    it('should verify issuer when option provided', () => {
      const token = jwt.sign({}, secret, { issuer: 'my-app' });

      expect(jwt.verify(token, secret, { issuer: 'my-app' })).not.toBeNull();
      expect(jwt.verify(token, secret, { issuer: 'other-app' })).toBeNull();
    });

    it('should verify audience when option provided', () => {
      const token = jwt.sign({}, secret, { audience: 'my-audience' });

      expect(jwt.verify(token, secret, { audience: 'my-audience' })).not.toBeNull();
      expect(jwt.verify(token, secret, { audience: 'other-audience' })).toBeNull();
    });

    it('should verify array audience', () => {
      const token = jwt.sign({}, secret, { audience: ['aud1', 'aud2'] });

      expect(jwt.verify(token, secret, { audience: 'aud1' })).not.toBeNull();
      expect(jwt.verify(token, secret, { audience: 'aud2' })).not.toBeNull();
      expect(jwt.verify(token, secret, { audience: 'aud3' })).toBeNull();
    });

    it('should verify against array of allowed audiences', () => {
      const token = jwt.sign({}, secret, { audience: 'aud2' });

      expect(jwt.verify(token, secret, { audience: ['aud1', 'aud2'] })).not.toBeNull();
      expect(jwt.verify(token, secret, { audience: ['aud3', 'aud4'] })).toBeNull();
    });
  });

  describe('decode', () => {
    it('should decode token without verification', () => {
      const token = jwt.sign({ userId: 123 }, secret);
      const payload = jwt.decode(token);
      expect(payload!.userId).toBe(123);
    });

    it('should decode token with wrong secret', () => {
      const token = jwt.sign({ userId: 123 }, secret);
      const payload = jwt.decode(token);
      expect(payload).not.toBeNull();
    });

    it('should return null for malformed token', () => {
      expect(jwt.decode('invalid')).toBeNull();
      expect(jwt.decode('a.b')).toBeNull();
    });

    it('should return null for invalid base64', () => {
      expect(jwt.decode('header.!!!.signature')).toBeNull();
    });

    it('should decode complex payload', () => {
      const payload = {
        userId: 123,
        roles: ['admin', 'user'],
        metadata: { key: 'value' },
      };
      const token = jwt.sign(payload, secret);
      const decoded = jwt.decode(token);

      expect(decoded!.userId).toBe(123);
      expect(decoded!.roles).toEqual(['admin', 'user']);
      expect(decoded!.metadata).toEqual({ key: 'value' });
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired token', () => {
      const token = jwt.sign({}, secret, { expiresIn: '1h' });
      expect(jwt.isExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const token = jwt.sign({}, secret, { expiresIn: '1s' });

      // Mock time to be 2 seconds in the future
      const originalDateNow = Date.now;
      Date.now = () => originalDateNow() + 2000;

      expect(jwt.isExpired(token)).toBe(true);

      Date.now = originalDateNow;
    });

    it('should return false for token without exp claim', () => {
      const token = jwt.sign({}, secret);
      expect(jwt.isExpired(token)).toBe(false);
    });

    it('should return false for invalid token', () => {
      expect(jwt.isExpired('invalid')).toBe(false);
    });
  });

  describe('security', () => {
    it('should reject tampered payload', () => {
      const token = jwt.sign({ userId: 123 }, secret);
      const parts = token.split('.');

      // Tamper with payload
      const payload = JSON.parse(Buffer.from(parts[1]!, 'base64').toString());
      payload.userId = 456;
      const tamperedPayload = Buffer.from(JSON.stringify(payload))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
      expect(jwt.verify(tamperedToken, secret)).toBeNull();
    });

    it('should reject tampered header', () => {
      const token = jwt.sign({ userId: 123 }, secret);
      const parts = token.split('.');

      // Tamper with header
      const header = JSON.parse(Buffer.from(parts[0]!, 'base64').toString());
      header.alg = 'none';
      const tamperedHeader = Buffer.from(JSON.stringify(header))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const tamperedToken = `${tamperedHeader}.${parts[1]}.${parts[2]}`;
      expect(jwt.verify(tamperedToken, secret)).toBeNull();
    });

    it('should use different signatures for different secrets', () => {
      const token1 = jwt.sign({ data: 'test' }, 'secret1');
      const token2 = jwt.sign({ data: 'test' }, 'secret2');

      const sig1 = token1.split('.')[2];
      const sig2 = token2.split('.')[2];
      expect(sig1).not.toBe(sig2);
    });
  });
});

describe('createJWT', () => {
  it('should create a new JWT instance', () => {
    const instance = createJWT();
    expect(instance).toBeInstanceOf(JWT);
  });

  it('should create independent instances', () => {
    const instance1 = createJWT();
    const instance2 = createJWT();
    expect(instance1).not.toBe(instance2);
  });

  it('should work independently', () => {
    const jwt1 = createJWT();
    const jwt2 = createJWT();

    const token = jwt1.sign({ test: true }, 'secret');
    const payload = jwt2.verify(token, 'secret');
    expect(payload!.test).toBe(true);
  });
});

describe('jwt default instance', () => {
  it('should be a JWT instance', () => {
    expect(jwt).toBeInstanceOf(JWT);
  });
});
