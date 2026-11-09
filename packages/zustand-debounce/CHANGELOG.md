# zustand-debounce

## 3.0.0

### Major Changes

- [#20](https://github.com/AbianS/zustand-debounce/pull/20) [`539c1bc`](https://github.com/AbianS/zustand-debounce/commit/539c1bc6b7e13b834aef568f1d639d65bf9b3dd0) Thanks [@AbianS](https://github.com/AbianS)! - # v3: faster, lighter and safer core
  
  The core has been rewritten. Stored data is compatible with 2.x in both directions.
  
  ## ✨ New
  
  - **Lazy serialization** ([#12](https://github.com/AbianS/zustand-debounce/issues/12)): the state is serialized once per write instead of on every change. Up to ~4,500× cheaper state changes on large states.
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

## 2.3.1

### Patch Changes

- [#18](https://github.com/AbianS/zustand-debounce/pull/18) [`06030c2`](https://github.com/AbianS/zustand-debounce/commit/06030c2622078c412ded634bc3c55c6d89188a2f) Thanks [@AbianS](https://github.com/AbianS)! - chore: update dependencies

## 2.3.0

### Minor Changes

- [#16](https://github.com/AbianS/zustand-debounce/pull/16) [`ae46096`](https://github.com/AbianS/zustand-debounce/commit/ae460964e477c24b5c2e2347a6a2ad833ea9c4b7) Thanks [@AbianS](https://github.com/AbianS)! - # Plugin System Implementation

  ## zustand-debounce

  ### ✨ New Features

  - **Plugin System**: Introduced a powerful and extensible plugin architecture
    - Simple plugin interface with `beforeSetItem` and `afterGetItem` hooks
    - Synchronous execution for optimal performance
    - Predictable execution order (array order)
    - Type-safe with full TypeScript support
    - Zero breaking changes - fully backward compatible

  ### 📦 New Exports

  - `Plugin` interface for creating custom plugins

  ### 🔧 Internal Changes

  - New `PluginManager` class for plugin orchestration
  - Updated `BaseStorage` to support optional plugin integration
  - Enhanced `createDebouncedJSONStorage` with `plugins` option

  ## zustand-debounce-compress

  ### 🎉 Initial Release

  First official release of the compression plugin for zustand-debounce.

  ### ✨ Features

  - Automatic compression/decompression of storage data
  - Two algorithms: `lz-string` (best compression) and `base64` (URI-safe)
  - Reduces storage size by 50-80% for typical JSON data
  - Graceful error handling
  - Fully tree-shakeable (~666 bytes ESM)
  - Zero configuration required

  ### 📖 Use Cases

  - Large state objects (>10KB)
  - Apps approaching localStorage quota limits
  - Repetitive or structured JSON data

  ### 🔗 Dependencies

  - `lz-string: ^1.5.0`
  - Peer: `zustand-debounce: >=2.0.0`
