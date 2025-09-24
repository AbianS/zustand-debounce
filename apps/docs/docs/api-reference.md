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
): PersistStorage<unknown>
```

### Parameters

#### `storageApi`
- **Type**: `AdapterIdentifier`
- **Values**: `'localStorage' | 'sessionStorage' | 'memoryStorage' | StateStorage`

#### `options`
- **Type**: `EnhancedJsonStorageOptions`
- **Optional**: Yes

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debounceTime` | `number` | `0` | Wait time in ms |
| `throttleTime` | `number` | `0` | Minimum time between writes |
| `immediately` | `boolean` | `false` | Save immediately |
| `maxRetries` | `number` | `0` | Maximum number of retries |
| `retryDelay` | `number` | `0` | Time between retries |
| `ttl` | `number` | `0` | Data lifetime |
| `onWrite` | `function` | - | Callback on write |
| `onSave` | `function` | - | Callback on save |
| `onRetry` | `function` | - | Callback on retry |
| `onError` | `function` | - | Callback on error |
| `serialize` | `function` | `JSON.stringify` | Serialization function |
| `deserialize` | `function` | `JSON.parse` | Deserialization function |

### Usage Example

```typescript
import { createDebouncedJSONStorage } from 'zustand-debounce';

const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  maxRetries: 3,
  onSave: (key, value) => console.log('Saved:', key)
});
```

## TypeScript Types

### `EnhancedJsonStorageOptions`

```typescript
interface EnhancedJsonStorageOptions {
  debounceTime?: number;
  throttleTime?: number;
  immediately?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  ttl?: number;
  onWrite?: (key: string, value: string) => void;
  onSave?: (key: string, value: string) => void;
  onRetry?: (key: string, attempt: number, error: any, delay: number) => void;
  onError?: (key: string, error: any) => void;
  serialize?: (state: unknown) => string;
  deserialize?: (str: string) => unknown;
}
```

### `AdapterIdentifier`

```typescript
type AdapterIdentifier = 
  | StateStorage
  | 'localStorage'
  | 'sessionStorage'
  | 'memoryStorage';
```