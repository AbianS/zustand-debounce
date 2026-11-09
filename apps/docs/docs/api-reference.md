---
sidebar_position: 8
---

# API Reference

Complete API documentation for **Zustand Debounce**.

## `createDebouncedJSONStorage`

Main function to create a debounced storage.

```typescript
function createDebouncedJSONStorage(
  storageApi: AdapterIdentifier,
  options?: EnhancedJsonStorageOptions
): DebouncedJSONStorage
```

### Parameters

#### `storageApi`
- **Type**: `AdapterIdentifier`
- **Values**: `'localStorage' | 'sessionStorage' | 'memoryStorage' | StateStorage`
- The adapter is resolved on first use, so creating a store during SSR does not throw.

#### `options`
- **Type**: `EnhancedJsonStorageOptions`
- **Optional**: Yes

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debounceTime` | `number` | `0` | Wait time in ms |
| `throttleTime` | `number` | `0` | Minimum time between writes |
| `maxWait` | `number` | `0` | Maximum time a change may wait |
| `immediately` | `boolean` | `false` | Save immediately |
| `maxRetries` | `number` | `0` | Retries after the first attempt |
| `retryDelay` | `number` | `0` | Time between retries |
| `backoffMultiplier` | `number` | `1` | Delay multiplier per retry |
| `ttl` | `number` | `0` | Data lifetime |
| `plugins` | `Plugin[]` | `[]` | Transforms of the stored string |
| `onWrite` | `function` | - | Callback on write |
| `onSave` | `function` | - | Callback on save |
| `onFlush` | `function` | - | Callback per key written by `flush()` |
| `onRetry` | `function` | - | Callback on retry |
| `onError` | `function` | - | Callback on error |
| `serialize` | `function` | - | Extra transform of the stored JSON string |
| `deserialize` | `function` | - | Reverses `serialize` |
| `replacer` / `reviver` | `function` | - | Passed to `JSON.stringify` / `JSON.parse` |

### Return Value

A zustand `PersistStorage` (pass it as `storage` to `persist`) with one extra method:

#### `flush(): Promise<void>`

Writes every pending change right away. It also runs automatically when the page is hidden or closed.

### Usage Example

```typescript
import { createDebouncedJSONStorage } from 'zustand-debounce';

const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  maxRetries: 3,
  onSave: (key, value) => console.log('Saved:', key)
});

await storage.flush();
```

## TypeScript Types

### `EnhancedJsonStorageOptions`

```typescript
interface EnhancedJsonStorageOptions {
  debounceTime?: number;
  throttleTime?: number;
  maxWait?: number;
  immediately?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  ttl?: number;
  plugins?: Plugin[];
  onWrite?: (key: string, value: string) => void;
  onSave?: (key: string, value: string) => void;
  onFlush?: (key: string, value: string) => void;
  onRetry?: (key: string, attempt: number, error: any, delay: number) => void;
  onError?: (key: string, error: any) => void;
  serialize?: (str: string) => string;
  deserialize?: (str: string) => unknown;
  replacer?: (key: string, value: unknown) => unknown;
  reviver?: (key: string, value: unknown) => unknown;
}
```

### `DebouncedJSONStorage`

```typescript
type DebouncedJSONStorage = PersistStorage<unknown> & {
  flush: () => Promise<void>;
};
```

### `AdapterIdentifier`

```typescript
type AdapterIdentifier = 
  | StateStorage
  | 'localStorage'
  | 'sessionStorage'
  | 'memoryStorage';
```
