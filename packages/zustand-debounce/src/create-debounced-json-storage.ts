import type {
  PersistStorage,
  StateStorage,
} from 'zustand/middleware';
import {
  type AdapterIdentifier,
  getStorageAdapter,
} from './core/adapters/get-storage-adapter';
import { PluginManager } from './core/plugin-manager';
import type { EnhancedJsonStorageOptions } from './types';

// Derived instead of importing StorageValue, which zustand < 4.3 does not export.
type Value = Parameters<PersistStorage<unknown>['setItem']>[1];

export type DebouncedJSONStorage = PersistStorage<unknown> & {
  /** Writes every pending value right now. Also runs automatically when the page is hidden. */
  flush: () => Promise<void>;
};

export function createDebouncedJSONStorage(
  storageApi: AdapterIdentifier,
  options: EnhancedJsonStorageOptions = {},
): DebouncedJSONStorage {
  const {
    debounceTime = 0,
    throttleTime = 0,
    maxWait = 0,
    immediately = false,
    maxRetries = 0,
    retryDelay = 0,
    backoffMultiplier = 1,
    ttl,
    plugins = [],
    replacer,
    reviver,
    serialize,
    deserialize,
    onWrite,
    onSave,
    onFlush,
    onRetry,
    onError,
  } = options;

  const pluginManager = new PluginManager();
  pluginManager.register(plugins);
  // Same layering as v2 so stored data stays compatible both ways:
  // JSON → ttl envelope → custom serialize → plugins.
  const custom = serialize && deserialize;

  // Resolved lazily so creating a store during SSR doesn't throw.
  let adapter: StateStorage | undefined;
  const api = () => (adapter ??= getStorageAdapter(storageApi));

  // Pending values are kept as objects: serialization only happens on the real write.
  const pending = new Map<string, Value>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const lastWrite = new Map<string, number>();
  const pendingSince = new Map<string, number>();

  const cancel = (name: string) => {
    clearTimeout(timers.get(name));
    timers.delete(name);
    pending.delete(name);
    pendingSince.delete(name);
  };

  // Idle Until Urgent: debounced writes wait for an idle moment (max 1s);
  // `flush()` / page hide stay synchronous.
  const whenIdle = (fn: () => void) =>
    typeof requestIdleCallback === 'function'
      ? requestIdleCallback(fn, { timeout: 1000 })
      : fn();

  // Calls the adapter synchronously (before the first await), so a flush on
  // `pagehide` reaches localStorage before the page goes away.
  const persist = async (name: string, value: Value) => {
    const json = JSON.stringify(value, replacer);
    let str =
      typeof ttl === 'number'
        ? JSON.stringify({ value: json, expiresAt: Date.now() + ttl })
        : json;
    if (custom) str = serialize(str);
    const raw = pluginManager.applyBeforeSetItem(str);
    lastWrite.set(name, Date.now());
    for (let attempt = 0; ; attempt++) {
      try {
        await api().setItem(name, raw);
        onSave?.(name, json);
        return json;
      } catch (error) {
        if (attempt >= maxRetries) throw error;
        const delay = retryDelay * backoffMultiplier ** attempt;
        onRetry?.(name, attempt + 1, error, delay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const write = (name: string, value: Value) =>
    persist(name, value).catch((error) => {
      if (onError) onError(name, error);
      else console.error(`[zustand-debounce] Failed to write "${name}":`, error);
      return undefined;
    });

  const writePending = (name: string) => {
    const value = pending.get(name);
    cancel(name);
    return value === undefined ? Promise.resolve(undefined) : write(name, value);
  };

  const storage: DebouncedJSONStorage = {
    getItem: async (name) => {
      if (pending.has(name)) return pending.get(name) ?? null;
      let str: unknown = pluginManager.applyAfterGetItem(
        await api().getItem(name),
      );
      if (custom && str) str = deserialize(str as string);
      if (!str) return null;
      if (typeof ttl === 'number') {
        try {
          const { value, expiresAt } = JSON.parse(str as string);
          if (Date.now() > expiresAt) {
            await api().removeItem(name);
            return null;
          }
          str = value;
        } catch {
          return null;
        }
      }
      return (
        typeof str === 'string' ? JSON.parse(str, reviver) : str
      ) as Value;
    },

    setItem: (name, value) => {
      if (onWrite) onWrite(name, JSON.stringify(value, replacer));
      if (immediately || (!debounceTime && !throttleTime)) {
        cancel(name);
        return write(name, value).then(() => {});
      }
      const now = Date.now();
      pending.set(name, value);
      if (!pendingSince.has(name)) pendingSince.set(name, now);
      clearTimeout(timers.get(name));
      let wait = Math.max(
        debounceTime,
        (lastWrite.get(name) ?? -Infinity) + throttleTime - now,
      );
      if (maxWait) {
        wait = Math.min(wait, (pendingSince.get(name) ?? now) + maxWait - now);
      }
      timers.set(
        name,
        setTimeout(() => whenIdle(() => void writePending(name)), wait),
      );
    },

    removeItem: (name) => {
      cancel(name);
      return api().removeItem(name);
    },

    flush: async () => {
      await Promise.all(
        [...pending.keys()].map(async (name) => {
          const str = await writePending(name);
          if (str !== undefined) onFlush?.(name, str);
        }),
      );
    },
  };

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const flushAll = () => void storage.flush();
    window.addEventListener('pagehide', flushAll);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushAll();
    });
  }

  return storage;
}
