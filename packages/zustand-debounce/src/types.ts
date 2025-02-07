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
   * If true, changes will be written to storage immediately without debouncing.
   * Useful for critical updates that need to be persisted right away.
   * @default false
   */
  immediately?: boolean;

  /**
   * The maximum number of retry attempts for failed write operations.
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
   * Callback function triggered immediately when setItem is invoked.
   * Called before any debounce delay is applied.
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
   * Custom function to serialize the state before saving to storage.
   * @default JSON.stringify
   * @param state - The state to serialize
   * @returns The serialized state string
   */
  serialize?: (state: unknown) => string;

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
}

export interface IStorage {
  getItem(key: string): Promise<string | null> | null | string;
  setItem(key: string, value: string): Promise<unknown> | unknown;
  removeItem(key: string): Promise<unknown> | unknown;
  flush?(): Promise<void>;
}
