# Zustand Debounce

**Lightweight** and **powerful** extension for [Zustand](https://github.com/pmndrs/zustand) providing debounced JSON state storage.

Zustand Debounce enhances the capabilities of Zustand by introducing a debounced JSON state storage system. By delaying and grouping write operations to storage, you can significantly reduce the number of write operations, improving performance and efficiency in your applications.

## 🚀 Features

✅ **Ultra Lightweight:** Only 1.19 kB gzipped 🐙

✅ **Easy Integration:** Seamlessly integrates into your existing projects 🚀

✅ **Customizable Debounce Time:** Adjust the debounce time to suit your needs ⏳

✅ **Reduced Write Operations:** Avoid frequent writes to storage, optimizing performance 🔄

✅ **Retry Mechanism:** Automatically retries failed write operations with customizable settings 🔁

✅ **Advanced Retry with Exponential Backoff:** Configure exponential backoff with `maxRetries`, `retryDelay`, and `backoffMultiplier` for more resilient retries 📈

✅ **Multiple Storage Adapters:** Choose between `'localStorage'`, `'sessionStorage'`, or `'memoryStorage'` adapters 🗄️

✅ **Extended Event System:** Additional events like `onFlush`, `onRetry`, and `onError` for better control 🎣

✅ **TTL Support:** Specify a Time-To-Live for stored data ⌛

✅ **Custom Serialization:** Use custom serialization and deserialization functions 🛠️

✅ **Full TypeScript Support:** Fully typed for TypeScript projects 📘

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
| `throttleTime`      | `number`                              | `0`               | The throttle time in milliseconds. Ensures that write operations are not performed more frequently than this interval.                                                                                                               |
| `immediately`       | `boolean`                             | `false`           | If set to `true`, write operations will occur immediately without any delay.                                                                                                                                                        |
| `maxRetries`        | `number`                              | `0`               | The maximum number of times to retry a failed write operation.                                                                                                                                                                      |
| `retryDelay`        | `number`                              | `0`               | The delay in milliseconds between retry attempts for failed write operations.                                                                                                                                                       |
| `backoffMultiplier` | `number`                              | `1`               | The multiplier used for exponential backoff between retry attempts. Each retry will wait `retryDelay * (backoffMultiplier ^ attempt)` milliseconds.                                                                                  |
| `onWrite`           | `(key: string, value: string) => void` | `undefined`       | A callback function that is called immediately when `setItem` is invoked, before the debounce delay.                                                                                                                                |
| `onSave`            | `(key: string, value: string) => void` | `undefined`       | A callback function that is called after the debounce delay when the data is actually saved to storage.                                                                                                                             |
| `onFlush`           | `(key: string, value: string) => void` | `undefined`       | A callback function that is called when a manual flush operation is executed.                                                                                                                                                      |
| `onRetry`           | `(key: string, attempt: number, error: any, delay: number) => void` | `undefined` | A callback function that is called before each retry attempt, providing information about the retry attempt number, the error that occurred, and the delay before the next attempt.                                    |
| `onError`           | `(key: string, error: any) => void`    | `undefined`       | A callback function that is called when all retry attempts have failed.                                                                                                                                                            |
| `serialize`         | `(state: unknown) => string`           | `JSON.stringify`  | A custom function to serialize the state before saving it to storage.                                                                                                                                                               |
| `deserialize`       | `(str: string) => unknown`             | `JSON.parse`      | A custom function to deserialize the state after retrieving it from storage.                                                                                                                                                        |
| `ttl`               | `number`                              | `0`               | Time-to-live in milliseconds for the stored data. After this period, the data will be considered expired and removed from storage.                                                                                                  |


## 🌟 Advanced Usage

Here is an example demonstrating the use of multiple options:

```ts
import { createDebouncedJSONStorage } from 'zustand-debounce';

// Example with localStorage
const localStorageExample = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000, // Delay write operations by 1 second
  throttleTime: 5000, // Ensure writes are at least 5 seconds apart
  immediately: false, // Do not write immediately
  maxRetries: 3, // Retry failed writes up to 3 times
  retryDelay: 2000, // Wait 2 seconds between retries
  ttl: 86400000, // Data expires after 24 hours
  onWrite: (key, value) => {
    console.log(`Write initiated for ${key}`);
  },
  onSave: (key, value) => {
    console.log(`Data saved for ${key}`);
  },
  serialize: (state) => {
    // Custom serialization logic
    return JSON.stringify(state);
  },
  deserialize: (str) => {
    // Custom deserialization logic
    return JSON.parse(str);
  },
});

// Example with sessionStorage and advanced retry + events
const sessionStorageExample = createDebouncedJSONStorage('sessionStorage', {
  debounceTime: 500,
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2, // Each retry will wait longer: 1s, 2s, 4s
  onRetry: (key, attempt, error, delay) => {
    console.log(`Retry ${attempt} for ${key} after ${delay}ms. Error: ${error.message}`);
  },
  onError: (key, error) => {
    console.error(`All retries failed for ${key}:`, error);
  },
  onFlush: (key, value) => {
    console.log(`Manual flush executed for ${key}`);
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