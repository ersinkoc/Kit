/**
 * Tests for data/session module
 * 100% coverage target
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager, createSessionManager } from '@oxog/kit/data';

interface UserSession {
  userId: string;
  username: string;
  email: string;
}

describe('SessionManager', () => {
  let sessions: SessionManager<UserSession>;

  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    sessions = new SessionManager<UserSession>({
      defaultTTL: 3600000,
      prefix: 'test_'
    });
  });

  afterEach(() => {
    sessions.destroy();
    sessions.clearPersistence?.();
  });

  describe('create', () => {
    it('should create a new session', () => {
      const session = sessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      expect(session).toBeDefined();
      expect(session.id).toMatch(/^test_/);
      expect(session.data).toEqual({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });
      expect(session.createdAt).toBeGreaterThan(0);
      expect(session.updatedAt).toBeGreaterThan(0);
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should generate unique session IDs', () => {
      const session1 = sessions.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });

      const session2 = sessions.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });

      expect(session1.id).not.toBe(session2.id);
    });

    it('should support custom TTL', () => {
      const shortTTLSession = new SessionManager<UserSession>({
        defaultTTL: 5000,
        prefix: 'short_'
      });

      const session = shortTTLSession.create(
        { userId: '123', username: 'test', email: 'test@test.com' },
        { ttl: 100 }
      );

      expect(session.expiresAt).toBeDefined();
      expect(session.expiresAt!).toBeLessThan(Date.now() + 200);

      shortTTLSession.destroy();
    });

    it('should support TTL of 0 (no expiration)', () => {
      const session = sessions.create(
        { userId: '123', username: 'test', email: 'test@test.com' },
        { ttl: 0 }
      );

      expect(session.expiresAt).toBeNull();
    });
  });

  describe('get', () => {
    it('should get existing session', () => {
      const created = sessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      const retrieved = sessions.get(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.data).toEqual(created.data);
    });

    it('should return undefined for non-existent session', () => {
      const retrieved = sessions.get('nonexistent');
      expect(retrieved).toBeUndefined();
    });

    it('should return undefined for expired session', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 50,
        prefix: 'short_'
      });

      const created = shortSession.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      await new Promise(resolve => setTimeout(resolve, 60));

      const retrieved = shortSession.get(created.id);
      expect(retrieved).toBeUndefined();

      shortSession.destroy();
    });

    it('should auto-remove expired session on get', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 50,
        prefix: 'short_'
      });

      const created = shortSession.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      await new Promise(resolve => setTimeout(resolve, 60));

      shortSession.get(created.id);

      expect(shortSession.size).toBe(0);

      shortSession.destroy();
    });
  });

  describe('getData', () => {
    it('should get session data only', () => {
      const created = sessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      const data = sessions.getData(created.id);

      expect(data).toEqual({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });
    });

    it('should return undefined for non-existent session', () => {
      const data = sessions.getData('nonexistent');
      expect(data).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for existing session', () => {
      const created = sessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      expect(sessions.has(created.id)).toBe(true);
    });

    it('should return false for non-existent session', () => {
      expect(sessions.has('nonexistent')).toBe(false);
    });

    it('should return false for expired session', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 50,
        prefix: 'short_'
      });

      const created = shortSession.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      await new Promise(resolve => setTimeout(resolve, 60));

      expect(shortSession.has(created.id)).toBe(false);

      shortSession.destroy();
    });
  });

  describe('set', () => {
    it('should update session data', async () => {
      const created = sessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 2));

      const success = sessions.set(created.id, { username: 'updated' });

      expect(success).toBe(true);

      const updated = sessions.get(created.id);
      expect(updated?.data.username).toBe('updated');
      expect(updated?.data.userId).toBe('123'); // Other fields preserved
      expect(updated?.updatedAt).toBeGreaterThan(created.updatedAt);
    });

    it('should return false for non-existent session', () => {
      const success = sessions.set('nonexistent', { username: 'updated' });
      expect(success).toBe(false);
    });

    it('should merge partial data', () => {
      const created = sessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      sessions.set(created.id, { email: 'newemail@example.com' });

      const updated = sessions.get(created.id);
      expect(updated?.data).toEqual({
        userId: '123',
        username: 'testuser',
        email: 'newemail@example.com'
      });
    });
  });

  describe('update', () => {
    it('should update session using function', () => {
      const created = sessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      const success = sessions.update(created.id, (data) => ({
        username: data.username.toUpperCase()
      }));

      expect(success).toBe(true);

      const updated = sessions.get(created.id);
      expect(updated?.data.username).toBe('TESTUSER');
    });

    it('should return false for non-existent session', () => {
      const success = sessions.update('nonexistent', () => ({
        username: 'updated'
      }));
      expect(success).toBe(false);
    });
  });

  describe('touch', () => {
    it('should update session expiration time', async () => {
      const created = sessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      const originalExpiresAt = created.expiresAt;
      const originalUpdatedAt = created.updatedAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const success = sessions.touch(created.id);

      expect(success).toBe(true);

      const updated = sessions.get(created.id);
      expect(updated?.updatedAt).toBeGreaterThan(originalUpdatedAt!);
      expect(updated?.expiresAt).toBeGreaterThan(originalExpiresAt!);
    });

    it('should support custom TTL on touch', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 5000,
        prefix: 'short_'
      });

      const created = shortSession.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      const success = shortSession.touch(created.id, { ttl: 100 });

      expect(success).toBe(true);

      const updated = shortSession.get(created.id);
      expect(updated?.expiresAt!).toBeLessThan(Date.now() + 150);

      shortSession.destroy();
    });

    it('should return false for non-existent session', () => {
      const success = sessions.touch('nonexistent');
      expect(success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing session', () => {
      const created = sessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      expect(sessions.has(created.id)).toBe(true);

      const deleted = sessions.delete(created.id);

      expect(deleted).toBe(true);
      expect(sessions.has(created.id)).toBe(false);
    });

    it('should return false for non-existent session', () => {
      const deleted = sessions.delete('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all sessions', () => {
      sessions.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      sessions.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });
      sessions.create({
        userId: '3',
        username: 'user3',
        email: 'user3@example.com'
      });

      expect(sessions.size).toBe(3);

      sessions.clear();

      expect(sessions.size).toBe(0);
      expect(sessions.ids()).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('should remove expired sessions', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 50,
        prefix: 'short_'
      });

      shortSession.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      shortSession.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });

      expect(shortSession.size).toBe(2);

      await new Promise(resolve => setTimeout(resolve, 60));

      const removed = shortSession.cleanup();

      expect(removed).toBe(2);
      expect(shortSession.size).toBe(0);

      shortSession.destroy();
    });

    it('should not remove active sessions', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 5000,
        prefix: 'short_'
      });

      const session1 = shortSession.create(
        { userId: '1', username: 'user1', email: 'user1@example.com' },
        { ttl: 50 }
      );

      const session2 = shortSession.create(
        { userId: '2', username: 'user2', email: 'user2@example.com' },
        { ttl: 1000 }
      );

      await new Promise(resolve => setTimeout(resolve, 60));

      const removed = shortSession.cleanup();

      expect(removed).toBe(1);
      expect(shortSession.has(session1.id)).toBe(false);
      expect(shortSession.has(session2.id)).toBe(true);

      shortSession.destroy();
    });

    it('should return 0 when no expired sessions', () => {
      sessions.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });

      const removed = sessions.cleanup();
      expect(removed).toBe(0);
    });
  });

  describe('all', () => {
    it('should return all active sessions', () => {
      const session1 = sessions.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      const session2 = sessions.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });
      const session3 = sessions.create({
        userId: '3',
        username: 'user3',
        email: 'user3@example.com'
      });

      const all = sessions.all();

      expect(all).toHaveLength(3);
      expect(all).toContainEqual(session1);
      expect(all).toContainEqual(session2);
      expect(all).toContainEqual(session3);
    });

    it('should not include expired sessions', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 50,
        prefix: 'short_'
      });

      shortSession.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      shortSession.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });

      await new Promise(resolve => setTimeout(resolve, 60));

      const all = shortSession.all();
      expect(all).toHaveLength(0);

      shortSession.destroy();
    });
  });

  describe('size', () => {
    it('should return number of active sessions', () => {
      expect(sessions.size).toBe(0);

      sessions.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      expect(sessions.size).toBe(1);

      sessions.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });
      expect(sessions.size).toBe(2);

      sessions.create({
        userId: '3',
        username: 'user3',
        email: 'user3@example.com'
      });
      expect(sessions.size).toBe(3);
    });

    it('should not count expired sessions', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 50,
        prefix: 'short_'
      });

      shortSession.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      shortSession.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });

      await new Promise(resolve => setTimeout(resolve, 60));

      expect(shortSession.size).toBe(0);

      shortSession.destroy();
    });
  });

  describe('ids', () => {
    it('should return all active session IDs', () => {
      const session1 = sessions.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      const session2 = sessions.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });

      const ids = sessions.ids();

      expect(ids).toHaveLength(2);
      expect(ids).toContain(session1.id);
      expect(ids).toContain(session2.id);
    });

    it('should not include expired session IDs', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 50,
        prefix: 'short_'
      });

      const session = shortSession.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });

      await new Promise(resolve => setTimeout(resolve, 60));

      const ids = shortSession.ids();
      expect(ids).toHaveLength(0);

      shortSession.destroy();
    });
  });

  describe('getStats', () => {
    it('should return session statistics', () => {
      sessions.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      sessions.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });

      const stats = sessions.getStats();

      expect(stats.total).toBe(2);
      expect(stats.active).toBe(2);
      expect(stats.expired).toBe(0);
    });

    it('should count expired sessions', async () => {
      const shortSession = new SessionManager<UserSession>({
        defaultTTL: 50,
        prefix: 'short_'
      });

      shortSession.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      shortSession.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      }, { ttl: 1000 }); // Longer TTL

      await new Promise(resolve => setTimeout(resolve, 60));

      const stats = shortSession.getStats();

      expect(stats.total).toBe(2);
      expect(stats.active).toBe(1);
      expect(stats.expired).toBe(1);

      shortSession.destroy();
    });
  });

  describe('persistence', () => {
    beforeEach(() => {
      if (typeof localStorage === 'undefined') return;
    });

    it('should persist sessions to localStorage', () => {
      if (typeof localStorage === 'undefined') return;

      const persistedSessions = new SessionManager<UserSession>({
        defaultTTL: 3600000,
        prefix: 'persist_',
        persist: true,
        storageKey: 'test-sessions'
      });

      persistedSessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      const saved = localStorage.getItem('test-sessions');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);

      persistedSessions.destroy();
      persistedSessions.clearPersistence();
    });

    it('should load sessions from localStorage', () => {
      if (typeof localStorage === 'undefined') return;

      const sessionData: [string, UserSession & {
        createdAt: number;
        updatedAt: number;
        expiresAt: number | null;
      }][] = [
        ['test_id', {
          userId: '123',
          username: 'loaded',
          email: 'loaded@example.com',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          expiresAt: Date.now() + 3600000
        }]
      ];

      localStorage.setItem('test-sessions', JSON.stringify(sessionData));

      const persistedSessions = new SessionManager<UserSession>({
        defaultTTL: 3600000,
        prefix: 'persist_',
        persist: true,
        storageKey: 'test-sessions'
      });

      expect(persistedSessions.size).toBe(1);
      expect(persistedSessions.has('test_id')).toBe(true);

      persistedSessions.destroy();
      persistedSessions.clearPersistence();
    });

    it('should clear persisted sessions', () => {
      if (typeof localStorage === 'undefined') return;

      const persistedSessions = new SessionManager<UserSession>({
        defaultTTL: 3600000,
        prefix: 'persist_',
        persist: true,
        storageKey: 'test-sessions'
      });

      persistedSessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      expect(localStorage.getItem('test-sessions')).toBeDefined();

      persistedSessions.clearPersistence();
      expect(localStorage.getItem('test-sessions')).toBeNull();

      persistedSessions.destroy();
    });

    it('should handle localStorage errors gracefully', () => {
      if (typeof localStorage === 'undefined') return;

      const originalGetItem = localStorage.getItem;
      const originalSetItem = localStorage.setItem;

      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const errorSessions = new SessionManager<UserSession>({
        defaultTTL: 3600000,
        prefix: 'error_',
        persist: true,
        storageKey: 'error-sessions'
      });

      // Should not throw despite localStorage errors
      expect(() => errorSessions.create({
        userId: '123',
        username: 'test',
        email: 'test@test.com'
      })).not.toThrow();

      errorSessions.destroy();
      errorSessions.clearPersistence();

      localStorage.getItem = originalGetItem;
      localStorage.setItem = originalSetItem;
    });
  });

  describe('destroy', () => {
    it('should cleanup interval', () => {
      vi.useFakeTimers();

      const autoSession = new SessionManager<UserSession>({
        defaultTTL: 50000,
        cleanupInterval: 1000
      });

      autoSession.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      autoSession.destroy();

      // Advance time - if interval was not cleared, it would try to run
      vi.advanceTimersByTime(2000);

      // Should have no effect since destroyed
      expect(autoSession.size).toBe(0);

      vi.useRealTimers();
    });

    it('should clear all sessions', () => {
      sessions.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      sessions.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });

      expect(sessions.size).toBe(2);

      sessions.destroy();

      expect(sessions.size).toBe(0);
    });

    it('should clear persistence', () => {
      if (typeof localStorage === 'undefined') return;

      const persistedSessions = new SessionManager<UserSession>({
        defaultTTL: 3600000,
        prefix: 'persist_',
        persist: true,
        storageKey: 'destroy-test'
      });

      persistedSessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      expect(localStorage.getItem('destroy-test')).toBeDefined();

      persistedSessions.destroy();

      expect(localStorage.getItem('destroy-test')).toBeNull();
    });
  });

  describe('createSessionManager factory', () => {
    it('should create session manager instance', () => {
      const newSessions = createSessionManager<UserSession>({
        defaultTTL: 7200000,
        prefix: 'factory_'
      });

      expect(newSessions).toBeInstanceOf(SessionManager);

      const session = newSessions.create({
        userId: '123',
        username: 'factory',
        email: 'factory@example.com'
      });

      expect(session.id).toMatch(/^factory_/);

      newSessions.destroy();
    });
  });

  describe('custom prefix', () => {
    it('should use custom prefix for session IDs', () => {
      const customSessions = new SessionManager<UserSession>({
        prefix: 'custom_'
      });

      const session = customSessions.create({
        userId: '123',
        username: 'testuser',
        email: 'test@example.com'
      });

      expect(session.id).toMatch(/^custom_/);

      customSessions.destroy();
    });
  });

  describe('auto cleanup', () => {
    it('should automatically clean expired sessions', async () => {
      vi.useFakeTimers();

      const autoSessions = new SessionManager<UserSession>({
        defaultTTL: 1000,
        cleanupInterval: 500
      });

      autoSessions.create({
        userId: '1',
        username: 'user1',
        email: 'user1@example.com'
      });
      autoSessions.create({
        userId: '2',
        username: 'user2',
        email: 'user2@example.com'
      });

      expect(autoSessions.size).toBe(2);

      // Advance time past expiration and cleanup interval
      vi.advanceTimersByTime(1500);

      // Advance to next cleanup interval
      vi.advanceTimersByTime(500);

      expect(autoSessions.size).toBe(0);

      autoSessions.destroy();
      vi.useRealTimers();
    });
  });
});
