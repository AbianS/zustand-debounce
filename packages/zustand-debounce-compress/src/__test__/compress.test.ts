import LZString from 'lz-string';
import { compress } from '../index';
import type { Plugin } from 'zustand-debounce';

describe('compress plugin', () => {
  describe('plugin creation', () => {
    it('should create plugin with default options', () => {
      const plugin = compress();

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('zustand-debounce-compress');
      expect(plugin.beforeSetItem).toBeDefined();
      expect(plugin.afterGetItem).toBeDefined();
    });

    it('should create plugin with custom algorithm', () => {
      const plugin = compress({ algorithm: 'base64' });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('zustand-debounce-compress');
    });
  });

  describe('lz-string algorithm', () => {
    let plugin: Plugin;

    beforeEach(() => {
      plugin = compress({ algorithm: 'lz-string' });
    });

    it('should compress data before setItem', () => {
      const originalValue = '{"user": "john", "count": 42}';
      const result = plugin.beforeSetItem!(originalValue);

      expect(result).not.toBe(originalValue);
      expect(result).toBeDefined();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should decompress data after getItem', () => {
      const originalValue = '{"user": "john", "count": 42}';
      const compressed = LZString.compress(originalValue)!;
      const result = plugin.afterGetItem!(compressed);

      expect(result).toBe(originalValue);
    });

    it('should handle round-trip correctly', () => {
      const originalValue = '{"todos": [{"id": 1, "text": "Buy milk"}]}';

      const compressed = plugin.beforeSetItem!(originalValue)!;
      const decompressed = plugin.afterGetItem!(compressed)!;

      expect(decompressed).toBe(originalValue);
    });

    it('should reduce data size for repetitive content', () => {
      const repetitiveData = JSON.stringify({
        items: Array(100).fill({ name: 'Item', value: 123 }),
      });

      const compressed = plugin.beforeSetItem!(repetitiveData)!;

      // Compressed should be significantly smaller
      expect(compressed.length).toBeLessThan(repetitiveData.length * 0.5);
    });
  });

  describe('base64 algorithm', () => {
    let plugin: Plugin;

    beforeEach(() => {
      plugin = compress({ algorithm: 'base64' });
    });

    it('should compress data before setItem', () => {
      const originalValue = '{"user": "jane", "score": 100}';
      const result = plugin.beforeSetItem!(originalValue);

      expect(result).not.toBe(originalValue);
      expect(result).toBeDefined();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should decompress data after getItem', () => {
      const originalValue = '{"user": "jane", "score": 100}';
      const compressed = LZString.compressToBase64(originalValue)!;
      const result = plugin.afterGetItem!(compressed);

      expect(result).toBe(originalValue);
    });

    it('should handle round-trip correctly', () => {
      const originalValue = '{"settings": {"theme": "dark", "language": "en"}}';

      const compressed = plugin.beforeSetItem!(originalValue)!;
      const decompressed = plugin.afterGetItem!(compressed)!;

      expect(decompressed).toBe(originalValue);
    });

    it('should produce URI-safe output', () => {
      const originalValue = '{"data": "test"}';
      const compressed = plugin.beforeSetItem!(originalValue)!;

      // Base64 output should only contain safe characters
      expect(compressed).toMatch(/^[A-Za-z0-9+/=]+$/);
    });
  });

  describe('null value handling', () => {
    it('should handle null input in afterGetItem', () => {
      const plugin = compress();
      const result = plugin.afterGetItem!(null);

      expect(result).toBeNull();
    });

    it('should not fail on null with base64', () => {
      const plugin = compress({ algorithm: 'base64' });
      const result = plugin.afterGetItem!(null);

      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle compression errors gracefully', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const plugin = compress();

      // Mock LZString.compress to throw error
      const originalCompress = LZString.compress;
      LZString.compress = jest.fn().mockImplementation(() => {
        throw new Error('Compression failed');
      });

      const originalValue = 'test data';
      const result = plugin.beforeSetItem!(originalValue);

      // Should return original value on error
      expect(result).toBe(originalValue);
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore
      LZString.compress = originalCompress;
      consoleErrorSpy.mockRestore();
    });

    it('should handle decompression errors gracefully', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const plugin = compress();

      // Mock LZString.decompress to throw error
      const originalDecompress = LZString.decompress;
      LZString.decompress = jest.fn().mockImplementation(() => {
        throw new Error('Decompression failed');
      });

      const result = plugin.afterGetItem!('corrupted-data');

      // Should return null on error
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore
      LZString.decompress = originalDecompress;
      consoleErrorSpy.mockRestore();
    });

    it('should handle decompression returning null', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const plugin = compress();

      // Mock LZString.decompress to return null
      const originalDecompress = LZString.decompress;
      LZString.decompress = jest.fn().mockReturnValue(null);

      const result = plugin.afterGetItem!('invalid-data');

      // Should return null when decompression returns null
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore
      LZString.decompress = originalDecompress;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('real-world scenarios', () => {
    it('should handle large JSON objects', () => {
      const plugin = compress();

      const largeObject = {
        users: Array(1000).fill(null).map((_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          settings: {
            theme: 'dark',
            language: 'en',
            notifications: true,
          },
        })),
      };

      const originalValue = JSON.stringify(largeObject);
      const compressed = plugin.beforeSetItem!(originalValue)!;
      const decompressed = plugin.afterGetItem!(compressed)!;

      expect(decompressed).toBe(originalValue);
      expect(compressed.length).toBeLessThan(originalValue.length);
    });

    it('should handle special characters', () => {
      const plugin = compress();

      const specialChars = '{"text": "Hello 世界! 🌍 Special: @#$%^&*()"}';
      const compressed = plugin.beforeSetItem!(specialChars)!;
      const decompressed = plugin.afterGetItem!(compressed)!;

      expect(decompressed).toBe(specialChars);
    });

    it('should handle empty strings', () => {
      const plugin = compress();

      const compressed = plugin.beforeSetItem!('')!;
      const decompressed = plugin.afterGetItem!(compressed)!;

      expect(decompressed).toBe('');
    });

    it('should verify actual size reduction', () => {
      const plugin = compress();

      // Create realistic Zustand state
      const state = JSON.stringify({
        todos: Array(50).fill(null).map((_, i) => ({
          id: i,
          text: `Todo item ${i}`,
          completed: i % 2 === 0,
          createdAt: new Date().toISOString(),
        })),
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true,
          },
        },
      });

      const compressed = plugin.beforeSetItem!(state)!;

      const originalSize = new Blob([state]).size;
      const compressedSize = new Blob([compressed]).size;
      const reduction = ((originalSize - compressedSize) / originalSize) * 100;

      // Should have at least 30% reduction for this type of data
      expect(reduction).toBeGreaterThan(30);
      
      console.log(`Compression stats:
        Original: ${originalSize} bytes
        Compressed: ${compressedSize} bytes
        Reduction: ${reduction.toFixed(2)}%`);
    });
  });
});
