import { PluginManager } from '../core/plugin-manager';
import type { Plugin } from '../types';

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  describe('register', () => {
    it('should register plugins correctly', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
      };

      pluginManager.register([plugin]);

      expect(pluginManager.getPlugins()).toHaveLength(1);
      expect(pluginManager.getPlugins()[0]).toBe(plugin);
    });

    it('should throw error if plugin has no name', () => {
      const invalidPlugin = {} as Plugin;

      expect(() => {
        pluginManager.register([invalidPlugin]);
      }).toThrow('Plugin must have a valid name property');
    });

    it('should register multiple plugins', () => {
      const plugins: Plugin[] = [
        { name: 'plugin-1' },
        { name: 'plugin-2' },
        { name: 'plugin-3' },
      ];

      pluginManager.register(plugins);

      expect(pluginManager.getPlugins()).toHaveLength(3);
    });

    it('should append to existing plugins', () => {
      pluginManager.register([{ name: 'plugin-1' }]);
      pluginManager.register([{ name: 'plugin-2' }]);

      expect(pluginManager.getPlugins()).toHaveLength(2);
    });
  });

  describe('applyBeforeSetItem', () => {
    it('should execute plugins in order', () => {
      const order: string[] = [];

      const plugin1: Plugin = {
        name: 'plugin-1',
        beforeSetItem: (value) => {
          order.push('plugin-1');
          return `[plugin-1]${value}`;
        },
      };

      const plugin2: Plugin = {
        name: 'plugin-2',
        beforeSetItem: (value) => {
          order.push('plugin-2');
          return `[plugin-2]${value}`;
        },
      };

      pluginManager.register([plugin1, plugin2]);

      const result = pluginManager.applyBeforeSetItem('value');

      expect(order).toEqual(['plugin-1', 'plugin-2']);
      expect(result).toBe('[plugin-2][plugin-1]value');
    });

    it('should pass transformed value to next plugin', () => {
      const plugin1: Plugin = {
        name: 'plugin-1',
        beforeSetItem: (value) => value.toUpperCase(),
      };

      const plugin2: Plugin = {
        name: 'plugin-2',
        beforeSetItem: (value) => `wrapped(${value})`,
      };

      pluginManager.register([plugin1, plugin2]);

      const result = pluginManager.applyBeforeSetItem('test');

      expect(result).toBe('wrapped(TEST)');
    });

    it('should skip transformation if plugin returns undefined', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        beforeSetItem: () => undefined,
      };

      pluginManager.register([plugin]);

      const result = pluginManager.applyBeforeSetItem('original');

      expect(result).toBe('original');
    });

    it('should handle plugins without beforeSetItem hook', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        // No beforeSetItem hook
      };

      pluginManager.register([plugin]);

      const result = pluginManager.applyBeforeSetItem('value');

      expect(result).toBe('value');
    });

    it('should handle errors gracefully and continue', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const plugin1: Plugin = {
        name: 'plugin-1',
        beforeSetItem: () => {
          throw new Error('Plugin 1 failed');
        },
      };

      const plugin2: Plugin = {
        name: 'plugin-2',
        beforeSetItem: (value) => `${value}-processed`,
      };

      pluginManager.register([plugin1, plugin2]);

      const result = pluginManager.applyBeforeSetItem('value');

      expect(result).toBe('value-processed');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('applyAfterGetItem', () => {
    it('should execute plugins in order', () => {
      const order: string[] = [];

      const plugin1: Plugin = {
        name: 'plugin-1',
        afterGetItem: (value) => {
          order.push('plugin-1');
          return value ? `[plugin-1]${value}` : null;
        },
      };

      const plugin2: Plugin = {
        name: 'plugin-2',
        afterGetItem: (value) => {
          order.push('plugin-2');
          return value ? `[plugin-2]${value}` : null;
        },
      };

      pluginManager.register([plugin1, plugin2]);

      const result = pluginManager.applyAfterGetItem('value');

      expect(order).toEqual(['plugin-1', 'plugin-2']);
      expect(result).toBe('[plugin-2][plugin-1]value');
    });

    it('should handle null values gracefully', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        afterGetItem: (value) => {
          return value ? value.toUpperCase() : null;
        },
      };

      pluginManager.register([plugin]);

      const result = pluginManager.applyAfterGetItem(null);

      expect(result).toBeNull();
    });

    it('should return null if plugin returns null', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        afterGetItem: () => null,
      };

      pluginManager.register([plugin]);

      const result = pluginManager.applyAfterGetItem('value');

      expect(result).toBeNull();
    });

    it('should skip transformation if plugin returns undefined', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        afterGetItem: () => undefined,
      };

      pluginManager.register([plugin]);

      const result = pluginManager.applyAfterGetItem('original');

      expect(result).toBe('original');
    });

    it('should handle plugins without afterGetItem hook', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        // No afterGetItem hook
      };

      pluginManager.register([plugin]);

      const result = pluginManager.applyAfterGetItem('value');

      expect(result).toBe('value');
    });

    it('should return null on error', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const plugin: Plugin = {
        name: 'test-plugin',
        afterGetItem: () => {
          throw new Error('Plugin failed');
        },
      };

      pluginManager.register([plugin]);

      const result = pluginManager.applyAfterGetItem('value');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getPlugins', () => {
    it('should return copy of plugins array', () => {
      const plugin: Plugin = { name: 'test-plugin' };
      pluginManager.register([plugin]);

      const plugins1 = pluginManager.getPlugins();
      const plugins2 = pluginManager.getPlugins();

      expect(plugins1).not.toBe(plugins2);
      expect(plugins1).toEqual(plugins2);
    });
  });

  describe('multiple plugins composition', () => {
    it('should compose multiple transformations correctly', () => {
      const upperPlugin: Plugin = {
        name: 'upper',
        beforeSetItem: (value) => value.toUpperCase(),
        afterGetItem: (value) => (value ? value.toLowerCase() : null),
      };

      const wrapPlugin: Plugin = {
        name: 'wrap',
        beforeSetItem: (value) => `[${value}]`,
        afterGetItem: (value) =>
          value ? value.slice(1, -1) : null,
      };

      pluginManager.register([upperPlugin, wrapPlugin]);

      // Test write transformation
      const writeResult = pluginManager.applyBeforeSetItem('hello');
      expect(writeResult).toBe('[HELLO]');

      // Test read transformation
      const readResult = pluginManager.applyAfterGetItem('[HELLO]');
      expect(readResult).toBe('hello');
    });
  });
});
