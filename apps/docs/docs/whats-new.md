---
sidebar_position: 2
---

# What's New

The core of **Zustand Debounce** has been rewritten to be faster, lighter and safer. Stored data is fully compatible with 2.x in both directions, so you can upgrade (or roll back) without losing persisted state.

## Highlights

### ⚡ Lazy serialization ([#12](https://github.com/AbianS/zustand-debounce/issues/12))
Before, `JSON.stringify` ran on **every** state change, even though only the last one was written. Now the state is kept as an object while it waits, and it is serialized **once**, when it is actually written.

### 🔑 Per-key debounce
Before, the debounce was global: if two stores shared one storage instance, only the last store's change was saved. Now every key has its own timer.

### 🛟 No more lost changes
- Pending writes are flushed when the page is hidden or closed (`pagehide` / `visibilitychange`).
- New `storage.flush()` method to write everything pending right away.
- `throttleTime` delays changes instead of dropping them: the latest value is always written.
- `removeItem` (e.g. `persist.clearStorage()`) cancels the pending write, so cleared data is not written back.
- `getItem` returns the pending value if it has not been written yet.

### 💤 Idle writes
When the debounce fires, the write waits for an idle moment (`requestIdleCallback`, at most 1 second), following the [Idle Until Urgent](https://philipwalton.com/articles/idle-until-urgent/) pattern. Browsers without it (Safari) write right away.

### ⏱️ New `maxWait` option
Caps how long a change may wait while changes keep coming (like lodash's `maxWait`):

```typescript
createDebouncedJSONStorage('localStorage', { debounceTime: 1000, maxWait: 5000 });
```

### 🔧 Options that now work
`backoffMultiplier`, `onRetry`, `onError` and `onFlush` were documented but never wired up. They work now.

### 🧱 More robust
- Failed writes no longer cause unhandled promise rejections: they go to `onError` or `console.error`.
- Creating a store during SSR no longer throws (the adapter is resolved on first use).
- No runtime import of zustand, only its types.

## Benchmarks

Measured against the published **2.3.1** (Node 24, esbuild).

### Bundle size
An app that only uses `createDebouncedJSONStorage('localStorage', { debounceTime: 1000 })`:

| | 2.3.1 | New |
|---|---|---|
| Minified | 6,028 B | 3,694 B |
| Gzip | 1,870 B | 1,606 B |

### Cost of each state change
500 changes with `debounceTime: 1000`, time spent on the main thread per change:

| State size | 2.3.1 | New | Garbage created (2.3.1 → new) |
|------------|-------|-----|-------------------------------|
| 100 items | 0.012 ms | 0.0005 ms | 4.2 MB → 0.8 MB |
| 1,000 items | 0.098 ms | 0.0003 ms | 30 MB → 0.3 MB |
| 10,000 items | 0.917 ms | 0.0002 ms | 307 MB → 0.3 MB |

With 10,000 items, each change is about **4,500× cheaper**, and the cost no longer grows with the size of the state.

### Correctness

| Scenario | 2.3.1 | New |
|----------|-------|-----|
| Two stores sharing one storage | Only one store saved | Both saved |
| User typing non-stop for 2 s (`maxWait: 500`) | 0 writes until they stop | A write every 500 ms |
| Tab closed during the debounce | Change lost | Flushed |

## Upgrading from 2.x

No code changes are needed for most apps. Things to check:

- **Zustand 4.5 or later** is now required (peer dependency `>=4.5.0`). Versions before 4.2 never supported the `storage` option of `persist`.
- **`maxRetries`** now means *retries after the first attempt*, as documented. Before, it was the total number of attempts, and it defaulted to 3 when only `retryDelay` was set.
- **`serialize` / `deserialize`** keep working exactly as before: they transform the stored JSON string (e.g. encryption) and are only used when both are provided. If you used them to pick which fields to persist, switch to zustand's `partialize`.
- **`onWrite`** still receives the JSON string, so providing it serializes the state on every change. Leave it out if you don't need it.
