type JsonStorageOptions = {
  reviver?: (key: string, value: unknown) => unknown;
  replacer?: (key: string, value: unknown) => unknown;
};

/**
 * Configuration options for the enhanced JSON storage with debounce functionality.
 * Extends the base JSON storage options with additional features for debouncing,
 * throttling, retry mechanisms, and event callbacks.
 *
 * @example
 * ```ts
 * const storage = createDebouncedJSONStorage('localStorage', {
 *   debounceTime: 1000,
 *   maxRetries: 3,
 *   retryDelay: 1000,
 *   onRetry: (key, attempt, error, delay) => {
 *     console.log(`Retry attempt ${attempt} for ${key}`);
 *   }
 * });
 * ```
 *
 * @interface EnhancedJsonStorageOptions
 * @extends {JsonStorageOptions}
 */
export interface EnhancedJsonStorageOptions extends JsonStorageOptions {
  /**
   * The time in milliseconds to wait before writing changes to storage.
   * Multiple changes within this time window will be grouped into a single write operation.
   * @default 0
   */
  debounceTime?: number;

  /**
   * The minimum time in milliseconds between write operations.
   * Ensures write operations are not performed more frequently than this interval.
   * @default 0
   */
  throttleTime?: number;

  /**
   * Maximum time in milliseconds a change may wait before being written,
   * even if changes keep coming (like lodash's `maxWait`). `0` disables it.
   * @default 0
   */
  maxWait?: number;

  /**
   * If true, changes will be written to storage immediately without debouncing.
   * Useful for critical updates that need to be persisted right away.
   * @default false
   */
  immediately?: boolean;

  /**
   * How many times a failed write is retried after the first attempt.
   * @default 0
   */
  maxRetries?: number;

  /**
   * The base delay in milliseconds between retry attempts.
   * This delay will be multiplied by the backoffMultiplier for each subsequent retry.
   * @default 0
   */
  retryDelay?: number;

  /**
   * Multiplier applied to `retryDelay` on each retry: `retryDelay * backoffMultiplier ** (attempt - 1)`.
   * @default 1
   */
  backoffMultiplier?: number;

  /**
   * Callback function triggered immediately when setItem is invoked.
   * Called before any debounce delay is applied.
   * Note: providing it serializes the state on every change.
   * @param key - The storage key being written
   * @param value - The value being stored
   */
  onWrite?: (key: string, value: string) => void;

  /**
   * Callback function triggered after the debounce delay when the data is actually saved.
   * @param key - The storage key that was written
   * @param value - The value that was stored
   */
  onSave?: (key: string, value: string) => void;

  /**
   * Callback function triggered when a manual flush operation is executed.
   * @param key - The storage key being flushed
   * @param value - The value being flushed
   */
  onFlush?: (key: string, value: string) => void;

  /**
   * Callback function triggered before each retry attempt.
   * Provides information about the retry attempt, the error that occurred,
   * and the delay before the next attempt.
   * @param key - The storage key being retried
   * @param attempt - The current retry attempt number
   * @param error - The error that triggered the retry
   * @param delay - The delay in milliseconds before the next retry attempt
   */
  onRetry?: (key: string, attempt: number, error: any, delay: number) => void;

  /**
   * Callback function triggered when all retry attempts have failed.
   * @param key - The storage key that failed
   * @param error - The last error that occurred
   */
  onError?: (key: string, error: any) => void;

  /**
   * Extra transform applied to the stored string (e.g. encryption), only
   * used together with `deserialize`. Receives the JSON string of the
   * persisted `{ state, version }` (wrapped by `ttl` if set).
   * Only runs when the value is actually written, not on every change.
   * @param str - The JSON string about to be stored
   * @returns The serialized state string
   */
  serialize?: (str: string) => string;

  /**
   * Custom function to deserialize the state after retrieving from storage.
   * @default JSON.parse
   * @param str - The serialized state string
   * @returns The deserialized state
   */
  deserialize?: (str: string) => unknown;

  /**
   * Time-to-live in milliseconds for stored data.
   * After this period, the data will be considered expired and removed from storage.
   * @default 0 - No expiration
   */
  ttl?: number;

  /**
   * Array of plugins to extend storage functionality.
   * Plugins are executed in the order they are provided in the array.
   * Each plugin can transform data before writing to storage and after reading from storage.
   * 
   * @example
   * ```ts
   * import { compress } from 'zustand-debounce-compress';
   * 
   * const storage = createDebouncedJSONStorage('localStorage', {
   *   debounceTime: 1000,
   *   plugins: [
   *     compress({ algorithm: 'lz-string' })
   *   ]
   * });
   * ```
   */
  plugins?: Plugin[];
}

/**
 * Plugin interface for extending storage functionality.
 * Plugins can intercept and transform data during storage operations.
 * All hooks are synchronous to maintain performance and simplicity.
 * 
 * @example
 * ```ts
 * const myPlugin: Plugin = {
 *   name: 'my-custom-plugin',
 *   beforeSetItem: (value) => {
 *     // Transform value before saving
 *     return transformedValue;
 *   },
 *   afterGetItem: (value) => {
 *     // Transform value after reading
 *     return transformedValue;
 *   }
 * };
 * ```
 */
export interface Plugin {
  /**
   * Unique name identifier for the plugin.
   * Used for debugging and error messages.
   */
  name: string;

  /**
   * Hook called before writing a value to storage.
   * Receives the serialized value and can return a transformed version.
   * Plugins are executed in array order (first to last).
   * 
   * @param value - The serialized value about to be written to storage
   * @returns Transformed value or undefined to skip transformation
   * 
   * @example
   * ```ts
   * beforeSetItem: (value) => {
   *   // Compress the value before storage
   *   return LZString.compress(value);
   * }
   * ```
   */
  beforeSetItem?: (value: string) => string | undefined;

  /**
   * Hook called after reading a value from storage.
   * Receives the raw value from storage and can return a transformed version.
   * Plugins are executed in array order (first to last).
   * 
   * @param value - The raw value read from storage (or null if not found)
   * @returns Transformed value, null, or undefined to skip transformation
   * 
   * @example
   * ```ts
   * afterGetItem: (value) => {
   *   if (!value) return null;
   *   // Decompress the value after reading
   *   return LZString.decompress(value);
   * }
   * ```
   */
  afterGetItem?: (value: string | null) => string | null | undefined;
}
