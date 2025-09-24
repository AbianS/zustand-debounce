---
sidebar_position: 9
---

# Preguntas Frecuentes (FAQ)

Respuestas a las preguntas más comunes sobre **Zustand Debounce**.

## ❓ Preguntas Generales

### ¿Qué es Zustand Debounce?

Zustand Debounce es una extensión para Zustand que optimiza las operaciones de escritura al storage mediante debounce inteligente. En lugar de guardar cada cambio inmediatamente, agrupa múltiples cambios y los guarda una sola vez después de un período de inactividad.

### ¿Por qué necesito debounce en mi storage?

**Sin debounce**: Si un usuario hace 10 cambios rápidos, se realizan 10 operaciones de escritura al localStorage/sessionStorage.

**Con debounce**: Los mismos 10 cambios se agrupan en 1 sola operación de escritura.

Esto resulta en:
- 🚀 Mejor rendimiento
- 🔋 Menos uso de CPU
- 💾 Menos operaciones de I/O
- ⚡ Aplicación más fluida

### ¿Es compatible con mi proyecto actual?

Zustand Debounce es un **drop-in replacement** para `createJSONStorage`. Solo necesitas:

```typescript
// Antes
storage: createJSONStorage(() => localStorage)

// Después  
storage: createDebouncedJSONStorage('localStorage', { debounceTime: 1000 })
```

## 🔧 Configuración

### ¿Qué valor de `debounceTime` debo usar?

Depende de tu caso de uso:

- **100-500ms**: Cambios poco frecuentes (configuraciones)
- **500-1000ms**: Formularios y inputs del usuario
- **1000-3000ms**: Editores de texto
- **3000ms+**: Datos que cambian muy frecuentemente (juegos, animaciones)

### ¿Cuándo usar `throttleTime` vs `debounceTime`?

- **`debounceTime`**: Espera hasta que no haya más cambios
- **`throttleTime`**: Garantiza un máximo de escrituras por tiempo

```typescript
// Solo debounce: Espera 1 segundo después del último cambio
debounceTime: 1000

// Solo throttle: Máximo una escritura cada 5 segundos
throttleTime: 5000

// Ambos: Espera 1 segundo, pero nunca más de 5 segundos
debounceTime: 1000,
throttleTime: 5000
```

### ¿Cuándo usar `immediately: true`?

Cuando necesitas que ciertos cambios se guarden al instante sin espera:

```typescript
// Para datos críticos como autenticación
const authStorage = createDebouncedJSONStorage('localStorage', {
  immediately: true // Guarda tokens inmediatamente
});
```

## 🔄 Reintentos

### ¿Cuándo habilitar reintentos?

Habilita reintentos para datos importantes que no pueden perderse:

- ✅ Progreso de juego
- ✅ Carritos de compra
- ✅ Formularios importantes
- ❌ Preferencias visuales (tema, idioma)
- ❌ Estados temporales

### ¿Qué valores usar para reintentos?

```typescript
// Configuración conservadora
maxRetries: 3,
retryDelay: 1000

// Configuración agresiva para datos críticos
maxRetries: 5,
retryDelay: 2000
```

## 🚀 Rendimiento

### ¿Afecta el rendimiento de mi aplicación?

¡Todo lo contrario! Zustand Debounce **mejora** el rendimiento:

- ✅ Reduce operaciones de I/O al storage
- ✅ Evita bloqueos del hilo principal
- ✅ Solo 1.74 kB de overhead
- ✅ Cero dependencias externas

### ¿Funciona con React DevTools?

Sí, completamente compatible. Zustand Debounce no interfiere con:
- React DevTools
- Zustand DevTools
- Time-travel debugging
- Hot reloading

## 🐛 Troubleshooting

### Los cambios no se guardan

**Posibles causas:**

1. **`debounceTime` muy alto**: Los cambios siguen siendo "debouncados"
2. **Error en storage**: Revisa la consola para errores
3. **Storage lleno**: localStorage tiene límites de espacio

**Soluciones:**

```typescript
// Agregar logging para debug
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  onWrite: (key) => console.log('📝 Escribiendo:', key),
  onSave: (key) => console.log('💾 Guardado:', key),
  onError: (key, error) => console.error('❌ Error:', key, error),
});
```

### Error: "localStorage is not available"

Esto ocurre en entornos sin browser (SSR, Node.js):

```typescript
// Solución: Detectar entorno
const storage = createDebouncedJSONStorage(
  typeof window !== 'undefined' ? 'localStorage' : 'memoryStorage',
  { debounceTime: 1000 }
);
```

### Los reintentos no funcionan

Verifica que tengas los parámetros correctos:

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3,     // ✅ Requerido
  retryDelay: 1000,  // ✅ Requerido
  onRetry: (key, attempt, error, delay) => {
    console.log(`Reintento ${attempt}: ${error.message}`);
  }
});
```

## 📱 Compatibilidad

### ¿Funciona con React Native?

Sí, pero necesitas un adapter personalizado:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const reactNativeAdapter = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

const storage = createDebouncedJSONStorage(reactNativeAdapter, {
  debounceTime: 1000
});
```

### ¿Funciona con Next.js?

Perfectamente compatible. Para SSR:

```typescript
const storage = createDebouncedJSONStorage(
  typeof window !== 'undefined' ? 'localStorage' : 'memoryStorage',
  { debounceTime: 1000 }
);
```

### ¿Funciona con otros frameworks?

Sí, Zustand Debounce es framework-agnostic. Funciona con:
- ✅ React
- ✅ Vue (con pinia-zustand-adapter)
- ✅ Angular
- ✅ Svelte
- ✅ Vanilla JavaScript

## 📝 Mejores Prácticas

### ¿Cómo estructurar múltiples stores?

```typescript
// Separar por dominio
const useUserStore = create(persist(..., {
  name: 'user-data',
  storage: createDebouncedJSONStorage('localStorage', {
    debounceTime: 1000,
    maxRetries: 3 // Datos importantes
  })
}));

const useUIStore = create(persist(..., {
  name: 'ui-preferences', 
  storage: createDebouncedJSONStorage('localStorage', {
    debounceTime: 500 // Respuesta rápida para UX
  })
}));
```

### ¿Cómo manejar datos sensibles?

```typescript
const sensitiveStorage = createDebouncedJSONStorage('sessionStorage', {
  debounceTime: 0, // Sin demora para datos sensibles
  ttl: 30 * 60 * 1000, // Expira en 30 minutos
  serialize: (data) => {
    // Encriptar antes de guardar
    return encrypt(JSON.stringify(data));
  },
  deserialize: (str) => {
    // Desencriptar al leer
    return JSON.parse(decrypt(str));
  }
});
```

---

:::tip ¿No encuentras tu pregunta?
Si tienes una pregunta que no está aquí, por favor:
1. Revisa la [documentación completa](./configuration)
2. Busca en [GitHub Issues](https://github.com/AbianS/zustand-debounce/issues)
3. Abre un nuevo issue si no encuentras la respuesta
:::

## 🤝 Contribuir

¿Encontraste un bug o tienes una idea para mejorar? ¡Las contribuciones son bienvenidas!

1. Fork el repositorio
2. Crea una rama para tu feature
3. Envía un Pull Request

[Ver más en GitHub →](https://github.com/AbianS/zustand-debounce)