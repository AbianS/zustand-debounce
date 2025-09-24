---
sidebar_position: 2
---

# Installation

Learn how to install and configure **Zustand Debounce** in your project.

## Prerequisites

Before installing Zustand Debounce, make sure you have:

- **Node.js** version 16.0 or higher
- **Zustand** version 4.0.0 or higher installed in your project

:::info Note about Zustand
Zustand Debounce is an extension for Zustand, so you need to have Zustand installed as a dependency in your project.
:::

## Installation with NPM

```bash
npm install zustand-debounce
```

## Installation with Yarn

```bash
yarn add zustand-debounce
```

## Installation with PNPM

```bash
pnpm add zustand-debounce
```

## Verify Installation

After installation, you can verify that everything works correctly by creating a small example:

```typescript
import { createDebouncedJSONStorage } from 'zustand-debounce';

// If there are no errors, the installation was successful
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000
});

console.log('✅ Zustand Debounce installed correctly!');
```

## Installing Zustand (If you don't have it yet)

If you don't have Zustand installed in your project yet:

```bash
# With npm
npm install zustand

# With yarn
yarn add zustand

# With pnpm
pnpm add zustand
```

## TypeScript Configuration

If you're using TypeScript, you don't need to install additional types since **Zustand Debounce includes its own TypeScript types**.

### Recommended `tsconfig.json` Configuration

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

## Bundle Size

Zustand Debounce está optimizado para ser extremadamente ligero:

- **📦 Bundle size**: 1.74 kB (minified + gzipped)
- **🚀 Zero dependencies**: No additional external dependencies
- **🌳 Tree-shakable**: Only import what you need

## Compatibility

| Tool        | Minimum Version | ✅ Compatible |
|-------------|----------------|---------------|
| Node.js     | 16.0+          | ✅            |
| Zustand     | 4.0.0+         | ✅            |

## Next Step

Excellent! Now that you have Zustand Debounce installed, continue with the [**Quick Start Guide**](./quick-start) to learn how to use the library.

---

:::tip Installation problems?
If you encounter any problems during installation, check:
- That you have the correct version of Node.js
- That Zustand is installed in your project
- The complete error logs to diagnose the problem

You can also open an [issue on GitHub](https://github.com/AbianS/zustand-debounce/issues) if you need help.
:::