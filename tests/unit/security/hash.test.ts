/**
 * Tests for hash module (password hashing)
 */
import { describe, it, expect } from 'vitest';
import { PasswordHash, createPasswordHash, hash } from '@oxog/kit/security';

describe('PasswordHash', () => {
  describe('password', () => {
    it('should hash a password', () => {
      const hashed = hash.password('secret123');
      expect(hashed).toMatch(/^\$pbkdf2\$/);
    });

    it('should produce hash in correct format', () => {
      const hashed = hash.password('test');
      const parts = hashed.split('$');
      expect(parts.length).toBe(5);
      expect(parts[0]).toBe('');
      expect(parts[1]).toBe('pbkdf2');
      expect(parseInt(parts[2]!, 10)).toBeGreaterThan(0); // cost
      expect(parts[3]!.length).toBeGreaterThan(0); // salt (base64)
      expect(parts[4]!.length).toBeGreaterThan(0); // hash (base64)
    });

    it('should produce different hashes for same password', () => {
      const hash1 = hash.password('secret');
      const hash2 = hash.password('secret');
      expect(hash1).not.toBe(hash2);
    });

    it('should use custom cost', () => {
      const hashed = hash.password('test', { cost: 1000 });
      const parts = hashed.split('$');
      expect(parts[2]).toBe('1000');
    });

    it('should work with empty password', () => {
      const hashed = hash.password('');
      expect(hashed).toMatch(/^\$pbkdf2\$/);
    });

    it('should work with unicode passwords', () => {
      const hashed = hash.password('密码123🔑');
      expect(hashed).toMatch(/^\$pbkdf2\$/);
    });

    it('should work with very long passwords', () => {
      const longPassword = 'a'.repeat(10000);
      const hashed = hash.password(longPassword);
      expect(hashed).toMatch(/^\$pbkdf2\$/);
    });
  });

  describe('verify', () => {
    it('should verify correct password', () => {
      const hashed = hash.password('secret123');
      expect(hash.verify('secret123', hashed)).toBe(true);
    });

    it('should reject incorrect password', () => {
      const hashed = hash.password('secret123');
      expect(hash.verify('wrongpassword', hashed)).toBe(false);
    });

    it('should reject similar passwords', () => {
      const hashed = hash.password('secret123');
      expect(hash.verify('secret124', hashed)).toBe(false);
      expect(hash.verify('Secret123', hashed)).toBe(false);
      expect(hash.verify('secret123 ', hashed)).toBe(false);
    });

    it('should verify empty password', () => {
      const hashed = hash.password('');
      expect(hash.verify('', hashed)).toBe(true);
      expect(hash.verify('x', hashed)).toBe(false);
    });

    it('should verify unicode passwords', () => {
      const password = '密码123🔑';
      const hashed = hash.password(password);
      expect(hash.verify(password, hashed)).toBe(true);
      expect(hash.verify('密码123', hashed)).toBe(false);
    });

    it('should reject invalid hash format', () => {
      expect(hash.verify('password', 'invalid-hash')).toBe(false);
      expect(hash.verify('password', '')).toBe(false);
      expect(hash.verify('password', '$invalid$format$')).toBe(false);
    });

    it('should reject hash with wrong algorithm', () => {
      expect(hash.verify('password', '$bcrypt$10$salt$hash')).toBe(false);
    });

    it('should verify hashes with different costs', () => {
      const hashed1000 = hash.password('test', { cost: 1000 });
      const hashed5000 = hash.password('test', { cost: 5000 });

      expect(hash.verify('test', hashed1000)).toBe(true);
      expect(hash.verify('test', hashed5000)).toBe(true);
    });
  });

  describe('needsRehash', () => {
    it('should return false for hash with same cost', () => {
      const hashed = hash.password('test', { cost: 10000 });
      expect(hash.needsRehash(hashed, { cost: 10000 })).toBe(false);
    });

    it('should return true for hash with different cost', () => {
      const hashed = hash.password('test', { cost: 1000 });
      expect(hash.needsRehash(hashed, { cost: 10000 })).toBe(true);
    });

    it('should return true for invalid hash format', () => {
      expect(hash.needsRehash('invalid-hash')).toBe(true);
      expect(hash.needsRehash('')).toBe(true);
      expect(hash.needsRehash('$bcrypt$10$salt$hash')).toBe(true);
    });

    it('should return true for hash with lower cost than default', () => {
      const hashed = hash.password('test', { cost: 1000 });
      expect(hash.needsRehash(hashed)).toBe(true); // Default is 100000
    });

    it('should check against provided options', () => {
      const hashed = hash.password('test', { cost: 5000 });
      expect(hash.needsRehash(hashed, { cost: 5000 })).toBe(false);
      expect(hash.needsRehash(hashed, { cost: 10000 })).toBe(true);
    });
  });

  describe('security properties', () => {
    it('should use unique salt for each hash', () => {
      const hash1 = hash.password('test');
      const hash2 = hash.password('test');

      const salt1 = hash1.split('$')[3];
      const salt2 = hash2.split('$')[3];

      expect(salt1).not.toBe(salt2);
    });

    it('should produce hash of consistent length', () => {
      const passwords = ['a', 'abc', 'a'.repeat(100), 'a'.repeat(1000)];
      const hashLengths = passwords.map((p) => {
        const hashed = hash.password(p, { cost: 100 });
        return hashed.split('$')[4]!.length;
      });

      // All hashes should be the same length
      expect(new Set(hashLengths).size).toBe(1);
    });
  });
});

describe('createPasswordHash', () => {
  it('should create a new PasswordHash instance', () => {
    const instance = createPasswordHash();
    expect(instance).toBeInstanceOf(PasswordHash);
  });

  it('should create independent instances', () => {
    const instance1 = createPasswordHash();
    const instance2 = createPasswordHash();
    expect(instance1).not.toBe(instance2);
  });

  it('should work independently', () => {
    const hasher1 = createPasswordHash();
    const hasher2 = createPasswordHash();

    const hashed = hasher1.password('test', { cost: 100 });
    expect(hasher2.verify('test', hashed)).toBe(true);
  });
});

describe('hash default instance', () => {
  it('should be a PasswordHash instance', () => {
    expect(hash).toBeInstanceOf(PasswordHash);
  });
});
