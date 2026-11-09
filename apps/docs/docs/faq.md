---
sidebar_position: 9
---

# Frequently Asked Questions (FAQ)

Answers to the most common questions about **Zustand Debounce**.

## ❓ General Questions

### What is Zustand Debounce?

Zustand Debounce is an extension for Zustand that optimizes storage write operations through intelligent debouncing. Instead of saving each change immediately, it groups multiple changes and saves them once after a period of inactivity.

### Why do I need debounce in my storage?

**Without debounce**: If a user makes 10 quick changes, 10 write operations are performed to localStorage/sessionStorage.

**With debounce**: The same 10 changes are grouped into 1 single write operation.

This results in:
- 🚀 Better performance
- 🔋 Less CPU usage
- 💾 Fewer I/O operations
- ⚡ Smoother application

### Is it compatible with my current project?

Zustand Debounce is a **drop-in replacement** for `createJSONStorage`. You only need:

```typescript
// Before
storage: createJSONStorage(() => localStorage)

// After  
storage: createDebouncedJSONStorage('localStorage', { debounceTime: 1000 })
```

## 🔧 Configuration

### What `debounceTime` value should I use?

It depends on your use case:

- **100-500ms**: Infrequent changes (settings)
- **500-1000ms**: Forms and user inputs
- **1000-3000ms**: Text editors
- **3000ms+**: Data that changes very frequently (games, animations)

### When to use `throttleTime` vs `debounceTime`?

- **`debounceTime`**: Waits until there are no more changes
- **`throttleTime`**: Guarantees a maximum of writes per time

```typescript
// Only debounce: Wait 1 second after the last change
debounceTime: 1000

// Only throttle: Maximum one write every 5 seconds
throttleTime: 5000

// Wait 1 second after the last change, but never more than 5 seconds
debounceTime: 1000,
maxWait: 5000
```

### What happens if the user closes the tab before the debounce fires?

Nothing is lost: pending writes are flushed when the page is hidden or closed (`pagehide` / `visibilitychange`). You can also call `storage.flush()` yourself, for example before logging out.

### Can several stores share the same storage instance?

Yes. The debounce is per key (the `name` of each store), so one store never cancels another store's pending write.

### When to use `immediately: true`?

When you need certain changes to be saved instantly without delay:

```typescript
// For critical data like authentication
const authStorage = createDebouncedJSONStorage('localStorage', {
  immediately: true // Save tokens immediately
});
```

## 🔄 Retries

### When to enable retries?

Enable retries for important data that cannot be lost:

- ✅ Game progress
- ✅ Shopping carts
- ✅ Important forms
- ❌ Visual preferences (theme, language)
- ❌ Temporary states

### What values to use for retries?

```typescript
// Conservative configuration
maxRetries: 3,
retryDelay: 1000

// Aggressive configuration for critical data
maxRetries: 5,
retryDelay: 2000
```

## 🚀 Performance

### Does it affect my application's performance?

Quite the opposite! Zustand Debounce **improves** performance:

- ✅ Reduces I/O operations to storage
- ✅ Serializes the state only when writing, not on every change
- ✅ Writes during idle time, so it doesn't block the main thread
- ✅ Only 1.4 kB overhead
- ✅ Zero external dependencies

See the [benchmarks](./performance#benchmark).

### Does it work with React DevTools?

Yes, fully compatible. Zustand Debounce doesn't interfere with:
- React DevTools
- Zustand DevTools
- Time-travel debugging
- Hot reloading

## 🐛 Troubleshooting

### Changes are not being saved

**Possible causes:**

1. **`debounceTime` too high**: Changes are still being "debounced" (add `maxWait` if changes never stop)
2. **Storage error**: Check console for errors (failed writes are logged unless you pass `onError`)
3. **Storage full**: localStorage has space limits

**Solutions:**

```typescript
// Add logging for debug
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  onWrite: (key) => console.log('📝 Writing:', key),
  onSave: (key) => console.log('💾 Saved:', key),
  onError: (key, error) => console.error('❌ Error:', key, error),
});
```

### Error: "localStorage is not available"

Creating the storage no longer throws on the server: the adapter is resolved on first use. If the store tries to read during SSR, `persist` reports the error to `onRehydrateStorage` and hydration simply happens in the browser. To avoid it entirely, pick the adapter per environment or use zustand's `skipHydration`:

```typescript
const storage = createDebouncedJSONStorage(
  typeof window !== 'undefined' ? 'localStorage' : 'memoryStorage',
  { debounceTime: 1000 }
);
```

### Retries are not working

Retries are enabled with `maxRetries` (retries after the first attempt). `retryDelay` is optional:

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3,     // ✅ Required
  retryDelay: 1000,  // Optional, defaults to 0
  onRetry: (key, attempt, error, delay) => {
    console.log(`Retry ${attempt}: ${error.message}`);
  }
});
```

## 📱 Compatibility

### Does it work with React Native?

Yes, but you need a custom adapter:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const reactNativeAdapter = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

const storage = createDebouncedJSONStorage(reactNativeAdapter, {
  debounceTime: 1000
});
```

### Does it work with Next.js?

Perfectly compatible. Creating the store on the server does not throw; to skip reading storage during SSR:

```typescript
const storage = createDebouncedJSONStorage(
  typeof window !== 'undefined' ? 'localStorage' : 'memoryStorage',
  { debounceTime: 1000 }
);
```

### Does it work with other frameworks?

Yes, Zustand Debounce is framework-agnostic. It works with:
- ✅ React
- ✅ Vue (with pinia-zustand-adapter)
- ✅ Angular
- ✅ Svelte
- ✅ Vanilla JavaScript

## 📝 Best Practices

### How to structure multiple stores?

```typescript
// Separate by domain
const useUserStore = create(persist(..., {
  name: 'user-data',
  storage: createDebouncedJSONStorage('localStorage', {
    debounceTime: 1000,
    maxRetries: 3 // Important data
  })
}));

const useUIStore = create(persist(..., {
  name: 'ui-preferences', 
  storage: createDebouncedJSONStorage('localStorage', {
    debounceTime: 500 // Fast response for UX
  })
}));
```

### How to handle sensitive data?

```typescript
const sensitiveStorage = createDebouncedJSONStorage('sessionStorage', {
  debounceTime: 0, // No delay for sensitive data
  ttl: 30 * 60 * 1000, // Expires in 30 minutes
  // serialize receives the JSON string that is about to be stored
  serialize: (str) => encrypt(str),
  deserialize: (str) => decrypt(str),
});
```

---

:::tip Can't find your question?
If you have a question that's not here, please:
1. Check the [complete documentation](./configuration)
2. Search [GitHub Issues](https://github.com/AbianS/zustand-debounce/issues)
3. Open a new issue if you can't find the answer
:::

## 🤝 Contributing

Found a bug or have an idea to improve? Contributions are welcome!

1. Fork the repository
2. Create a branch for your feature
3. Send a Pull Request

[See more on GitHub →](https://github.com/AbianS/zustand-debounce)