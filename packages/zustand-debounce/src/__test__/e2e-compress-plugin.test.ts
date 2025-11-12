import { createDebouncedJSONStorage } from '../create-debounced-json-storage';
import type { Plugin } from '../types';

function createMockCompressPlugin(): Plugin {
  return {
    name: 'mock-compress',
    beforeSetItem: (value: string) => {
      const reversed = value.split('').reverse().join('');
      return Buffer.from(reversed).toString('base64');
    },
    afterGetItem: (value: string | null) => {
      if (!value) return null;
      try {
        const decoded = Buffer.from(value, 'base64').toString('utf-8');
        return decoded.split('').reverse().join('');
      } catch {
        return null;
      }
    },
  };
}

describe('E2E: Compress Plugin Integration', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
  });

  describe('basic integration', () => {
    it('should create storage with compress plugin', () => {
      const mockStorage = {
        getItem: async (key: string) => storage[key] || null,
        setItem: async (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: async (key: string) => {
          delete storage[key];
        },
      };

      const debouncedStorage = createDebouncedJSONStorage(mockStorage, {
        plugins: [createMockCompressPlugin()],
      });

      expect(debouncedStorage).toBeDefined();
      expect(debouncedStorage.getItem).toBeDefined();
      expect(debouncedStorage.setItem).toBeDefined();
    });

    it('should compress and store data', async () => {
      const mockStorage = {
        getItem: async (key: string) => storage[key] || null,
        setItem: async (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: async (key: string) => {
          delete storage[key];
        },
      };

      const debouncedStorage = createDebouncedJSONStorage(mockStorage, {
        immediately: true, // No debounce for testing
        plugins: [createMockCompressPlugin()],
      });

      const testData = { state: { count: 42, name: 'test' }, version: 0 };
      await debouncedStorage.setItem('test-key', testData);

      // Data in storage should be compressed (transformed)
      expect(storage['test-key']).toBeDefined();
      expect(storage['test-key']).not.toContain('"count"');
    });

    it('should decompress data when reading', async () => {
      const mockStorage = {
        getItem: async (key: string) => storage[key] || null,
        setItem: async (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: async (key: string) => {
          delete storage[key];
        },
      };

      const debouncedStorage = createDebouncedJSONStorage(mockStorage, {
        immediately: true,
        plugins: [createMockCompressPlugin()],
      });

      const testData = { state: { user: 'john', score: 100 }, version: 0 };

      // Write data
      await debouncedStorage.setItem('test-key', testData);

      // Read data back
      const result = await debouncedStorage.getItem('test-key');

      // Should get original data back
      expect(result).toEqual(testData);
    });
  });

  describe('with debouncing', () => {
    it('should work with debounceTime', async () => {
      jest.useFakeTimers();

      const mockStorage = {
        getItem: async (key: string) => storage[key] || null,
        setItem: async (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: async (key: string) => {
          delete storage[key];
        },
      };

      const debouncedStorage = createDebouncedJSONStorage(mockStorage, {
        debounceTime: 1000,
        plugins: [createMockCompressPlugin()],
      });

      const testData = { state: { value: 'debounced' }, version: 0 };

      // Write data (will be debounced)
      debouncedStorage.setItem('test-key', testData);

      // Data not yet in storage
      expect(storage['test-key']).toBeUndefined();

      // Advance timers
      jest.advanceTimersByTime(1000);

      // Wait for async operations
      await Promise.resolve();

      // Data should now be in storage (compressed)
      expect(storage['test-key']).toBeDefined();

      jest.useRealTimers();
    });
  });

  describe('with TTL', () => {
    it('should work with TTL decorator', async () => {
      const mockStorage = {
        getItem: async (key: string) => storage[key] || null,
        setItem: async (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: async (key: string) => {
          delete storage[key];
        },
      };

      const debouncedStorage = createDebouncedJSONStorage(mockStorage, {
        immediately: true,
        ttl: 60000, // 1 minute
        plugins: [createMockCompressPlugin()],
      });

      const testData = { state: { value: 'with-ttl' }, version: 0 };

      await debouncedStorage.setItem('test-key', testData);

      // Should be able to read immediately
      const result = await debouncedStorage.getItem('test-key');
      expect(result).toEqual(testData);
    });
  });

  describe('multiple plugins composition', () => {
    it('should work with multiple plugins', async () => {
      const mockStorage = {
        getItem: async (key: string) => storage[key] || null,
        setItem: async (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: async (key: string) => {
          delete storage[key];
        },
      };

      // Create two mock plugins
      const plugin1: Plugin = {
        name: 'plugin-1',
        beforeSetItem: (value) => `[P1]${value}`,
        afterGetItem: (value) => (value ? value.replace('[P1]', '') : null),
      };

      const plugin2: Plugin = {
        name: 'plugin-2',
        beforeSetItem: (value) => `[P2]${value}`,
        afterGetItem: (value) => (value ? value.replace('[P2]', '') : null),
      };

      const debouncedStorage = createDebouncedJSONStorage(mockStorage, {
        immediately: true,
        plugins: [plugin1, plugin2],
      });

      const testData = { state: { value: 'multi-plugin' }, version: 0 };

      await debouncedStorage.setItem('test-key', testData);
      const result = await debouncedStorage.getItem('test-key');

      expect(result).toEqual(testData);
    });
  });

  describe('error scenarios', () => {
    it('should handle plugin errors gracefully', async () => {
      const mockStorage = {
        getItem: async (key: string) => storage[key] || null,
        setItem: async (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: async (key: string) => {
          delete storage[key];
        },
      };

      const faultyPlugin: Plugin = {
        name: 'faulty-plugin',
        beforeSetItem: () => {
          throw new Error('Plugin error');
        },
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const debouncedStorage = createDebouncedJSONStorage(mockStorage, {
        immediately: true,
        plugins: [faultyPlugin],
      });

      const testData = { state: { value: 'test' }, version: 0 };

      // Should not throw
      await expect(
        debouncedStorage.setItem('test-key', testData),
      ).resolves.not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should handle null from storage', async () => {
      const mockStorage = {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
      };

      const debouncedStorage = createDebouncedJSONStorage(mockStorage, {
        plugins: [createMockCompressPlugin()],
      });

      const result = await debouncedStorage.getItem('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('Zustand persist compatibility', () => {
    it('should be compatible with Zustand persist middleware', async () => {
      const mockStorage = {
        getItem: async (key: string) => storage[key] || null,
        setItem: async (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: async (key: string) => {
          delete storage[key];
        },
      };

      // Create storage as Zustand would use it
      const debouncedStorage = createDebouncedJSONStorage(mockStorage, {
        immediately: true,
        plugins: [createMockCompressPlugin()],
      });

      // Simulate Zustand persist behavior
      const stateData = {
        state: {
          count: 0,
          todos: [],
          user: { name: 'John' },
        },
        version: 0,
      };

      // Zustand calls setItem with state object
      await debouncedStorage.setItem('my-store', stateData);

      // Zustand calls getItem to hydrate
      const hydrated = await debouncedStorage.getItem('my-store');

      // Should get exact state back
      expect(hydrated).toEqual(stateData);
    });
  });
});
