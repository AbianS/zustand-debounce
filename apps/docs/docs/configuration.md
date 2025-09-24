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
- **Description**: Minimum time between write operations.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  throttleTime: 5000 // Maximum one write every 5 seconds
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
- **Description**: Maximum number of retries for failed operations.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3 // Retry up to 3 times
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
- **Description**: Executed when all retries fail.

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

### `serialize`
- **Type**: `(state: unknown) => string`
- **Default**: `JSON.stringify`
- **Description**: Custom function to serialize the state.

### `deserialize`
- **Type**: `(str: string) => unknown`
- **Default**: `JSON.parse`
- **Description**: Custom function to deserialize the state.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  serialize: (state) => {
    // Custom serialization with compression
    return LZ.compress(JSON.stringify(state));
  },
  deserialize: (str) => {
    // Custom deserialization with decompression
    return JSON.parse(LZ.decompress(str));
  }
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
  throttleTime: 10000,  // Maximum every 10 seconds
  maxRetries: 3,
  onWrite: () => showStatus('Saving...'),
  onSave: () => showStatus('Auto-saved'),
  serialize: (state) => {
    // Only save content, not cursor position
    const { content } = state as { content: string };
    return JSON.stringify({ content, savedAt: Date.now() });
  }
});
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
| `immediately` | `boolean` | `false` | Save without delay |
| `maxRetries` | `number` | `0` | Maximum number of retries |
| `retryDelay` | `number` | `0` | Time between retries |
| `ttl` | `number` | `0` | Data lifetime |
| `onWrite` | `function` | - | Callback on write |
| `onSave` | `function` | - | Callback on save |
| `onRetry` | `function` | - | Callback on retry |
| `onError` | `function` | - | Callback on error |
| `serialize` | `function` | `JSON.stringify` | Custom serialization |
| `deserialize` | `function` | `JSON.parse` | Custom deserialization |

---

:::tip Performance Tips
- **Low debounce (100-500ms)**: For infrequent changes
- **Medium debounce (500-2000ms)**: For frequent changes like forms
- **High debounce (2000-5000ms)**: For text editors or non-critical data
- **Throttle**: Use when you want a maximum limit of writes per time
:::

## Next Steps

- 💡 **[See practical examples](./examples)** of different configurations
- 🔧 **[Create custom adapters](./custom-adapters)** for external storage
- ❓ **[Review frequently asked questions](./faq)** about configuration