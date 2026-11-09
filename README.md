# Zustand Debounce

**Lightweight** and **powerful** extension for [Zustand](https://github.com/pmndrs/zustand) providing debounced JSON state storage.

Zustand Debounce enhances the capabilities of Zustand by introducing a debounced JSON state storage system. By delaying and grouping write operations to storage, you can significantly reduce the number of write operations, improving performance and efficiency in your applications.

> **New version:** the core has been rewritten — lazy serialization, per-key debounce, `flush()`, `maxWait`, and state changes up to 4,500× cheaper. Stored data stays compatible with 2.x. [See what's new and the benchmarks →](https://abians.github.io/zustand-debounce/docs/whats-new)

## 🚀 Features

✅ **Ultra Lightweight:** Only 1.4 kB (minified + brotli), zero dependencies 🐙

✅ **Easy Integration:** Seamlessly integrates into your existing projects 🚀

✅ **Customizable Debounce Time:** Adjust the debounce time to suit your needs ⏳

✅ **Reduced Write Operations:** Avoid frequent writes to storage, optimizing performance 🔄

✅ **Lazy Serialization:** The state is serialized once per write, not on every change ⚡

✅ **Per-Key Debounce:** Several stores can share one storage without losing writes 🔑

✅ **Never Lose the Last Change:** Pending writes are flushed when the page is hidden or closed, and you can call `flush()` yourself 🛟

✅ **Idle Writes:** Debounced writes run when the browser is idle (`requestIdleCallback`) 💤

✅ **Retry Mechanism:** Automatically retries failed write operations with customizable settings 🔁

✅ **Advanced Retry with Exponential Backoff:** Configure exponential backoff with `maxRetries`, `retryDelay`, and `backoffMultiplier` for more resilient retries 📈

✅ **Multiple Storage Adapters:** Choose between `'localStorage'`, `'sessionStorage'`, or `'memoryStorage'` adapters 🗄️

✅ **Extended Event System:** Additional events like `onFlush`, `onRetry`, and `onError` for better control 🎣

✅ **TTL Support:** Specify a Time-To-Live for stored data ⌛

✅ **Custom Serialization:** Use custom serialization and deserialization functions 🛠️

✅ **Full TypeScript Support:** Fully typed for TypeScript projects 📘

✅ **Plugin System:** Extensible plugin architecture for custom functionality 🔌

## 📦 Installation

```bash
# Using npm
npm install zustand-debounce

# Using yarn
yarn add zustand-debounce

# Using pnpm
pnpm add zustand-debounce
```

## 📖 Table of Contents

- [🔧 Usage](#-usage)
- [⚙️ Options](#️-options)
- [🌟 Advanced Usage](#-advanced-usage)
- [🔌 Plugin System](#-plugin-system)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [💬 Support](#-support)

## 🔧 Usage

To start using Zustand Debounce, replace createJSONStorage with createDebouncedJSONStorage in your Zustand store setup. This will enable delayed writes to your storage.

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

// Your store interface
interface PersonState {
  name: string;
  age: number;
  // Other state properties
}

interface Actions {
  setName: (name: string) => void;
  setAge: (age: number) => void;
  // Other actions
}

// Create the store
export const usePersonStore = create<PersonState & Actions>()(
  persist(
    (set) => ({
      // Initial state
      name: '',
      age: 0,
      // Actions
      setName: (name) => set({ name }),
      setAge: (age) => set({ age }),
    }),
    {
      name: 'person-storage',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 2000, // Debounce time in milliseconds ⏳
        // Other options can be specified here
      }),
    }
  )
);
```

With the above setup, changes to the store will be saved to the storage after a 2-second delay, grouping multiple rapid changes into a single write operation.

---


## ⚙️ Options

createDebouncedJSONStorage accepts a variety of options to customize its behavior:

| **Option**           | **Type**                              | **Default**       | **Description**                                                                                                                                                                                                                     |
|---------------------|---------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `debounceTime`      | `number`                              | `0`               | The debounce time in milliseconds. Write operations will be delayed by this amount of time. If multiple writes occur within this period, they will be grouped into a single write.                                                  |
| `throttleTime`      | `number`                              | `0`               | The throttle time in milliseconds. Ensures that write operations are not performed more frequently than this interval. Changes are delayed, never dropped: the latest value is always written.                                     |
| `maxWait`           | `number`                              | `0`               | Maximum time in milliseconds a change may wait before being written, even if changes keep coming (like lodash's `maxWait`). `0` disables it.                                                                                       |
| `immediately`       | `boolean`                             | `false`           | If set to `true`, write operations will occur immediately without any delay.                                                                                                                                                        |
| `maxRetries`        | `number`                              | `0`               | How many times a failed write is retried after the first attempt.                                                                                                                                                                   |
| `retryDelay`        | `number`                              | `0`               | The delay in milliseconds between retry attempts for failed write operations.                                                                                                                                                       |
| `backoffMultiplier` | `number`                              | `1`               | The multiplier used for exponential backoff between retry attempts. Retry `n` waits `retryDelay * backoffMultiplier ^ (n - 1)` milliseconds.                                                                                         |
| `onWrite`           | `(key: string, value: string) => void` | `undefined`       | A callback function that is called immediately when `setItem` is invoked, before the debounce delay.                                                                                                                                |
| `onSave`            | `(key: string, value: string) => void` | `undefined`       | A callback function that is called after the debounce delay when the data is actually saved to storage.                                                                                                                             |
| `onFlush`           | `(key: string, value: string) => void` | `undefined`       | A callback function that is called for each key written by `flush()` (manual or on page hide).                                                                                                                                     |
| `onRetry`           | `(key: string, attempt: number, error: any, delay: number) => void` | `undefined` | A callback function that is called before each retry attempt, providing information about the retry attempt number, the error that occurred, and the delay before the next attempt.                                    |
| `onError`           | `(key: string, error: any) => void`    | `undefined`       | A callback function that is called when all retry attempts have failed.                                                                                                                                                            |
| `serialize`         | `(str: string) => string`              | `undefined`       | Extra transform applied to the stored JSON string (e.g. encryption). Only used together with `deserialize`. To choose *what* is persisted, use zustand's `partialize`.                                                             |
| `deserialize`       | `(str: string) => unknown`             | `undefined`       | Reverses `serialize` when reading. Only used together with `serialize`.                                                                                                                                                             |
| `ttl`               | `number`                              | `0`               | Time-to-live in milliseconds for the stored data. After this period, the data will be considered expired and removed from storage.                                                                                                  |
| `plugins`           | `Plugin[]`                             | `[]`              | Plugins that transform the stored string (see [Plugin System](#-plugin-system)).                                                                                                                                                    |

### 🛟 Flushing pending writes

The returned storage has a `flush()` method that writes every pending change right away. It also runs automatically when the page is hidden or closed (`pagehide` / `visibilitychange`), so the last change is not lost.

```ts
const storage = createDebouncedJSONStorage('localStorage', { debounceTime: 2000 });

// e.g. before logging out or navigating away manually
await storage.flush();
```


## 🌟 Advanced Usage

Here is an example demonstrating the use of multiple options:

```ts
import { createDebouncedJSONStorage } from 'zustand-debounce';

// Example with localStorage
const localStorageExample = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000, // Delay write operations by 1 second
  maxWait: 5000, // But write at least every 5 seconds while changes keep coming
  maxRetries: 3, // Retry failed writes up to 3 times
  retryDelay: 2000, // Wait 2 seconds between retries
  ttl: 86400000, // Data expires after 24 hours
  onWrite: (key, value) => {
    console.log(`Write initiated for ${key}`);
  },
  onSave: (key, value) => {
    console.log(`Data saved for ${key}`);
  },
});

// Example with encryption of the stored string
const encryptedExample = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  serialize: (str) => encrypt(str), // receives the JSON string
  deserialize: (str) => decrypt(str),
});

