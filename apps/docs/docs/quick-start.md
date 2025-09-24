---
sidebar_position: 3
---

# Inicio Rápido

Aprende a usar **Zustand Debounce** en menos de 5 minutos con ejemplos prácticos.

## Configuración Básica

La forma más simple de usar Zustand Debounce es reemplazar `createJSONStorage` con `createDebouncedJSONStorage`:

```typescript title="store.ts"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'counter-storage',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000, // Espera 1 segundo antes de guardar
      }),
    }
  )
);
```

## Uso en Componente React

```tsx title="Counter.tsx"
import React from 'react';
import { useCounterStore } from './store';

export function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div>
      <h2>Contador: {count}</h2>
      <div>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
        <button onClick={reset}>Reset</button>
      </div>
      <p>
        <small>
          Los cambios se guardan automáticamente después de 1 segundo de inactividad
        </small>
      </p>
    </div>
  );
}
```

## ¿Qué está pasando aquí?

1. **Sin debounce**: Cada clic guarda inmediatamente al localStorage (10 clics = 10 escrituras)
2. **Con debounce**: Los clics se agrupan y solo se guarda una vez después de 1 segundo de inactividad (10 clics = 1 escritura)

:::info Resultado
**Reducción del 90% en operaciones de escritura** en este ejemplo.
:::

## Ejemplo con Eventos

Puedes recibir notificaciones cuando ocurren eventos de escritura y guardado:

```typescript title="store-with-events.ts"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface UserState {
  name: string;
  email: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      email: '',
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
    }),
    {
      name: 'user-profile',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 500,
        onWrite: (key, value) => {
          console.log('📝 Cambio detectado en:', key);
        },
        onSave: (key, value) => {
          console.log('💾 Datos guardados en:', key);
          // Mostrar notificación de "Guardado automáticamente"
        },
      }),
    }
  )
);
```

## Diferentes Tipos de Storage

### localStorage (Persistente)
```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000
});
```

### sessionStorage (Sesión)
```typescript
const storage = createDebouncedJSONStorage('sessionStorage', {
  debounceTime: 500
});
```

### memoryStorage (En memoria)
```typescript
const storage = createDebouncedJSONStorage('memoryStorage', {
  debounceTime: 100
});
```

## Sistema de Reintentos

Para operaciones críticas, puedes habilitar reintentos automáticos:

```typescript title="store-with-retry.ts"
export const useCriticalStore = create()(
  persist(
    (set) => ({
      importantData: null,
      setImportantData: (data) => set({ importantData: data }),
    }),
    {
      name: 'critical-data',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000,
        maxRetries: 3,
        retryDelay: 1000,
        onRetry: (key, attempt, error, delay) => {
          console.log(`🔄 Reintento ${attempt}/3 en ${delay}ms`);
        },
        onError: (key, error) => {
          console.error('❌ Error al guardar:', error);
          // Mostrar notificación de error al usuario
        },
      }),
    }
  )
);
```

## Próximos Pasos

¡Excelente! Ya sabes lo básico de Zustand Debounce. Ahora puedes:

1. 📖 **[Explorar todas las opciones de configuración](./configuration)**
2. 💡 **[Ver ejemplos avanzados](./examples)**
3. 🔧 **[Crear adaptadores personalizados](./custom-adapters)**
4. ❓ **[Revisar las preguntas frecuentes](./faq)**

---

:::tip Consejo Pro
Para aplicaciones con muchos cambios frecuentes, prueba con un `debounceTime` entre 500-2000ms. Para cambios menos frecuentes, 100-500ms suele ser suficiente.
:::