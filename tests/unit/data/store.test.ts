/**
 * Tests for data/store module
 * 100% coverage target
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Store, createStore } from '@oxog/kit/data';

interface TestState {
  count: number;
  name: string;
  active: boolean;
}

describe('Store', () => {
  let store: Store<TestState>;

  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    store = new Store<TestState>({
      initial: { count: 0, name: 'test', active: false }
    });
  });

  afterEach(() => {
    store.clearPersistence?.();
  });

  describe('get', () => {
    it('should return current state', () => {
      const state = store.get();
      expect(state).toEqual({ count: 0, name: 'test', active: false });
    });

    it('should return copy of state (not reference)', () => {
      const state1 = store.get();
      const state2 = store.get();
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2);
    });

    it('should get specific property with getKey', () => {
      expect(store.getKey('count')).toBe(0);
      expect(store.getKey('name')).toBe('test');
      expect(store.getKey('active')).toBe(false);
    });
  });

  describe('set', () => {
    it('should merge partial state', () => {
      store.set({ count: 5 });
      expect(store.get()).toEqual({ count: 5, name: 'test', active: false });
    });

    it('should update multiple properties', () => {
      store.set({ count: 10, active: true });
      expect(store.get()).toEqual({ count: 10, name: 'test', active: true });
    });

    it('should notify listeners on set', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.set({ count: 5 });

      expect(listener).toHaveBeenCalledTimes(2); // Initial + update
      expect(listener).toHaveBeenLastCalledWith({ count: 5, name: 'test', active: false });
    });
  });

  describe('update', () => {
    it('should update state using function', () => {
      store.update((state) => ({ count: state.count + 1 }));
      expect(store.get().count).toBe(1);

      store.update((state) => ({ count: state.count + 10 }));
      expect(store.get().count).toBe(11);
    });

    it('should notify listeners on update', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.update((state) => ({ count: state.count + 1 }));

      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe('reset', () => {
    it('should reset state to provided value', () => {
      store.set({ count: 5, name: 'modified', active: true });

      store.reset({ count: 0, name: 'test', active: false });

      expect(store.get()).toEqual({ count: 0, name: 'test', active: false });
    });

    it('should notify listeners on reset', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.reset({ count: 100, name: 'reset', active: true });

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenLastCalledWith({ count: 100, name: 'reset', active: true });
    });
  });

  describe('subscribe', () => {
    it('should add listener and call immediately with current state', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ count: 0, name: 'test', active: false });

      unsubscribe();
    });

    it('should call listener on state change', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.set({ count: 5 });

      expect(listener).toHaveBeenCalledTimes(2); // Initial + set
    });

    it('should unsubscribe listener', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      unsubscribe();

      store.set({ count: 5 });

      expect(listener).toHaveBeenCalledTimes(1); // Only initial call
    });

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      store.subscribe(listener1);
      store.subscribe(listener2);

      store.set({ count: 5 });

      expect(listener1).toHaveBeenCalledTimes(2);
      expect(listener2).toHaveBeenCalledTimes(2);
    });

    it('should handle errors in listeners gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalListener = vi.fn();

      store.subscribe(errorListener);
      store.subscribe(normalListener);

      // Should not throw despite error in listener
      expect(() => store.set({ count: 5 })).not.toThrow();

      expect(normalListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('watch', () => {
    it('should watch specific property', () => {
      const listener = vi.fn();

      store.watch('count', listener);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(0);
    });

    it('should call listener only when watched property changes', () => {
      const countListener = vi.fn();
      const nameListener = vi.fn();

      store.watch('count', countListener);
      store.watch('name', nameListener);

      store.set({ count: 1 });
      expect(countListener).toHaveBeenCalledTimes(2);
      expect(nameListener).toHaveBeenCalledTimes(1); // Only initial

      store.set({ name: 'modified' });
      expect(countListener).toHaveBeenCalledTimes(2); // No new call
      expect(nameListener).toHaveBeenCalledTimes(2);
    });

    it('should unsubscribe from watch', () => {
      const listener = vi.fn();
      const unsubscribe = store.watch('count', listener);

      unsubscribe();

      store.set({ count: 5 });

      expect(listener).toHaveBeenCalledTimes(1); // Only initial
    });

    it('should not call listener when value does not change', () => {
      const listener = vi.fn();

      store.watch('count', listener);

      store.set({ count: 0 }); // Same value
      store.set({ name: 'modified' }); // Different property

      expect(listener).toHaveBeenCalledTimes(1); // Only initial
    });
  });

  describe('batch', () => {
    it('should batch multiple updates', () => {
      const listener = vi.fn();

      store.subscribe(listener);

      store.batch(() => {
        store.set({ count: 1 });
        store.set({ count: 2 });
        store.set({ count: 3 });
      });

      expect(listener).toHaveBeenCalledTimes(2); // Initial + batch completion
      expect(store.get().count).toBe(3);
    });

    it('should only notify once on batch', () => {
      const listener = vi.fn();

      store.subscribe(listener);

      store.batch(() => {
        store.set({ count: 1 });
        store.set({ name: 'updated' });
        store.set({ active: true });
      });

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenLastCalledWith({
        count: 1,
        name: 'updated',
        active: true
      });
    });
  });

  describe('persistence', () => {
    beforeEach(() => {
      if (typeof localStorage === 'undefined') {
        // Skip tests in non-browser environment
        return;
      }
    });

    it('should persist state to localStorage', () => {
      if (typeof localStorage === 'undefined') return;

      const persistedStore = new Store<TestState>({
        initial: { count: 0, name: 'test', active: false },
        persist: true,
        storageKey: 'test-store'
      });

      persistedStore.set({ count: 5 });

      const saved = localStorage.getItem('test-store');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual({ count: 5, name: 'test', active: false });

      persistedStore.clearPersistence();
    });

    it('should load state from localStorage', () => {
      if (typeof localStorage === 'undefined') return;

      // Set up initial state in localStorage
      localStorage.setItem('test-store', JSON.stringify({
        count: 42,
        name: 'loaded',
        active: true
      }));

      const persistedStore = new Store<TestState>({
        initial: { count: 0, name: 'test', active: false },
        persist: true,
        storageKey: 'test-store'
      });

      expect(persistedStore.get()).toEqual({
        count: 42,
        name: 'loaded',
        active: true
      });

      persistedStore.clearPersistence();
    });

    it('should clear persistence', () => {
      if (typeof localStorage === 'undefined') return;

      const persistedStore = new Store<TestState>({
        initial: { count: 0, name: 'test', active: false },
        persist: true,
        storageKey: 'test-store'
      });

      persistedStore.set({ count: 5 });
      expect(localStorage.getItem('test-store')).toBeDefined();

      persistedStore.clearPersistence();
      expect(localStorage.getItem('test-store')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      if (typeof localStorage === 'undefined') return;

      const originalGetItem = localStorage.getItem;
      const originalSetItem = localStorage.setItem;

      // Mock localStorage to throw errors
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const errorStore = new Store<TestState>({
        initial: { count: 0, name: 'test', active: false },
        persist: true,
        storageKey: 'test-store'
      });

      // Should not throw despite localStorage errors
      expect(() => errorStore.set({ count: 5 })).not.toThrow();
      expect(errorStore.get().count).toBe(5);

      // Restore
      localStorage.getItem = originalGetItem;
      localStorage.setItem = originalSetItem;
    });
  });

  describe('listenerCount', () => {
    it('should return number of subscribers', () => {
      expect(store.listenerCount).toBe(0);

      const unsub1 = store.subscribe(vi.fn());
      expect(store.listenerCount).toBe(1);

      const unsub2 = store.subscribe(vi.fn());
      expect(store.listenerCount).toBe(2);

      unsub1();
      expect(store.listenerCount).toBe(1);

      unsub2();
      expect(store.listenerCount).toBe(0);
    });
  });

  describe('createStore factory', () => {
    it('should create store instance', () => {
      const newStore = createStore<TestState>({
        initial: { count: 42, name: 'factory', active: true }
      });

      expect(newStore).toBeInstanceOf(Store);
      expect(newStore.get()).toEqual({
        count: 42,
        name: 'factory',
        active: true
      });
    });

    it('should create store without initial state', () => {
      const emptyStore = createStore();
      expect(emptyStore.get()).toEqual({});
    });
  });

  describe('complex scenarios', () => {
    it('should handle rapid state changes', () => {
      const listener = vi.fn();

      store.subscribe(listener);

      for (let i = 0; i < 100; i++) {
        store.set({ count: i });
      }

      expect(listener).toHaveBeenCalledTimes(101); // Initial + 100 updates
      expect(store.get().count).toBe(99);
    });

    it('should handle unsubscribe during notification', () => {
      let unsubscribe1: (() => void) | undefined;
      let unsubscribe2: (() => void) | undefined;

      unsubscribe1 = store.subscribe(() => {
        unsubscribe1?.();
      });

      unsubscribe2 = store.subscribe(() => {
        // Do nothing
      });

      // Should not throw
      expect(() => store.set({ count: 5 })).not.toThrow();

      unsubscribe2?.();
    });

    it('should handle nested batch calls', () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.batch(() => {
        store.set({ count: 1 });
        store.batch(() => {
          store.set({ count: 2 });
        });
        store.set({ count: 3 });
      });

      // Each batch triggers its own notification
      expect(listener).toHaveBeenCalledTimes(3);
    });
  });
});