// Example with sessionStorage and advanced retry + events
const sessionStorageExample = createDebouncedJSONStorage('sessionStorage', {
  debounceTime: 500,
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2, // Retries wait 1s, 2s, 4s
  onRetry: (key, attempt, error, delay) => {
    console.log(`Retry ${attempt} for ${key} after ${delay}ms. Error: ${error.message}`);
  },
  onError: (key, error) => {
    console.error(`All retries failed for ${key}:`, error);
  },
  onFlush: (key, value) => {
    console.log(`Flushed ${key}`);
  }
});

// Example with in-memory storage
const memoryStorageExample = createDebouncedJSONStorage('memoryStorage', {
  debounceTime: 100,
  immediately: true
});

// Example with custom storage adapter
const customStorageExample = createDebouncedJSONStorage({
  getItem: async (key: string) => {
    // Implement your custom get logic here
    return await myCustomDatabase.get(key);
  },
  setItem: async (key: string, value: string) => {
    // Implement your custom set logic here
    await myCustomDatabase.set(key, value);
  },
  removeItem: async (key: string) => {
    // Implement your custom remove logic here
    await myCustomDatabase.delete(key);
  }
}, {
  debounceTime: 1000,
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2
});
```

## 🔧 Creating Custom Storage Adapters

You can create your own storage adapter by implementing the `StateStorage` interface. This allows you to integrate any storage solution with Zustand Debounce:

```ts
interface StateStorage {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

// Example: Custom IndexedDB adapter
const createIndexedDBAdapter = (dbName: string, storeName: string): StateStorage => {
  // Open IndexedDB connection
  const dbPromise = indexedDB.open(dbName, 1);
  
  dbPromise.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore(storeName);
  };

