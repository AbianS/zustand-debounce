---
sidebar_position: 4
---

# Configuration

Complete guide to all configuration options available in **Zustand Debounce**.

## Basic Options

### `debounceTime`
- **Type**: `number`  
- **Default**: `0`
- **Description**: Time in milliseconds to wait before saving changes.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000 // Wait 1 second
});
```

### `throttleTime`
- **Type**: `number`
- **Default**: `0`  
- **Description**: Minimum time between write operations. Changes inside the window are delayed, never dropped: the latest value is always written.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  throttleTime: 5000 // Maximum one write every 5 seconds
});
```

### `maxWait`
- **Type**: `number`
- **Default**: `0` (disabled)
- **Description**: Maximum time a change may wait before being written, even if changes keep coming. Without it, a user typing non-stop never lets the debounce settle.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000, // Wait for 1 second of inactivity...
  maxWait: 5000       // ...but write at least every 5 seconds
});
```

### `immediately`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: If `true`, saves immediately without debounce.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  immediately: true // Save instantly
});
```

## Retry Options

### `maxRetries`
- **Type**: `number`
- **Default**: `0`
- **Description**: How many times a failed write is retried after the first attempt.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3 // Up to 4 attempts in total
});
```

### `retryDelay`
- **Type**: `number`
- **Default**: `0`
- **Description**: Base time between retries in milliseconds.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3,
  retryDelay: 1000 // Wait 1 second between retries
});
```

### `backoffMultiplier`
- **Type**: `number`
- **Default**: `1`
- **Description**: Multiplies the delay on each retry. Retry `n` waits `retryDelay * backoffMultiplier ^ (n - 1)`.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2 // Retries wait 1s, 2s, 4s
});
```

## Event Callbacks

### `onWrite`
- **Type**: `(key: string, value: string) => void`
- **Description**: Executed immediately when `setItem` is called.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  onWrite: (key, value) => {
    console.log(`📝 Writing ${key}:`, value);
    showStatusIndicator('Saving...');
  }
});
```

### `onSave`
- **Type**: `(key: string, value: string) => void`
- **Description**: Executed when data is actually saved.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  onSave: (key, value) => {
    console.log(`💾 Saved ${key}:`, value);
    showStatusIndicator('Saved ✅');
  }
});
```

### `onFlush`
- **Type**: `(key: string, value: string) => void`
- **Description**: Executed for each key written by `flush()`, whether you call it or it runs on page hide.

### `onRetry`
- **Type**: `(key: string, attempt: number, error: any, delay: number) => void`
- **Description**: Executed before each retry attempt.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3,
  retryDelay: 1000,
  onRetry: (key, attempt, error, delay) => {
    console.log(`🔄 Retry ${attempt} for ${key} in ${delay}ms`);
    showNotification(`Retrying... (${attempt}/3)`);
  }
});
```

### `onError`
- **Type**: `(key: string, error: any) => void`
- **Description**: Executed when all retries fail. Without it, the error is logged with `console.error` (it never becomes an unhandled rejection).

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3,
  onError: (key, error) => {
    console.error(`❌ Final error for ${key}:`, error);
    showErrorNotification('Could not save changes');
  }
});
```

## Custom Serialization

The state is always turned into JSON first, and only when it is actually written (not on every change). `serialize` / `deserialize` are an **extra transform of that JSON string**, for things like encryption. Both must be provided.

:::tip Choosing what to persist
To persist only part of the state, use zustand's `partialize` option, not `serialize`.
For compression, use the [`zustand-debounce-compress` plugin](./plugins).
:::

### `serialize`
- **Type**: `(str: string) => string`
- **Description**: Receives the JSON string (wrapped by `ttl` if set) and returns what is stored.

### `deserialize`
- **Type**: `(str: string) => unknown`
- **Description**: Reverses `serialize` when reading.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  serialize: (str) => encrypt(str),
  deserialize: (str) => decrypt(str),
});
```

## Time-to-Live (TTL)

### `ttl`
- **Type**: `number`
- **Default**: `0` (no expiration)
- **Description**: Lifetime in milliseconds for stored data.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  ttl: 24 * 60 * 60 * 1000 // 24 hours
});
```

:::warning Important
When `ttl` is specified, expired data is automatically removed when attempting to read it.
:::

## Flushing Pending Writes

`createDebouncedJSONStorage` returns zustand's `PersistStorage` plus a `flush()` method that writes every pending change right away.

```typescript
const storage = createDebouncedJSONStorage('localStorage', { debounceTime: 2000 });

// e.g. before logging out
await storage.flush();
```

`flush()` also runs automatically when the page is hidden or closed (`pagehide` / `visibilitychange`), so the last change is not lost when the user closes the tab.

:::info How writes are scheduled
- Debounce is **per key**: several stores can share one storage without cancelling each other.
- While a write is pending, `getItem` returns the pending value, and `removeItem` (e.g. `persist.clearStorage()`) cancels it.
- When the debounce fires, the write waits for an idle moment (`requestIdleCallback`, at most 1 second) so it does not compete with animations or input.
:::

## Option Combinations

### Configuration for Chat Application
```typescript
const chatStorage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 500,    // Quick response
  maxRetries: 5,        // Critical not to lose messages
  retryDelay: 2000,     // Enough time for recovery
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  onWrite: () => showTypingIndicator(),
  onSave: () => hideTypingIndicator(),
  onError: () => showOfflineMode()
});
```

### Configuration for Text Editor
```typescript
const editorStorage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 2000,   // Don't save on every keystroke
  maxWait: 10000,       // But save at least every 10 seconds while typing
  maxRetries: 3,
  onWrite: () => showStatus('Saving...'),
  onSave: () => showStatus('Auto-saved'),
});

// Only persist the content, not the cursor position:
// persist(..., { name: 'editor', storage: editorStorage, partialize: (s) => ({ content: s.content }) })
```

### Configuration for Critical Data
```typescript
const criticalStorage = createDebouncedJSONStorage('localStorage', {
  immediately: true,    // No delay
  maxRetries: 10,       // Many retries
  retryDelay: 1000,
  onRetry: (key, attempt) => {
    logToAnalytics(`critical_save_retry_${attempt}`, { key });
  },
  onError: (key, error) => {
    // Send to monitoring service
    sendToSentry(error, { context: 'critical_storage', key });
  }
});
```

## Quick Reference Table

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debounceTime` | `number` | `0` | Wait time before saving |
| `throttleTime` | `number` | `0` | Minimum time between writes |
| `maxWait` | `number` | `0` | Maximum time a change may wait |
| `immediately` | `boolean` | `false` | Save without delay |
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
| `serialize` | `function` | - | Extra transform of the stored string |
| `deserialize` | `function` | - | Reverses `serialize` |

---

:::tip Performance Tips
- **Low debounce (100-500ms)**: For infrequent changes
- **Medium debounce (500-2000ms)**: For frequent changes like forms
- **High debounce (2000-5000ms)**: For text editors or non-critical data
- **Throttle**: Use when you want a maximum limit of writes per time
- **maxWait**: Use when changes can be continuous (typing, dragging)
:::

## Next Steps

- 💡 **[See practical examples](./examples)** of different configurations
- 🔧 **[Create custom adapters](./custom-adapters)** for external storage
- ❓ **[Review frequently asked questions](./faq)** about configuration