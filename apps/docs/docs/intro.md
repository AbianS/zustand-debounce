---
sidebar_position: 1
---

# Introduction to Zustand Debounce

Welcome to **Zustand Debounce**! 🎉

**Zustand Debounce** is a **lightweight** and **powerful** extension for [Zustand](https://github.com/pmndrs/zustand) that provides a JSON storage system with intelligent debouncing. 

:::tip New version
The core has been rewritten: lazy serialization, per-key debounce, `flush()`, `maxWait` and up to 4,500× cheaper state changes. **[See what's new →](./whats-new)**
:::

## What is Debounce?

Debounce is a programming technique that **delays the execution** of a function until a certain amount of time has passed since the last time it was invoked. In the context of Zustand Debounce:

- ✅ **Groups multiple changes** into a single write operation
- ✅ **Reduces I/O operations** significantly
- ✅ **Improves your application's performance**
- ✅ **Prevents unnecessary writes** to storage

## Why use Zustand Debounce?

### 🚀 **Optimized Performance**
Drastically reduces storage write operations, especially useful when you have frequent state changes.

### 🪶 **Ultra Lightweight**
Only **1.4 kB** compressed and **zero external dependencies**.

### 🛟 **Never Lose the Last Change**
Pending writes are flushed when the page is hidden or closed, and the state is only serialized when it is actually written.

### 🛠️ **Easy to use**
Replace `createJSONStorage` with `createDebouncedJSONStorage` and you're done!

### 🔧 **Highly Configurable**
Multiple options to customize behavior according to your needs.

## Quick Example

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface CounterState {
  count: number;
  increment: () => void;
}

const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: 'counter-storage',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000, // Save after 1 second of inactivity
      }),
    }
  )
);
```

In this example, if the user clicks the increment button 10 times quickly, instead of performing 10 write operations to `localStorage`, only **1 operation** will be performed after 1 second of inactivity.

## Ready to get started?

1. 📦 **[Install the library](./installation)** in your project
2. 🚀 **[Follow the quick start guide](./quick-start)** to configure it
3. ⚙️ **[Explore all available options](./configuration)**
4. 💡 **[See advanced examples](./examples)** for specific use cases

---

:::tip Need help?
If you have any questions or problems, don't hesitate to open an [issue on GitHub](https://github.com/AbianS/zustand-debounce/issues) or check our [complete documentation](./configuration).
:::
