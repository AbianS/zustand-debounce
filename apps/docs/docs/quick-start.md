---
sidebar_position: 3
---

# Quick Start

Learn to use **Zustand Debounce** in less than 5 minutes with practical examples.

## Basic Configuration

The simplest way to use Zustand Debounce is to replace `createJSONStorage` with `createDebouncedJSONStorage`:

```typescript title="store.ts"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'counter-storage',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000, // Wait 1 second before saving
      }),
    }
  )
);
```

## Usage in React Component

```tsx title="Counter.tsx"
import React from 'react';
import { useCounterStore } from './store';

export function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div>
      <h2>Counter: {count}</h2>
      <div>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
        <button onClick={reset}>Reset</button>
      </div>
      <p>
        <small>
          Changes are automatically saved after 1 second of inactivity
        </small>
      </p>
    </div>
  );
}
```

## What's happening here?

1. **Without debounce**: Each click saves immediately to localStorage (10 clicks = 10 writes)
2. **With debounce**: Clicks are grouped and only saved once after 1 second of inactivity (10 clicks = 1 write)

:::info Result
**90% reduction in write operations** in this example.
:::

## Example with Events

You can receive notifications when write and save events occur:

```typescript title="store-with-events.ts"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface UserState {
  name: string;
  email: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      email: '',
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
    }),
    {
      name: 'user-profile',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 500,
        onWrite: (key, value) => {
          console.log('📝 Change detected in:', key);
        },
        onSave: (key, value) => {
          console.log('💾 Data saved in:', key);
          // Show "Auto-saved" notification
        },
      }),
    }
  )
);
```

## Different Storage Types

### localStorage (Persistent)
```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000
});
```

### sessionStorage (Session)
```typescript
const storage = createDebouncedJSONStorage('sessionStorage', {
  debounceTime: 500
});
```

### memoryStorage (In-memory)
```typescript
const storage = createDebouncedJSONStorage('memoryStorage', {
  debounceTime: 100
});
```

## Retry System

For critical operations, you can enable automatic retries:

```typescript title="store-with-retry.ts"
export const useCriticalStore = create()(
  persist(
    (set) => ({
      importantData: null,
      setImportantData: (data) => set({ importantData: data }),
    }),
    {
      name: 'critical-data',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000,
        maxRetries: 3,
        retryDelay: 1000,
        onRetry: (key, attempt, error, delay) => {
          console.log(`🔄 Retry ${attempt}/3 in ${delay}ms`);
        },
        onError: (key, error) => {
          console.error('❌ Error saving:', error);
          // Show error notification to user
        },
      }),
    }
  )
);
```

## Next Steps

Excellent! You now know the basics of Zustand Debounce. Now you can:

1. 📖 **[Explore all configuration options](./configuration)**
2. 💡 **[See advanced examples](./examples)**
3. 🔧 **[Create custom adapters](./custom-adapters)**
4. ❓ **[Review frequently asked questions](./faq)**

---

:::tip Pro Tip
For applications with many frequent changes, try a `debounceTime` between 500-2000ms. For less frequent changes, 100-500ms is usually sufficient.
:::