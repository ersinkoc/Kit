/**
 * Session manager with TTL and storage support
 */

import { string as randomString } from '../utils/random';

/**
 * Session data structure
 */
export interface Session<T = Record<string, unknown>> {
  id: string;
  data: T;
  createdAt: number;
  updatedAt: number;
  expiresAt: number | null;
}

/**
 * Session manager options
 */
export interface SessionManagerOptions {
  /** Default session TTL in milliseconds */
  defaultTTL?: number;
  /** Session ID prefix */
  prefix?: string;
  /** Storage key for persistence */
  storageKey?: string;
  /** Persist sessions to localStorage */
  persist?: boolean;
  /** Auto cleanup interval in milliseconds (0 to disable) */
  cleanupInterval?: number;
}

/**
 * Session manager with TTL and storage support
 *
 * @example
 * ```typescript
 * import { createSessionManager } from '@oxog/kit/data';
 *
 * interface UserSession {
 *   userId: string;
 *   username: string;
 * }
 *
 * const sessions = createSessionManager<UserSession>({
 *   defaultTTL: 3600000 // 1 hour
 * });
 *
 * // Create a session
 * const session = sessions.create({ userId: '123', username: 'test' });
 *
 * // Get session data
 * const data = sessions.get(session.id);
 *
 * // Update session
 * sessions.set(session.id, { username: 'updated' });
 *
 * // Delete session
 * sessions.delete(session.id);
 *
 * // Clean up expired sessions
 * sessions.cleanup();
 * ```
 */
export class SessionManager<T extends Record<string, unknown> = Record<string, unknown>> {
  private sessions: Map<string, Session<T>> = new Map();
  private defaultTTL: number;
  private prefix: string;
  private persist: boolean;
  private storageKey?: string;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(options: SessionManagerOptions = {}) {
    this.defaultTTL = options.defaultTTL ?? 3600000; // 1 hour default
    this.prefix = options.prefix ?? 'sess_';
    this.persist = options.persist ?? false;
    this.storageKey = options.storageKey;

    // Load from storage if persisting
    if (this.persist && this.storageKey) {
      this.loadFromStorage();
    }

    // Auto cleanup every 5 minutes by default
    const cleanupInterval = options.cleanupInterval ?? 300000;
    if (cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => this.cleanup(), cleanupInterval);
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateId(): string {
    return `${this.prefix}${randomString(16)}`;
  }

  /**
   * Create a new session
   */
  create(data: T, options: { ttl?: number } = {}): Session<T> {
    const id = this.generateId();
    const now = Date.now();
    const ttl = options.ttl ?? this.defaultTTL;

    const session: Session<T> = {
      id,
      data,
      createdAt: now,
      updatedAt: now,
      expiresAt: ttl > 0 ? now + ttl : null,
    };

    this.sessions.set(id, session);
    this.saveToStorage();

    // Return a copy to prevent external mutations
    return { ...session, data: { ...session.data } };
  }

  /**
   * Get a session by ID
   */
  get(id: string): Session<T> | undefined {
    const session = this.sessions.get(id);

    if (!session) return undefined;

    // Check expiration
    if (session.expiresAt && session.expiresAt < Date.now()) {
      this.sessions.delete(id);
      this.saveToStorage();
      return undefined;
    }

    // Return a copy to prevent external mutations
    return { ...session, data: { ...session.data } };
  }

  /**
   * Get session data only
   */
  getData(id: string): T | undefined {
    return this.get(id)?.data;
  }

  /**
   * Check if a session exists and is valid
   */
  has(id: string): boolean {
    return this.get(id) !== undefined;
  }

  /**
   * Update session data
   */
  set(id: string, data: Partial<T>): boolean {
    const session = this.sessions.get(id);

    if (!session) return false;

    // Check expiration
    if (session.expiresAt && session.expiresAt < Date.now()) {
      this.sessions.delete(id);
      this.saveToStorage();
      return false;
    }

    session.data = { ...session.data, ...data } as T;
    session.updatedAt = Date.now();

    this.sessions.set(id, session);
    this.saveToStorage();

    return true;
  }

  /**
   * Update session using a function
   */
  update(id: string, updater: (data: T) => Partial<T>): boolean {
    const session = this.sessions.get(id);

    if (!session) return false;

    // Check expiration
    if (session.expiresAt && session.expiresAt < Date.now()) {
      this.sessions.delete(id);
      this.saveToStorage();
      return false;
    }

    const updates = updater(session.data);
    return this.set(id, updates);
  }

  /**
   * Touch session (update last access time)
   */
  touch(id: string, options: { ttl?: number } = {}): boolean {
    const session = this.sessions.get(id);

    if (!session) return false;

    // Check expiration
    if (session.expiresAt && session.expiresAt < Date.now()) {
      this.sessions.delete(id);
      this.saveToStorage();
      return false;
    }

    const ttl = options.ttl ?? this.defaultTTL;
    session.updatedAt = Date.now();
    session.expiresAt = ttl > 0 ? Date.now() + ttl : null;

    this.sessions.set(id, session);
    this.saveToStorage();

    return true;
  }

  /**
   * Delete a session
   */
  delete(id: string): boolean {
    const deleted = this.sessions.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    this.sessions.clear();
    this.saveToStorage();
  }

  /**
   * Remove expired sessions
   */
  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [id, session] of this.sessions) {
      if (session.expiresAt && session.expiresAt < now) {
        this.sessions.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      this.saveToStorage();
    }

    return removed;
  }

  /**
   * Get all active sessions
   */
  all(): Session<T>[] {
    const result: Session<T>[] = [];
    const now = Date.now();

    for (const session of this.sessions.values()) {
      if (!session.expiresAt || session.expiresAt > now) {
        result.push(session);
      }
    }

    return result;
  }

  /**
   * Get session count
   */
  get size(): number {
    return this.all().length;
  }

  /**
   * Get all session IDs
   */
  ids(): string[] {
    return this.all().map((s) => s.id);
  }

  /**
   * Get session statistics
   */
  getStats(): {
    total: number;
    active: number;
    expired: number;
  } {
    const total = this.sessions.size;
    const active = this.size;
    const expired = total - active;

    return { total, active, expired };
  }

  /**
   * Save sessions to localStorage
   */
  private saveToStorage(): void {
    if (this.persist && this.storageKey && typeof localStorage !== 'undefined') {
      try {
        const serialized = Array.from(this.sessions.entries());
        localStorage.setItem(this.storageKey, JSON.stringify(serialized));
      } catch (error) {
        console.error('Failed to persist sessions:', error);
      }
    }
  }

  /**
   * Load sessions from localStorage
   */
  private loadFromStorage(): void {
    if (this.persist && this.storageKey && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const serialized = JSON.parse(saved) as [string, Session<T>][];
          this.sessions = new Map(serialized);
        }
      } catch (error) {
        console.error('Failed to load persisted sessions:', error);
      }
    }
  }

  /**
   * Clear persisted sessions
   */
  clearPersistence(): void {
    if (this.persist && this.storageKey && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
    this.clearPersistence();
  }
}

/**
 * Create a new session manager instance
 */
export function createSessionManager<T extends Record<string, unknown> = Record<string, unknown>>(
  options?: SessionManagerOptions
): SessionManager<T> {
  return new SessionManager<T>(options);
}

/**
 * Default session manager instance
 */
export const sessionManager = createSessionManager();
