---
sidebar_position: 8
---

# Plugin System

Zustand Debounce features a powerful and flexible plugin system that allows you to extend storage functionality with custom transformations. Plugins operate at the data layer, intercepting values before they're written to storage and after they're read.

## Overview

Plugins enable you to:

- **Compress data** to reduce storage footprint
- **Encrypt sensitive information** before storage
- **Transform data** in custom ways
- **Add validation** or sanitization layers
- **Monitor and log** storage operations

## How Plugins Work

Plugins are simple objects that implement the `Plugin` interface with two optional hooks:

```typescript
interface Plugin {
  name: string;
  beforeSetItem?: (value: string) => string | undefined;
  afterGetItem?: (value: string | null) => string | null | undefined;
}
```

### Execution Flow

**On Write (setItem):**
```
User State → Serialization → TTL → Retry → Throttle → Plugin 1 → Plugin 2 → Storage
```

**On Read (getItem):**
```
Storage → Plugin 1 → Plugin 2 → Serialization → TTL → User State
```

Plugins are executed **in array order**, allowing you to compose multiple transformations predictably.

## Using Plugins

Pass plugins as an array in the `plugins` option:

```typescript
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { compress } from 'zustand-debounce-compress';

const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  plugins: [
    compress({ algorithm: 'lz-string' })
  ]
});
```

### Composing Multiple Plugins

You can combine multiple plugins for powerful transformations:

```typescript
import { compress } from 'zustand-debounce-compress';
// Future plugins:
// import { encrypt } from 'zustand-debounce-crypto';
// import { monitor } from 'zustand-debounce-metrics';

const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  plugins: [
    compress({ algorithm: 'lz-string' }), // First: compress
    // encrypt({ key: myKey }),            // Then: encrypt compressed data
    // monitor({ interval: 60000 })        // Finally: monitor operations
  ]
});
```

:::tip Order Matters
Plugins are executed in the order they appear in the array. On write, data flows through plugins sequentially. On read, data flows through plugins in the same order (not reversed).
:::

## Official Plugins

### zustand-debounce-compress

Automatically compress your state to reduce storage size by 50-80%.

```bash
npm install zustand-debounce-compress
```

```typescript
import { compress } from 'zustand-debounce-compress';

const storage = createDebouncedJSONStorage('localStorage', {
  plugins: [
    compress({ 
      algorithm: 'lz-string' // or 'base64'
    })
  ]
});
```

**Features:**
- Reduces storage size by 50-80% for typical JSON data
- Two algorithms: `lz-string` (best compression) and `base64` (URI-safe)
- Transparent compression/decompression
- Graceful error handling
- ~2-3 kB bundle size

**Use cases:**
- Large state objects (>10KB)
- Apps approaching localStorage quota limits
- Repetitive or structured JSON data

