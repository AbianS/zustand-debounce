import { BaseStorage } from '../core/base-storage';
import { PluginManager } from '../core/plugin-manager';
import type { IStorage, Plugin } from '../types';

describe('BaseStorage with Plugins', () => {
  let mockStorage: IStorage;

  beforeEach(() => {
    // Create a mock storage implementation
    mockStorage = {
      getItem: jest.fn().mockResolvedValue('raw-value'),
      setItem: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
    };
  });

  describe('without plugins', () => {
    it('should work as before (backward compatible)', async () => {
      const storage = new BaseStorage(mockStorage);

      await storage.setItem('key', 'value');
      expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');

      const result = await storage.getItem('key');
      expect(result).toBe('raw-value');
    });
  });

  describe('with plugins', () => {
    it('should transform value on setItem', async () => {
      const plugin: Plugin = {
        name: 'uppercase-plugin',
        beforeSetItem: (value) => value.toUpperCase(),
      };

      const pluginManager = new PluginManager();
      pluginManager.register([plugin]);

      const storage = new BaseStorage(mockStorage, pluginManager);

      await storage.setItem('key', 'value');

      expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'VALUE');
    });

    it('should transform value on getItem', async () => {
      const plugin: Plugin = {
        name: 'lowercase-plugin',
        afterGetItem: (value) => (value ? value.toLowerCase() : null),
      };

      const pluginManager = new PluginManager();
      pluginManager.register([plugin]);

      const storage = new BaseStorage(mockStorage, pluginManager);

      const result = await storage.getItem('key');

      expect(result).toBe('raw-value'.toLowerCase());
    });

    it('should handle null values from storage', async () => {
      mockStorage.getItem = jest.fn().mockResolvedValue(null);

      const plugin: Plugin = {
        name: 'test-plugin',
        afterGetItem: (value) => {
          return value ? value.toUpperCase() : null;
        },
      };

      const pluginManager = new PluginManager();
      pluginManager.register([plugin]);

      const storage = new BaseStorage(mockStorage, pluginManager);

      const result = await storage.getItem('key');

      expect(result).toBeNull();
    });

    it('should apply multiple plugins in correct order', async () => {
      const plugin1: Plugin = {
        name: 'plugin-1',
        beforeSetItem: (value) => `[P1:${value}]`,
        afterGetItem: (value) => (value ? value.replace('[P1:', '').replace(']', '') : null),
      };

      const plugin2: Plugin = {
        name: 'plugin-2',
        beforeSetItem: (value) => `[P2:${value}]`,
        afterGetItem: (value) => (value ? value.replace('[P2:', '').replace(']', '') : null),
      };

      const pluginManager = new PluginManager();
      pluginManager.register([plugin1, plugin2]);

      const storage = new BaseStorage(mockStorage, pluginManager);

      // Test setItem
      await storage.setItem('key', 'value');
      expect(mockStorage.setItem).toHaveBeenCalledWith('key', '[P2:[P1:value]]');

      // Test getItem
      mockStorage.getItem = jest.fn().mockResolvedValue('[P2:[P1:value]]');
      const result = await storage.getItem('key');
      expect(result).toBe('value');
    });

    it('should not affect removeItem', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        beforeSetItem: (value) => value.toUpperCase(),
        afterGetItem: (value) => (value ? value.toLowerCase() : null),
      };

      const pluginManager = new PluginManager();
      pluginManager.register([plugin]);

      const storage = new BaseStorage(mockStorage, pluginManager);

      await storage.removeItem('key');

      expect(mockStorage.removeItem).toHaveBeenCalledWith('key');
    });
  });

  describe('full pipeline integration', () => {
    it('should handle write and read cycle correctly', async () => {
      const storedData: Record<string, string> = {};

      // Mock storage that actually stores data
      const mockStore: IStorage = {
        getItem: jest.fn().mockImplementation(async (key: string) => {
          return storedData[key] || null;
        }),
        setItem: jest.fn().mockImplementation(async (key: string, value: string) => {
          storedData[key] = value;
        }),
        removeItem: jest.fn().mockImplementation(async (key: string) => {
          delete storedData[key];
        }),
      };

      // Plugin that reverses strings (for testing purposes)
      const reversePlugin: Plugin = {
        name: 'reverse-plugin',
        beforeSetItem: (value) => value.split('').reverse().join(''),
        afterGetItem: (value) => (value ? value.split('').reverse().join('') : null),
      };

      const pluginManager = new PluginManager();
      pluginManager.register([reversePlugin]);

      const storage = new BaseStorage(mockStore, pluginManager);

      // Write data
      await storage.setItem('test-key', 'hello world');

      // Verify data is stored transformed
      expect(storedData['test-key']).toBe('dlrow olleh');

      // Read data back
      const result = await storage.getItem('test-key');

      // Should get original value back
      expect(result).toBe('hello world');
    });

    it('should handle compression-like plugin', async () => {
      const storedData: Record<string, string> = {};

      const mockStore: IStorage = {
        getItem: jest.fn().mockImplementation(async (key: string) => {
          return storedData[key] || null;
        }),
        setItem: jest.fn().mockImplementation(async (key: string, value: string) => {
          storedData[key] = value;
        }),
        removeItem: jest.fn(),
      };

      // Mock compression plugin
      const mockCompressPlugin: Plugin = {
        name: 'mock-compress',
        beforeSetItem: (value) => {
          // Simulate compression (just base64 for test)
          return Buffer.from(value).toString('base64');
        },
        afterGetItem: (value) => {
          if (!value) return null;
          // Simulate decompression
          return Buffer.from(value, 'base64').toString('utf-8');
        },
      };

      const pluginManager = new PluginManager();
      pluginManager.register([mockCompressPlugin]);

      const storage = new BaseStorage(mockStore, pluginManager);

      const originalValue = '{"user": "john", "count": 42}';

      // Write
      await storage.setItem('data', originalValue);

      // Verify stored data is compressed
      expect(storedData['data']).not.toBe(originalValue);
      expect(storedData['data']).toBe(Buffer.from(originalValue).toString('base64'));

      // Read
      const result = await storage.getItem('data');

      // Should get original value back
      expect(result).toBe(originalValue);
    });
  });
});
