---
"zustand-debounce": minor
"zustand-debounce-compress": major
---

# Plugin System Implementation

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
