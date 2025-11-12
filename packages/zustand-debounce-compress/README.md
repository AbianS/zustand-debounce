# zustand-debounce-compress

**Compression plugin for zustand-debounce** - Automatically compress your Zustand state to reduce storage footprint.

This plugin uses LZ-based compression algorithms to significantly reduce the size of data stored in localStorage, sessionStorage, or any custom storage adapter. Perfect for applications with large state objects or strict storage quota requirements.

## ✨ Features

- 🗜️ **Automatic Compression**: Transparent compression/decompression - no changes to your app code
- 📉 **Reduces Storage Size**: Typically achieves 50-80% size reduction for JSON data
- ⚡ **Fast**: LZ-string is highly optimized for speed
- 🔒 **Safe**: Graceful error handling - never breaks your app
- 🌳 **Tree-shakeable**: Only ~2-3 kB added to your bundle
- 🎯 **Type-safe**: Full TypeScript support

## 📦 Installation

```bash
# Using npm
npm install zustand-debounce-compress lz-string

# Using yarn
yarn add zustand-debounce-compress lz-string

# Using pnpm
pnpm add zustand-debounce-compress lz-string
```

> **Note**: This package requires `zustand-debounce` as a peer dependency.

## 🚀 Quick Start

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { compress } from 'zustand-debounce-compress';

interface MyState {
  todos: Todo[];
  user: User;
  settings: Settings;
}

const useStore = create<MyState>()(
  persist(
    (set) => ({
      todos: [],
      user: null,
      settings: {},
      // ... your state and actions
    }),
    {
      name: 'my-app-storage',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000,
        plugins: [
          compress() // That's it! Data is now compressed
        ]
      })
    }
  )
);
```

## ⚙️ Configuration

### Options

```typescript
interface CompressOptions {
  algorithm?: 'lz-string' | 'base64';
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `algorithm` | `'lz-string' \| 'base64'` | `'lz-string'` | Compression algorithm to use |

### Algorithms

#### `lz-string` (default)

Best for most use cases. Provides excellent compression ratio with good performance.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  plugins: [
    compress({ algorithm: 'lz-string' })
  ]
});
```

**Pros:**
- Best compression ratio
- Fastest compression/decompression
- Smallest output size

**Use when:**
- You want maximum storage savings
- Performance is important
- Data stays in JavaScript environment

#### `base64`

LZ compression with base64 encoding. Output is URI-safe.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  plugins: [
    compress({ algorithm: 'base64' })
  ]
});
```

**Pros:**
- URI-safe characters only
- Compatible with query strings
- No special character issues

**Use when:**
- You need to pass data in URLs
- Your storage backend has character restrictions
- Compatibility is more important than size

## 📊 Performance

### Compression Ratios

Typical compression ratios for different types of data:

| Data Type | Original Size | Compressed Size | Reduction |
|-----------|---------------|-----------------|-----------|
| Repetitive JSON | 100 KB | 15 KB | 85% |
| Structured data | 50 KB | 12 KB | 76% |
| Mixed content | 75 KB | 30 KB | 60% |

### Benchmarks

Compression and decompression are extremely fast:

- **Compression**: ~1-2ms for 100KB of JSON data
- **Decompression**: ~0.5-1ms for 100KB of JSON data

> Performance measured on modern hardware. Your results may vary.

## 🔗 Plugin Composition

Combine with other plugins for advanced functionality:

```typescript
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { compress } from 'zustand-debounce-compress';
// import { encrypt } from 'zustand-debounce-crypto'; // Coming soon!

const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  plugins: [
    compress({ algorithm: 'lz-string' }), // Compress first
    // encrypt({ key: myKey })              // Then encrypt (future plugin)
  ]
});
```

**Plugin execution order matters!** Plugins are executed in array order:
1. On write: first plugin → last plugin → storage
2. On read: storage → first plugin → last plugin

## 💡 Best Practices

### When to Use Compression

✅ **Good use cases:**
- Large state objects (>10KB)
- Repetitive data structures
- JSON with many repeated keys
- Apps approaching localStorage quota (5-10MB)

❌ **Not recommended for:**
- Already compressed data (images, video)
- Very small state (<1KB) - overhead not worth it
- Binary data
- Random/encrypted data (won't compress well)

### Storage Quota Management

Compression helps you stay within browser storage limits:

```typescript
// Before: 5MB state → quota exceeded ❌
// After:  5MB state → ~1MB compressed → works! ✅

const storage = createDebouncedJSONStorage('localStorage', {
  plugins: [compress()]
});
```

### Error Handling

The plugin handles errors gracefully:

- **Compression fails**: Original value is stored (uncompressed)
- **Decompression fails**: Returns `null` (treated as cache miss)
- **Never throws**: Your app continues to work

## 🐛 Debugging

Enable logging to see compression stats:

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  plugins: [compress()],
  onSave: (key, value) => {
    const originalSize = new Blob([value]).size;
    console.log(`Saved ${key}: ${originalSize} bytes`);
  }
});
```

## 🤝 Compatibility

- **Node.js**: 18+
- **Browsers**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **TypeScript**: 4.5+
- **zustand-debounce**: 2.0.0+

## 📄 License

MIT © [AbianS](https://github.com/AbianS)

## 🔗 Links

- [GitHub Repository](https://github.com/AbianS/zustand-debounce)
- [Documentation](https://abians.github.io/zustand-debounce/)
- [Report Issues](https://github.com/AbianS/zustand-debounce/issues)

## 💬 Support

If you find this plugin useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📖 Improving documentation

---

<p align="center">Made with 💖 by <a href="https://github.com/AbianS">AbianS</a></p>
