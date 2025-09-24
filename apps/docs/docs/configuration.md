---
sidebar_position: 4
---

# Configuración

Guía completa de todas las opciones de configuración disponibles en **Zustand Debounce**.

## Opciones Básicas

### `debounceTime`
- **Tipo**: `number`  
- **Por defecto**: `0`
- **Descripción**: Tiempo en milisegundos a esperar antes de guardar los cambios.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000 // Espera 1 segundo
});
```

### `throttleTime`
- **Tipo**: `number`
- **Por defecto**: `0`  
- **Descripción**: Tiempo mínimo entre operaciones de escritura.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  throttleTime: 5000 // Máximo una escritura cada 5 segundos
});
```

### `immediately`
- **Tipo**: `boolean`
- **Por defecto**: `false`
- **Descripción**: Si es `true`, guarda inmediatamente sin debounce.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  immediately: true // Guarda al instante
});
```

## Opciones de Reintentos

### `maxRetries`
- **Tipo**: `number`
- **Por defecto**: `0`
- **Descripción**: Número máximo de reintentos para operaciones fallidas.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3 // Reintenta hasta 3 veces
});
```

### `retryDelay`
- **Tipo**: `number`
- **Por defecto**: `0`
- **Descripción**: Tiempo base entre reintentos en milisegundos.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3,
  retryDelay: 1000 // Espera 1 segundo entre reintentos
});
```

## Callbacks de Eventos

### `onWrite`
- **Tipo**: `(key: string, value: string) => void`
- **Descripción**: Se ejecuta inmediatamente cuando se llama a `setItem`.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  onWrite: (key, value) => {
    console.log(`📝 Escribiendo ${key}:`, value);
    showStatusIndicator('Guardando...');
  }
});
```

### `onSave`
- **Tipo**: `(key: string, value: string) => void`
- **Descripción**: Se ejecuta cuando los datos se guardan realmente.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  onSave: (key, value) => {
    console.log(`💾 Guardado ${key}:`, value);
    showStatusIndicator('Guardado ✅');
  }
});
```

### `onRetry`
- **Tipo**: `(key: string, attempt: number, error: any, delay: number) => void`
- **Descripción**: Se ejecuta antes de cada reintento.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3,
  retryDelay: 1000,
  onRetry: (key, attempt, error, delay) => {
    console.log(`🔄 Reintento ${attempt} para ${key} en ${delay}ms`);
    showNotification(`Reintentando... (${attempt}/3)`);
  }
});
```

### `onError`
- **Tipo**: `(key: string, error: any) => void`
- **Descripción**: Se ejecuta cuando fallan todos los reintentos.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  maxRetries: 3,
  onError: (key, error) => {
    console.error(`❌ Error final para ${key}:`, error);
    showErrorNotification('No se pudieron guardar los cambios');
  }
});
```

## Serialización Personalizada

### `serialize`
- **Tipo**: `(state: unknown) => string`
- **Por defecto**: `JSON.stringify`
- **Descripción**: Función personalizada para serializar el estado.

### `deserialize`
- **Tipo**: `(str: string) => unknown`
- **Por defecto**: `JSON.parse`
- **Descripción**: Función personalizada para deserializar el estado.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  serialize: (state) => {
    // Serialización personalizada con compresión
    return LZ.compress(JSON.stringify(state));
  },
  deserialize: (str) => {
    // Deserialización personalizada con descompresión
    return JSON.parse(LZ.decompress(str));
  }
});
```

## Time-to-Live (TTL)

### `ttl`
- **Tipo**: `number`
- **Por defecto**: `0` (sin expiración)
- **Descripción**: Tiempo de vida en milisegundos para los datos almacenados.

```typescript
const storage = createDebouncedJSONStorage('localStorage', {
  ttl: 24 * 60 * 60 * 1000 // 24 horas
});
```

:::warning Importante
Cuando se especifica `ttl`, los datos expirados se eliminan automáticamente al intentar leerlos.
:::

## Combinación de Opciones

### Configuración para Aplicación de Chat
```typescript
const chatStorage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 500,    // Respuesta rápida
  maxRetries: 5,        // Crítico no perder mensajes
  retryDelay: 2000,     // Tiempo suficiente para recuperación
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 días
  onWrite: () => showTypingIndicator(),
  onSave: () => hideTypingIndicator(),
  onError: () => showOfflineMode()
});
```

### Configuración para Editor de Texto
```typescript
const editorStorage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 2000,   // No guardar en cada tecla
  throttleTime: 10000,  // Máximo cada 10 segundos
  maxRetries: 3,
  onWrite: () => showStatus('Guardando...'),
  onSave: () => showStatus('Guardado automáticamente'),
  serialize: (state) => {
    // Solo guardar el contenido, no el cursor
    const { content } = state as { content: string };
    return JSON.stringify({ content, savedAt: Date.now() });
  }
});
```

### Configuración para Datos Críticos
```typescript
const criticalStorage = createDebouncedJSONStorage('localStorage', {
  immediately: true,    // Sin demora
  maxRetries: 10,       // Muchos reintentos
  retryDelay: 1000,
  onRetry: (key, attempt) => {
    logToAnalytics(`critical_save_retry_${attempt}`, { key });
  },
  onError: (key, error) => {
    // Enviar a servicio de monitoreo
    sendToSentry(error, { context: 'critical_storage', key });
  }
});
```

## Tabla de Referencia Rápida

| Opción | Tipo | Defecto | Descripción |
|--------|------|---------|-------------|
| `debounceTime` | `number` | `0` | Tiempo de espera antes de guardar |
| `throttleTime` | `number` | `0` | Tiempo mínimo entre escrituras |
| `immediately` | `boolean` | `false` | Guardar sin demora |
| `maxRetries` | `number` | `0` | Máximo número de reintentos |
| `retryDelay` | `number` | `0` | Tiempo entre reintentos |
| `ttl` | `number` | `0` | Tiempo de vida de los datos |
| `onWrite` | `function` | - | Callback al escribir |
| `onSave` | `function` | - | Callback al guardar |
| `onRetry` | `function` | - | Callback en reintentos |
| `onError` | `function` | - | Callback en errores |
| `serialize` | `function` | `JSON.stringify` | Serialización personalizada |
| `deserialize` | `function` | `JSON.parse` | Deserialización personalizada |

---

:::tip Consejos de Rendimiento
- **Debounce bajo (100-500ms)**: Para cambios poco frecuentes
- **Debounce medio (500-2000ms)**: Para cambios frecuentes como formularios
- **Debounce alto (2000-5000ms)**: Para editores de texto o datos no críticos
- **Throttle**: Úsalo cuando quieras un límite máximo de escrituras por tiempo
:::

## Próximos Pasos

- 💡 **[Ver ejemplos prácticos](./examples)** de diferentes configuraciones
- 🔧 **[Crear adaptadores personalizados](./custom-adapters)** para storage externo
- ❓ **[Revisar preguntas frecuentes](./faq)** sobre configuración