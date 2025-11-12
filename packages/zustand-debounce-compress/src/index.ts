import LZString from 'lz-string';
import type { Plugin } from 'zustand-debounce';

/**
 * Compression algorithms supported by the plugin.
 *
 * - 'lz-string': Standard LZ-based compression, best balance of speed and compression ratio
 * - 'base64': LZ compression with base64 encoding, URI-safe and slightly larger output
 */
export type CompressionAlgorithm = 'lz-string' | 'base64';

/**
 * Configuration options for the compression plugin.
 */
export interface CompressOptions {
  /**
   * The compression algorithm to use.
   *
   * @default 'lz-string'
   *
   * - 'lz-string': Best for most use cases, good compression ratio and speed
   * - 'base64': Useful when you need URI-safe strings or compatibility with certain systems
   */
  algorithm?: CompressionAlgorithm;
}

/**
 * Creates a compression plugin for zustand-debounce.
 *
 * This plugin automatically compresses data before writing to storage and decompresses
 * it when reading. This can significantly reduce storage size for large state objects,
 * especially those with repetitive or structured data.
 *
 * **Benefits:**
 * - Reduces storage footprint (typically 50-80% reduction)
 * - Helps avoid localStorage quota limits
 * - Particularly effective for JSON data with repeated keys
 *
 * **Trade-offs:**
 * - Adds small CPU overhead for compression/decompression
 * - Not recommended for already compressed data (images, video, etc.)
 *
 * @param options - Configuration options for compression
 * @returns A plugin instance compatible with zustand-debounce
 *
 * @example
 * ```ts
 * import { createDebouncedJSONStorage } from 'zustand-debounce';
 * import { compress } from 'zustand-debounce-compress';
 *
 * const storage = createDebouncedJSONStorage('localStorage', {
 *   debounceTime: 1000,
 *   plugins: [
 *     compress({ algorithm: 'lz-string' })
 *   ]
 * });
 *
 * // Now all data is automatically compressed before saving
 * // and decompressed when reading
 * ```
 *
 * @example
 * ```ts
 * // Using base64 algorithm for URI-safe compression
 * const storage = createDebouncedJSONStorage('localStorage', {
 *   plugins: [
 *     compress({ algorithm: 'base64' })
 *   ]
 * });
 * ```
 */
export function compress(options: CompressOptions = {}): Plugin {
  const { algorithm = 'lz-string' } = options;

  return {
    name: 'zustand-debounce-compress',

    beforeSetItem: (value: string): string => {
      try {
        // Choose compression method based on algorithm
        const compressed =
          algorithm === 'base64'
            ? LZString.compressToBase64(value)
            : LZString.compress(value);

        // Return compressed value or original if compression failed
        return compressed || value;
      } catch (error) {
        // If compression fails, log error and return original value
        // This ensures the storage operation doesn't fail completely
        console.error(
          '[zustand-debounce-compress] Compression failed, storing uncompressed:',
          error,
        );
        return value;
      }
    },

    afterGetItem: (value: string | null): string | null => {
      // If no value in storage, return null as-is
      if (value === null) {
        return null;
      }

      try {
        // Choose decompression method based on algorithm
        const decompressed =
          algorithm === 'base64'
            ? LZString.decompressFromBase64(value)
            : LZString.decompress(value);

        // If decompression returns null or undefined, it failed
        if (decompressed === null || decompressed === undefined) {
          console.error(
            '[zustand-debounce-compress] Decompression returned null/undefined, data may be corrupted',
          );
          return null;
        }

        return decompressed;
      } catch (error) {
        // If decompression fails, log error and return null
        // This prevents corrupted data from breaking the application
        console.error(
          '[zustand-debounce-compress] Decompression failed, returning null:',
          error,
        );
        return null;
      }
    },
  };
}
