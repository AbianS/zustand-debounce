---
"zustand-debounce": major
---

# v3: faster, lighter and safer core

The core has been rewritten. Stored data is compatible with 2.x in both directions.

## ✨ New

- **Lazy serialization** (#12): the state is serialized once per write instead of on every change. Up to ~4,500× cheaper state changes on large states.
- **Per-key debounce**: stores sharing one storage instance no longer drop each other's writes.
- **`flush()`** on the returned storage, also run automatically on `pagehide` / `visibilitychange`, so the last change is not lost when the tab closes.
- **`maxWait`** option: write at least every N ms while changes keep coming.
- **Idle writes**: debounced writes run in `requestIdleCallback` (max 1s).

## 🐛 Fixes

- `throttleTime` delays writes instead of dropping them.
- `removeItem` / `persist.clearStorage()` cancels pending writes.
- `getItem` returns the pending value.
- `backoffMultiplier`, `onRetry`, `onError` and `onFlush` now work.
- Failed writes no longer cause unhandled promise rejections.
- Creating a store during SSR no longer throws.
- Smaller bundle (1.87 kB → 1.61 kB gzip) and no runtime import of zustand.

## 💥 Breaking changes

- **`maxRetries`** now means retries after the first attempt (as documented). It used to be the total number of attempts, defaulting to 3 when only `retryDelay` was set.
- **Requires zustand `>=4.5.0`.**
- `serialize` is now typed as `(str: string) => string`, matching what it always received.

See the [What's New page](https://abians.github.io/zustand-debounce/docs/whats-new) for benchmarks and upgrade notes.
