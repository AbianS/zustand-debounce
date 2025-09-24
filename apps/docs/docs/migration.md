---
sidebar_position: 8
---

# Guía de Migración

Aprende cómo migrar desde `createJSONStorage` estándar a **Zustand Debounce**.

## Migración Básica

### Antes (Zustand estándar)
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

### Después (Zustand Debounce)
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

## Cambios Importantes

1. **Importación**: Importa desde `zustand-debounce`
2. **Sintaxis**: Usa string identifier en lugar de función
3. **Opciones**: Segundo parámetro para configuración

## Migración sin Cambios de Comportamiento

Si quieres migrar sin cambiar el comportamiento actual:

```typescript
// Comportamiento idéntico al original
storage: createDebouncedJSONStorage('localStorage', {
  debounceTime: 0  // Sin debounce = comportamiento original
})
```

## Verificar la Migración

Después de migrar, verifica que:
- Los datos existentes se cargan correctamente
- El comportamiento es el esperado
- No hay errores en la consola