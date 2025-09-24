---
sidebar_position: 1
---

# Introducción a Zustand Debounce

¡Bienvenido a **Zustand Debounce**! 🎉

**Zustand Debounce** es una extensión **ligera** y **poderosa** para [Zustand](https://github.com/pmndrs/zustand) que proporciona un sistema de almacenamiento JSON con debounce inteligente. 

## ¿Qué es el Debounce?

El debounce es una técnica de programación que **retrasa la ejecución** de una función hasta que haya pasado un tiempo determinado desde la última vez que fue invocada. En el contexto de Zustand Debounce:

- ✅ **Agrupa múltiples cambios** en una sola operación de escritura
- ✅ **Reduce las operaciones de I/O** significativamente
- ✅ **Mejora el rendimiento** de tu aplicación
- ✅ **Evita escrituras innecesarias** al storage

## ¿Por qué usar Zustand Debounce?

### 🚀 **Rendimiento Optimizado**
Reduce drásticamente las operaciones de escritura al storage, especialmente útil cuando tienes cambios frecuentes en tu estado.

### 🪶 **Ultra Ligero**
Solo **1.74 kB** comprimido y **cero dependencias** externas.

### 🛠️ **Fácil de usar**
Reemplaza `createJSONStorage` con `createDebouncedJSONStorage` y ¡listo!

### 🔧 **Altamente Configurable**
Múltiples opciones para personalizar el comportamiento según tus necesidades.

## Ejemplo Rápido

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface CounterState {
  count: number;
  increment: () => void;
}

const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: 'counter-storage',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000, // Guarda después de 1 segundo de inactividad
      }),
    }
  )
);
```

En este ejemplo, si el usuario hace clic en el botón de incrementar 10 veces rápidamente, en lugar de realizar 10 operaciones de escritura al `localStorage`, solo se realizará **1 operación** después de 1 segundo de inactividad.

## ¿Listo para empezar?

1. 📦 **[Instala la librería](./installation)** en tu proyecto
2. 🚀 **[Sigue la guía de inicio rápido](./quick-start)** para configurarla
3. ⚙️ **[Explora todas las opciones](./configuration)** disponibles
4. 💡 **[Ve ejemplos avanzados](./examples)** para casos de uso específicos

---

:::tip ¿Necesitas ayuda?
Si tienes alguna pregunta o problema, no dudes en abrir un [issue en GitHub](https://github.com/AbianS/zustand-debounce/issues) o revisar nuestra [documentación completa](./configuration).
:::
