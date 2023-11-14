# Zustand Debounce

zustand-debounce is a library that extends the capabilities of [Zustand](https://github.com/pmndrs/zustand) to provide a JSON state storage system with delayed (debounced) writing to storage. With this tool, you can reduce the number of write operations to storage by delaying and grouping them.

✅ 🐙 Lightweight!! 701 B gzipped.

✅ 🚀 Easy integration into your projects.

✅ 🕒 Customize the debounce time according to your needs.

✅ 🔄 Avoid frequent writes to storage.

✅ Full TypeScript support.

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