[📖 Full documentation](https://github.com/AbianS/zustand-debounce/tree/main/packages/zustand-debounce-compress)


## Creating Custom Plugins

You can create your own plugins by implementing the `Plugin` interface:

```typescript
import type { Plugin } from 'zustand-debounce';

const uppercasePlugin: Plugin = {
  name: 'uppercase-plugin',
  
  // Transform before writing to storage
  beforeSetItem: (value: string) => {
    return value.toUpperCase();
  },
  
  // Transform after reading from storage
  afterGetItem: (value: string | null) => {
    if (!value) return null;
    return value.toLowerCase();
  }
};

// Use your plugin
const storage = createDebouncedJSONStorage('localStorage', {
  plugins: [uppercasePlugin]
});
```

### Plugin Best Practices

1. **Always return a value**: If your plugin doesn't transform the data, return the original value
2. **Handle null gracefully**: `afterGetItem` receives `null` for cache misses
3. **Handle errors**: Wrap transformations in try-catch and log errors
4. **Be idempotent**: Multiple applications should produce the same result
5. **Document side effects**: Clearly document any side effects your plugin has
6. **Keep it focused**: Each plugin should do one thing well

### Example: Validation Plugin

```typescript
const validationPlugin: Plugin = {
  name: 'validation-plugin',
  
  beforeSetItem: (value: string) => {
    try {
      const parsed = JSON.parse(value);
      
      // Validate structure
      if (!parsed.state || typeof parsed.state !== 'object') {
        console.warn('Invalid state structure, storing anyway');
      }
      
      return value;
    } catch (error) {
      console.error('Invalid JSON, storing raw value:', error);
      return value;
    }
  },
  
  afterGetItem: (value: string | null) => {
    if (!value) return null;
    
    try {
      // Verify JSON is valid
      JSON.parse(value);
      return value;
    } catch (error) {
      console.error('Corrupted data detected:', error);
      return null; // Treat as cache miss
    }
  }
};
```

### Example: Logging Plugin

```typescript
const loggingPlugin: Plugin = {
  name: 'logging-plugin',
  
  beforeSetItem: (value: string) => {
    const size = new Blob([value]).size;
    console.log(`[Storage] Writing ${size} bytes`);
    return value; // Don't modify, just log
  },
  
  afterGetItem: (value: string | null) => {
    if (value) {
      const size = new Blob([value]).size;
      console.log(`[Storage] Read ${size} bytes`);
    } else {
      console.log('[Storage] Cache miss');
    }
    return value; // Don't modify, just log
  }
};
```

## Advanced Patterns

### Conditional Transformation

```typescript
const conditionalPlugin: Plugin = {
  name: 'conditional-plugin',
  
  beforeSetItem: (value: string) => {
    const size = new Blob([value]).size;
    
    // Only compress if data is large
    if (size > 10000) {
      return LZString.compress(value);
    }
    
    return value;
  },
  
  afterGetItem: (value: string | null) => {
    if (!value) return null;
    
    // Try to decompress, fallback to original
    try {
      const decompressed = LZString.decompress(value);
      return decompressed || value;
    } catch {
      return value;
    }
  }
};
```

### Metadata Injection

```typescript
const metadataPlugin: Plugin = {
  name: 'metadata-plugin',
  
  beforeSetItem: (value: string) => {
    const metadata = {
      data: value,
      timestamp: Date.now(),
      version: '1.0.0'
    };
    return JSON.stringify(metadata);
  },
  
  afterGetItem: (value: string | null) => {
    if (!value) return null;
    
    try {
      const metadata = JSON.parse(value);
      
      // Check if data is too old (e.g., 24 hours)
      const age = Date.now() - metadata.timestamp;
      if (age > 86400000) {
        console.warn('Stale data detected');
      }
      
      return metadata.data;
    } catch {
      return value; // Not wrapped, return as-is
    }
  }
};
```

## Performance Considerations

### Plugin Overhead

Plugins add minimal overhead to storage operations:

- **Synchronous operations**: < 1ms per plugin typically
- **String transformations**: Very fast (modern JS engines are optimized)
- **Compression**: 1-2ms for 100KB of JSON data
- **Multiple plugins**: Overhead is additive but usually negligible

### Optimization Tips

1. **Profile your plugins**: Use `console.time()` to measure performance
2. **Avoid heavy operations**: Keep transformations lightweight
3. **Cache expensive computations**: If possible, cache results within your plugin
4. **Consider data size**: Only use plugins when beneficial for your data size

## Debugging Plugins

### Enable Plugin Logging

```typescript
const debugPlugin: Plugin = {
  name: 'debug-plugin',
  
  beforeSetItem: (value: string) => {
    console.log('[Debug] beforeSetItem:', {
      size: new Blob([value]).size,
      preview: value.substring(0, 100)
    });
    return value;
  },
  
  afterGetItem: (value: string | null) => {
    console.log('[Debug] afterGetItem:', {
      hasValue: !!value,
      size: value ? new Blob([value]).size : 0
    });
    return value;
  }
};
```


## FAQ

### Can plugins be async?

No, plugins are intentionally synchronous to maintain performance and simplicity. If you need async operations, handle them outside the plugin system.

### What happens if a plugin throws an error?

Plugins are wrapped in try-catch blocks. Errors are logged to the console, but the storage operation continues with the original value.

### Can I modify plugin options after creation?

No, plugins are stateless and should not maintain internal state. Configuration is provided at creation time.

### How do I share state between plugins?

Plugins are independent and don't share state. If you need coordinated behavior, combine logic into a single plugin.
