---
sidebar_position: 7
---

# Performance Optimization

Guide to get maximum performance from **Zustand Debounce** in different scenarios.

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
  maxRetries: 3,
  serialize: (state) => {
    // Only save essential content
    const { content, title } = state;
    return JSON.stringify({ content, title });
  }
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

### 1. Optimize Serialization
```typescript
const optimizedStorage = createDebouncedJSONStorage('localStorage', {
  serialize: (state) => {
    // Exclude non-persistent data
    const { temporaryData, ...persistentState } = state;
    return JSON.stringify(persistentState);
  }
});
```

### 2. Use TTL to Clean Data
```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  debounceTime: 1000,
});
```

### 3. Monitor Performance
```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  onWrite: () => performance.mark('storage-write-start'),
  onSave: () => {
    performance.mark('storage-write-end');
    performance.measure('storage-write', 'storage-write-start', 'storage-write-end');
  }
});
```