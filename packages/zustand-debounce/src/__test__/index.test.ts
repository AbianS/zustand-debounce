import { persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import { createDebouncedJSONStorage } from '../index';

const memory = () => {
  const data: Record<string, string> = {};
  return {
    data,
    getItem: jest.fn((key: string) => data[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      data[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete data[key];
    }),
  };
};

const v = (state: unknown) => ({ state, version: 0 });

describe('createDebouncedJSONStorage', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('debounces writes and keeps only the last value', () => {
    const api = memory();
    const storage = createDebouncedJSONStorage(api, { debounceTime: 1000 });

    storage.setItem('key', v(1));
    jest.advanceTimersByTime(500);
    storage.setItem('key', v(2));
    jest.advanceTimersByTime(999);
    expect(api.setItem).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(api.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(api.data.key)).toEqual(v(2));
  });

  test('debounces per key: one store never cancels another', () => {
    const api = memory();
    const storage = createDebouncedJSONStorage(api, { debounceTime: 100 });

    storage.setItem('a', v('A'));
    storage.setItem('b', v('B'));
    jest.advanceTimersByTime(100);

    expect(JSON.parse(api.data.a)).toEqual(v('A'));
    expect(JSON.parse(api.data.b)).toEqual(v('B'));
  });

  test('serializes only when actually writing (issue #12)', () => {
    const api = memory();
    const storage = createDebouncedJSONStorage(api, { debounceTime: 100 });
    const stringify = jest.spyOn(JSON, 'stringify');
    try {
      for (let i = 0; i < 50; i++) storage.setItem('key', v(i));
      expect(stringify).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(stringify).toHaveBeenCalledTimes(1);
    } finally {
      stringify.mockRestore();
    }
    expect(JSON.parse(api.data.key)).toEqual(v(49));
  });

  test('custom serialize/deserialize wrap the stored string (e.g. encryption)', async () => {
    const api = memory();
    const opts = {
      ttl: 60_000,
      serialize: (s: unknown) => `enc:${s}`,
      deserialize: (s: string) => s.slice(4),
    };
    await createDebouncedJSONStorage(api, opts).setItem('key', v(1));

    expect(api.data.key.startsWith('enc:{')).toBe(true);
    expect(await createDebouncedJSONStorage(api, opts).getItem('key')).toEqual(
      v(1),
    );
  });

  test('writes immediately with `immediately` or without debounce/throttle', () => {
    for (const options of [{ debounceTime: 1000, immediately: true }, {}]) {
      const api = memory();
      createDebouncedJSONStorage(api, options).setItem('key', v(1));
      expect(api.setItem).toHaveBeenCalledTimes(1);
    }
  });

  test('getItem returns the pending value before it is written', async () => {
    const api = memory();
    api.data.key = JSON.stringify(v('old'));
    const storage = createDebouncedJSONStorage(api, { debounceTime: 1000 });

    storage.setItem('key', v('new'));
    expect(await storage.getItem('key')).toEqual(v('new'));
  });

  test('removeItem cancels the pending write', () => {
    const api = memory();
    const storage = createDebouncedJSONStorage(api, { debounceTime: 1000 });

    storage.setItem('key', v(1));
    storage.removeItem('key');
    jest.advanceTimersByTime(1000);

    expect(api.setItem).not.toHaveBeenCalled();
    expect(api.removeItem).toHaveBeenCalledWith('key');
  });

  test('throttle delays writes but never drops the last value', () => {
    const api = memory();
    const storage = createDebouncedJSONStorage(api, { throttleTime: 1000 });

    storage.setItem('key', v(1));
    jest.advanceTimersByTime(0);
    expect(api.setItem).toHaveBeenCalledTimes(1);

    storage.setItem('key', v(2));
    storage.setItem('key', v(3));
    jest.advanceTimersByTime(999);
    expect(api.setItem).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1);
    expect(api.setItem).toHaveBeenCalledTimes(2);
    expect(JSON.parse(api.data.key)).toEqual(v(3));
  });

  test('flush writes everything pending and calls onFlush', async () => {
    const api = memory();
    const onFlush = jest.fn();
    const storage = createDebouncedJSONStorage(api, {
      debounceTime: 1000,
      onFlush,
    });

    storage.setItem('a', v(1));
    storage.setItem('b', v(2));
    await storage.flush();

    expect(api.setItem).toHaveBeenCalledTimes(2);
    expect(onFlush).toHaveBeenCalledWith('a', JSON.stringify(v(1)));
    jest.advanceTimersByTime(1000);
    expect(api.setItem).toHaveBeenCalledTimes(2);
  });

  test('flushes synchronously when the page is hidden', () => {
    const win = new EventTarget();
    const doc = Object.assign(new EventTarget(), { visibilityState: 'hidden' });
    Object.assign(globalThis, { window: win, document: doc });
    try {
      const api = memory();
      const storage = createDebouncedJSONStorage(api, { debounceTime: 1000 });

      storage.setItem('a', v(1));
      win.dispatchEvent(new Event('pagehide'));
      expect(api.setItem).toHaveBeenCalledTimes(1);

      storage.setItem('b', v(2));
      doc.dispatchEvent(new Event('visibilitychange'));
      expect(api.setItem).toHaveBeenCalledTimes(2);
    } finally {
      Reflect.deleteProperty(globalThis, 'window');
      Reflect.deleteProperty(globalThis, 'document');
    }
  });

  test('retries with backoff, then reports through onError', async () => {
    const error = new Error('quota');
    const api = memory();
    api.setItem.mockImplementation(() => {
      throw error;
    });
    const onRetry = jest.fn();
    const onError = jest.fn();
    const storage = createDebouncedJSONStorage(api, {
      maxRetries: 2,
      retryDelay: 100,
      backoffMultiplier: 2,
      onRetry,
      onError,
    });

    const done = storage.setItem('key', v(1));
    await jest.advanceTimersByTimeAsync(300);
    await done;

    expect(api.setItem).toHaveBeenCalledTimes(3);
    expect(onRetry.mock.calls.map((c) => [c[1], c[3]])).toEqual([
      [1, 100],
      [2, 200],
    ]);
    expect(onError).toHaveBeenCalledWith('key', error);
  });

  test('a failed debounced write does not cause an unhandled rejection', async () => {
    const api = memory();
    api.setItem.mockImplementation(() => Promise.reject(new Error('boom')));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const storage = createDebouncedJSONStorage(api, { debounceTime: 10 });

    storage.setItem('key', v(1));
    await jest.advanceTimersByTimeAsync(10);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('ttl: expired values are removed and read as null', async () => {
    const api = memory();
    const storage = createDebouncedJSONStorage(api, { ttl: 1000 });

    storage.setItem('key', v(1));
    expect(await storage.getItem('key')).toEqual(v(1));

    jest.advanceTimersByTime(1001);
    expect(await storage.getItem('key')).toBeNull();
    expect(api.data.key).toBeUndefined();
  });

  test('reads data written by v2 with a custom serializer (double-encoded)', async () => {
    const api = memory();
    api.data.key = JSON.stringify(JSON.stringify(v('legacy')));
    const storage = createDebouncedJSONStorage(api, {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    });

    expect(await storage.getItem('key')).toEqual(v('legacy'));
  });

  test('does not touch the storage adapter until it is used (SSR)', () => {
    expect(() =>
      createDebouncedJSONStorage('localStorage', { debounceTime: 100 }),
    ).not.toThrow();
  });

  test('maxWait forces a write while changes keep coming', () => {
    const api = memory();
    const storage = createDebouncedJSONStorage(api, {
      debounceTime: 300,
      maxWait: 1000,
    });

    // A change every 100ms never lets the 300ms debounce settle.
    for (let i = 1; i <= 25; i++) {
      storage.setItem('key', v(i));
      jest.advanceTimersByTime(100);
    }

    expect(api.setItem).toHaveBeenCalledTimes(2);
    expect(JSON.parse(api.data.key)).toEqual(v(20));
  });

  test('debounced writes wait for requestIdleCallback', () => {
    const idle: (() => void)[] = [];
    Object.assign(globalThis, {
      requestIdleCallback: (fn: () => void) => idle.push(fn),
    });
    try {
      const api = memory();
      const storage = createDebouncedJSONStorage(api, { debounceTime: 100 });

      storage.setItem('key', v(1));
      jest.advanceTimersByTime(100);
      expect(api.setItem).not.toHaveBeenCalled();

      storage.setItem('key', v(2));
      idle.shift()?.();
      expect(JSON.parse(api.data.key)).toEqual(v(2));
    } finally {
      Reflect.deleteProperty(globalThis, 'requestIdleCallback');
    }
  });

  test('works with zustand persist', async () => {
    const api = memory();
    const store = createStore<{ count: number }>()(
      persist(() => ({ count: 0 }), {
        name: 'counter',
        storage: createDebouncedJSONStorage(api, { debounceTime: 100 }),
      }),
    );
    await store.persist.rehydrate();

    for (let i = 1; i <= 10; i++) store.setState({ count: i });
    jest.advanceTimersByTime(100);

    expect(api.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(api.data.counter)).toEqual({
      state: { count: 10 },
      version: 0,
    });
  });
});
