---
sidebar_position: 8
---

# Migration Guide

Learn how to migrate from standard `createJSONStorage` to **Zustand Debounce**.

## Basic Migration

### Before (Standard Zustand)
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create()(
  persist(
    (set) => ({ count: 0 }),
    {
      name: 'my-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### After (Zustand Debounce)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

const useStore = create()(
  persist(
    (set) => ({ count: 0 }),
    {
      name: 'my-store',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000
      }),
    }
  )
);
```

## Important Changes

1. **Import**: Import from `zustand-debounce`
2. **Syntax**: Use string identifier instead of function
3. **Options**: Second parameter for configuration

## Migration without Behavior Changes

If you want to migrate without changing current behavior:

```typescript
// Identical behavior to original
storage: createDebouncedJSONStorage('localStorage', {
  debounceTime: 0  // No debounce = original behavior
})
```

## Verify Migration

After migrating, verify that:
- Existing data loads correctly
- Behavior is as expected  
- No errors in console