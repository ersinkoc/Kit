/**
 * Tests for crypto module
 */
import { describe, it, expect } from 'vitest';
import { Crypto, createCrypto, crypto } from '@oxog/kit/security';

describe('Crypto', () => {
  describe('hash', () => {
    it('should create MD5 hash', () => {
      const result = crypto.hash('md5', 'hello');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });

    it('should create SHA1 hash', () => {
      const result = crypto.hash('sha1', 'hello');
      expect(result).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
    });

    it('should create SHA256 hash', () => {
      const result = crypto.hash('sha256', 'hello');
      expect(result).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    it('should create SHA384 hash', () => {
      const result = crypto.hash('sha384', 'hello');
      expect(result).toHaveLength(96); // 384 bits = 48 bytes = 96 hex chars
    });

    it('should create SHA512 hash', () => {
      const result = crypto.hash('sha512', 'hello');
      expect(result).toHaveLength(128); // 512 bits = 64 bytes = 128 hex chars
    });

    it('should produce consistent hashes', () => {
      const hash1 = crypto.hash('sha256', 'test');
      const hash2 = crypto.hash('sha256', 'test');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = crypto.hash('sha256', 'test1');
      const hash2 = crypto.hash('sha256', 'test2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hmac', () => {
    it('should create HMAC-MD5', () => {
      const result = crypto.hmac('md5', 'hello', 'secret');
      expect(result).toBe('bade63863c61ed0b3165806ecd6acefc');
    });

    it('should create HMAC-SHA256', () => {
      const result = crypto.hmac('sha256', 'hello', 'secret');
      expect(result).toHaveLength(64);
    });

    it('should produce different HMACs for different keys', () => {
      const hmac1 = crypto.hmac('sha256', 'hello', 'key1');
      const hmac2 = crypto.hmac('sha256', 'hello', 'key2');
      expect(hmac1).not.toBe(hmac2);
    });

    it('should produce consistent HMACs', () => {
      const hmac1 = crypto.hmac('sha256', 'data', 'key');
      const hmac2 = crypto.hmac('sha256', 'data', 'key');
      expect(hmac1).toBe(hmac2);
    });
  });

  describe('randomBytes', () => {
    it('should generate buffer of correct size', () => {
      const bytes = crypto.randomBytes(16);
      expect(bytes).toBeInstanceOf(Buffer);
      expect(bytes.length).toBe(16);
    });

    it('should generate different values each time', () => {
      const bytes1 = crypto.randomBytes(16);
      const bytes2 = crypto.randomBytes(16);
      expect(bytes1.toString('hex')).not.toBe(bytes2.toString('hex'));
    });

    it('should generate large buffers', () => {
      const bytes = crypto.randomBytes(1024);
      expect(bytes.length).toBe(1024);
    });
  });

  describe('randomString', () => {
    it('should generate string of correct length', () => {
      const str = crypto.randomString(32);
      expect(str.length).toBe(32);
    });

    it('should use default charset', () => {
      const str = crypto.randomString(100);
      expect(str).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should use custom charset', () => {
      const str = crypto.randomString(10, 'abc');
      expect(str).toMatch(/^[abc]+$/);
    });

    it('should generate different strings each time', () => {
      const str1 = crypto.randomString(32);
      const str2 = crypto.randomString(32);
      expect(str1).not.toBe(str2);
    });
  });

  describe('randomInt', () => {
    it('should generate integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const num = crypto.randomInt(1, 10);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
        expect(Number.isInteger(num)).toBe(true);
      }
    });

    it('should generate inclusive range', () => {
      const results = new Set<number>();
      for (let i = 0; i < 1000; i++) {
        results.add(crypto.randomInt(1, 3));
      }
      expect(results.has(1)).toBe(true);
      expect(results.has(2)).toBe(true);
      expect(results.has(3)).toBe(true);
    });

    it('should handle single value range', () => {
      const num = crypto.randomInt(5, 5);
      expect(num).toBe(5);
    });
  });

  describe('randomUUID', () => {
    it('should generate valid UUID v4 format', () => {
      const uuid = crypto.randomUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        uuids.add(crypto.randomUUID());
      }
      expect(uuids.size).toBe(100);
    });

    it('should have version 4 indicator', () => {
      const uuid = crypto.randomUUID();
      expect(uuid.charAt(14)).toBe('4');
    });
  });

  describe('encrypt/decrypt', () => {
    const key = crypto.randomBytes(32); // 256-bit key for AES-256

    it('should encrypt and decrypt data', () => {
      const original = 'Hello, World!';
      const { encrypted, iv, authTag } = crypto.encrypt(original, key);

      const decrypted = crypto.decrypt(encrypted, key, iv, authTag);
      expect(decrypted).toBe(original);
    });

    it('should produce different ciphertexts for same plaintext', () => {
      const original = 'test data';
      const result1 = crypto.encrypt(original, key);
      const result2 = crypto.encrypt(original, key);
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });

    it('should encrypt binary data', () => {
      const original = Buffer.from([0x00, 0x01, 0x02, 0x03]);
      const { encrypted, iv, authTag } = crypto.encrypt(original, key);

      const decrypted = crypto.decrypt(encrypted, key, iv, authTag);
      expect(decrypted).toBe(original.toString());
    });

    it('should handle empty string', () => {
      const original = '';
      const { encrypted, iv, authTag } = crypto.encrypt(original, key);

      const decrypted = crypto.decrypt(encrypted, key, iv, authTag);
      expect(decrypted).toBe(original);
    });

    it('should handle unicode characters', () => {
      const original = '你好世界 🌍 مرحبا';
      const { encrypted, iv, authTag } = crypto.encrypt(original, key);

      const decrypted = crypto.decrypt(encrypted, key, iv, authTag);
      expect(decrypted).toBe(original);
    });

    it('should fail with wrong key', () => {
      const original = 'secret data';
      const { encrypted, iv, authTag } = crypto.encrypt(original, key);

      const wrongKey = crypto.randomBytes(32);
      expect(() => {
        crypto.decrypt(encrypted, wrongKey, iv, authTag);
      }).toThrow();
    });

    it('should fail with tampered authTag', () => {
      const original = 'secret data';
      const { encrypted, iv } = crypto.encrypt(original, key);

      const tamperedAuthTag = Buffer.from(crypto.randomBytes(16)).toString('base64');
      expect(() => {
        crypto.decrypt(encrypted, key, iv, tamperedAuthTag);
      }).toThrow();
    });
  });

  describe('timingSafeEqual', () => {
    it('should return true for equal strings', () => {
      expect(crypto.timingSafeEqual('hello', 'hello')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(crypto.timingSafeEqual('hello', 'world')).toBe(false);
    });

    it('should return false for different lengths', () => {
      expect(crypto.timingSafeEqual('hello', 'hello!')).toBe(false);
    });

    it('should work with buffers', () => {
      const a = Buffer.from('test');
      const b = Buffer.from('test');
      expect(crypto.timingSafeEqual(a, b)).toBe(true);
    });
  });
});

describe('createCrypto', () => {
  it('should create a new Crypto instance', () => {
    const instance = createCrypto();
    expect(instance).toBeInstanceOf(Crypto);
  });

  it('should create independent instances', () => {
    const instance1 = createCrypto();
    const instance2 = createCrypto();
    expect(instance1).not.toBe(instance2);
  });
});

describe('crypto default instance', () => {
  it('should be a Crypto instance', () => {
    expect(crypto).toBeInstanceOf(Crypto);
  });
});
