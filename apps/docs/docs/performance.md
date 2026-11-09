---
sidebar_position: 7
---

# Performance Optimization

Guide to get maximum performance from **Zustand Debounce** in different scenarios.

## What It Does for You

- **Lazy serialization**: `persist` hands over the state on every change, but it is only turned into JSON once, when it is actually written.
- **Per-key debounce**: several stores can share one storage instance without cancelling each other's writes.
- **Idle writes**: when the debounce fires, the write waits for an idle moment (`requestIdleCallback`, at most 1 second).
- **No lost changes**: pending writes are flushed when the page is hidden or closed.

### Benchmark

Cost of each state change on the main thread (500 changes, `debounceTime: 1000`, Node 24):

| State size | v2.3.1 | Current | Garbage created (v2.3.1 → current) |
|------------|--------|---------|------------------------------------|
| 100 items | 0.012 ms | 0.0005 ms | 4.2 MB → 0.8 MB |
| 1,000 items | 0.098 ms | 0.0003 ms | 30 MB → 0.3 MB |
| 10,000 items | 0.917 ms | 0.0002 ms | 307 MB → 0.3 MB |

The cost no longer grows with the size of the state, because nothing is serialized until the write.

## Configuration by Application Type

### Chat/Messaging Applications
```typescript
const chatStorage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 300,    // Fast response
  throttleTime: 2000,   // Limit writes
  maxRetries: 5,        // Critical not to lose messages
});
```

### Text Editors
```typescript
const editorStorage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 2000,   // Don't interrupt user
  maxWait: 10000,       // But save at least every 10 seconds while typing
  maxRetries: 3,
});
```

### Games
```typescript
const gameStorage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 5000,   // Don't affect FPS
  maxRetries: 10,       // Progress is critical
  throttleTime: 10000,  // Maximum every 10 seconds
});
```

## Best Practices

### 1. Persist Only What You Need
Use zustand's `partialize`: less data means faster serialization and smaller storage.

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'app',
    storage: createDebouncedJSONStorage('localStorage', { debounceTime: 1000 }),
    // Exclude non-persistent data
    partialize: ({ temporaryData, ...persistentState }) => persistentState,
  }
);
```

### 2. Use `maxWait` for Continuous Changes
With a plain debounce, a user typing non-stop delays the write until they stop. `maxWait` caps that delay.

### 3. Use TTL to Clean Data
```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  debounceTime: 1000,
});
```

### 4. Monitor Performance
```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  onWrite: () => performance.mark('storage-write-start'),
  onSave: () => {
    performance.mark('storage-write-end');
    performance.measure('storage-write', 'storage-write-start', 'storage-write-end');
  }
});
```

:::note
`onWrite` receives the JSON string, so providing it serializes the state on every change. Leave it out in hot paths.
:::