  return {
    async getItem(key) {
      const db = await dbPromise;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      return await store.get(key);
    },
    async setItem(key, value) {
      const db = await dbPromise;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.put(value, key);
    },
    async removeItem(key) {
      const db = await dbPromise;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.delete(key);
    }
  };
};

// Use your custom adapter
const customDBStorage = createDebouncedJSONStorage(
  createIndexedDBAdapter('myDB', 'zustand-store'),
  {
    debounceTime: 1000,
    // ... other options
  }
);
```

## 🔌 Plugin System

Zustand Debounce now features a powerful plugin system that allows you to extend storage functionality with custom transformations. Plugins can intercept data before it's written to storage and after it's read, enabling features like compression, encryption, and more.

### Using Plugins

Plugins are passed as an array in the `plugins` option. They are executed in order, allowing you to compose multiple transformations:

```ts
import { createDebouncedJSONStorage } from 'zustand-debounce';
import { compress } from 'zustand-debounce-compress';

const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  plugins: [
    compress({ algorithm: 'lz-string' })
  ]
});
```

### Official Plugins

#### 🗜️ zustand-debounce-compress

Automatically compress your state to reduce storage size by 50-80%. Perfect for large state objects or apps approaching localStorage quota limits.

```bash
npm install zustand-debounce-compress
```

```ts
import { compress } from 'zustand-debounce-compress';

const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  plugins: [
    compress({ algorithm: 'lz-string' }) // or 'base64'
  ]
});
```

**Features:**
- Reduces storage size by 50-80% for typical JSON data
- Two algorithms: `'lz-string'` (fastest, best compression) and `'base64'` (URI-safe)
- Transparent compression/decompression
- Graceful error handling

[📖 Full documentation](./packages/zustand-debounce-compress/README.md)

### Creating Custom Plugins

You can create your own plugins by implementing the `Plugin` interface:

```ts
import type { Plugin } from 'zustand-debounce';

const myPlugin: Plugin = {
  name: 'my-custom-plugin',
  
  // Transform data before writing to storage
  beforeSetItem: (value: string) => {
    // Your transformation logic here
    return transformedValue;
  },
  
  // Transform data after reading from storage
  afterGetItem: (value: string | null) => {
    if (!value) return null;
    // Your transformation logic here
    return transformedValue;
  }
};

// Use your plugin
const storage = createDebouncedJSONStorage('localStorage', {
  plugins: [myPlugin]
});
```

**Plugin execution order:**
- On write: Plugin 1 → Plugin 2 → Plugin N → Storage
- On read: Storage → Plugin 1 → Plugin 2 → Plugin N

### Plugin Composition

Plugins can be composed together for powerful transformations:

```ts
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  plugins: [
    compress({ algorithm: 'lz-string' }), // Compress first
    // encrypt({ key: myKey }),            // Then encrypt (coming soon)
  ]
});
```

**Note:** Order matters! The first plugin processes data first on write, and processes data first on read.

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or have found a bug, please open an issue or submit a pull request.

1. **Fork the repository**
2. **Create a new branch:** git checkout -b feature/your-feature-name
3. **Make your changes** and commit them: git commit -m 'Add some feature'
4. **Push to the branch:** git push origin feature/your-feature-name
5. **Open a pull request**

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

If you find this project useful, please consider giving it a ⭐ on GitHub. If you have any questions or need support, feel free to open an issue or contact me.

<hr />

<p align="center" style="text-align:center">with 💖 by <a href="https://github.com/AbianS" target="_blank">AbianS</a></p>