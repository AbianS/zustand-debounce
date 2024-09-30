# Zustand Debounce

Zustand Debounce is a powerful extension for [Zustand](https://github.com/pmndrs/zustand) that enhances your state management by providing delayed (debounced) and throttled writing to storage, custom serialization, TTL (Time to Live) for your data, and more. With this tool, you can optimize performance by reducing unnecessary write operations and gain fine-grained control over your persisted state.

- 🐙 Lightweight: Minimal overhead with powerful features.
- 🚀 Easy Integration: Seamless integration with your existing Zustand stores.
- ⏳ Debounce and Throttle: Customize debounce and throttle times to optimize writes.
- 🔄 Flush Mechanism: Manually flush pending writes when needed.
- 🔁 Error Handling and Retries: Robust error handling with configurable retries.
- 🎣 Events and Callbacks: React to storage events with custom callbacks.
- 📝 Custom Serialization: Define your own serialization and deserialization methods.
- ⏱️ Time to Live (TTL): Automatically expire data after a specified duration.
- 💪 Full TypeScript Support: Strong typing for safer and more predictable code.

## Installation

```bash
pnpm add zustand-debounce
# o
npm install zustand-debounce
# o
yarn add zustand-debounce
```

## Usage

```ts
import { createDebouncedJSONStorage } from "zustand-debounce"

// Replace createJSONStorage with createDebouncedJSONStorage
// Experience the enchantment of delayed writes ✨
export const usePersonStore = create<PersonState & Actions>()(
  persist(storeApi, {
    name: "person-storage",
    storage: createDebouncedJSONStorage(firebaseStorage, {
      debounceTime: 2000, // Debounce time in milliseconds ⏳
    }),
  }),
)
```

## Contributions

Contributions are welcome. If you find an issue or have an idea to improve zustand-debounce, feel free to open an issue or submit a pull request.

## License 📜

Licensed as MIT open source.

<hr />

<p align="center" style="text-align:center">with 💖 by <a href="https://github.com/AbianS" target="_blank">AbianS</a></p>
