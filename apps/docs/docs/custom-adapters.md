---
sidebar_position: 6
---

# Custom Adapters

Learn how to create custom adapters to use **Zustand Debounce** with any storage system.

## What is an Adapter?

An adapter is an object that implements the `StateStorage` interface and allows Zustand Debounce to work with different storage systems.

```typescript
interface StateStorage {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}
```

## IndexedDB Adapter

```typescript title="indexeddb-adapter.ts"
function createIndexedDBAdapter(dbName: string, storeName: string): StateStorage {
  let dbPromise: Promise<IDBDatabase>;

  const openDB = () => {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };
      });
    }
    return dbPromise;
  };

  return {
    async getItem(key: string): Promise<string | null> {
      try {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        
        return new Promise((resolve, reject) => {
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Error getting item from IndexedDB:', error);
        return null;
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      try {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        return new Promise((resolve, reject) => {
          const request = store.put(value, key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Error setting item in IndexedDB:', error);
        throw error;
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        return new Promise((resolve, reject) => {
          const request = store.delete(key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Error removing item from IndexedDB:', error);
        throw error;
      }
    },
  };
}

// Usage
export const indexedDBStorage = createDebouncedJSONStorage(
  createIndexedDBAdapter('MyApp', 'zustand-store'),
  {
    debounceTime: 1000,
    maxRetries: 3,
  }
);
```

## Redis Adapter

```typescript title="redis-adapter.ts"
import Redis from 'ioredis';

function createRedisAdapter(redisUrl: string): StateStorage {
  const redis = new Redis(redisUrl);

  return {
    async getItem(key: string): Promise<string | null> {
      try {
        return await redis.get(key);
      } catch (error) {
        console.error('Error getting item from Redis:', error);
        return null;
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      try {
        await redis.set(key, value);
      } catch (error) {
        console.error('Error setting item in Redis:', error);
        throw error;
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        await redis.del(key);
      } catch (error) {
        console.error('Error removing item from Redis:', error);
        throw error;
      }
    },
  };
}

// Usage
export const redisStorage = createDebouncedJSONStorage(
  createRedisAdapter('redis://localhost:6379'),
  {
    debounceTime: 2000,
    maxRetries: 5,
    retryDelay: 1000,
  }
);
```

## React Native Adapter

```typescript title="react-native-adapter.ts"
import AsyncStorage from '@react-native-async-storage/async-storage';

const reactNativeAdapter: StateStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
      throw error;
    }
  },
};

// Usage
export const reactNativeStorage = createDebouncedJSONStorage(
  reactNativeAdapter,
  {
    debounceTime: 500,
    maxRetries: 3,
  }
);
```

---

:::tip Next steps
Explore more examples on the [examples page](./examples) or check out [advanced configuration](./configuration).
:::