---
sidebar_position: 8
---

# Referencia de API

Documentación completa de la API de **Zustand Debounce**.

## `createDebouncedJSONStorage`

Función principal para crear un storage con debounce.

```typescript
function createDebouncedJSONStorage(
  storageApi: AdapterIdentifier,
  options?: EnhancedJsonStorageOptions
): PersistStorage<unknown>
```

### Parámetros

#### `storageApi`
- **Tipo**: `AdapterIdentifier`
- **Valores**: `'localStorage' | 'sessionStorage' | 'memoryStorage' | StateStorage`

#### `options`
- **Tipo**: `EnhancedJsonStorageOptions`
- **Opcional**: Sí

### Opciones Disponibles

| Opción | Tipo | Defecto | Descripción |
|--------|------|---------|-------------|
| `debounceTime` | `number` | `0` | Tiempo de espera en ms |
| `throttleTime` | `number` | `0` | Tiempo mínimo entre escrituras |
| `immediately` | `boolean` | `false` | Guardar inmediatamente |
| `maxRetries` | `number` | `0` | Número máximo de reintentos |
| `retryDelay` | `number` | `0` | Tiempo entre reintentos |
| `ttl` | `number` | `0` | Tiempo de vida de los datos |
| `onWrite` | `function` | - | Callback al escribir |
| `onSave` | `function` | - | Callback al guardar |
| `onRetry` | `function` | - | Callback en reintentos |
| `onError` | `function` | - | Callback en errores |
| `serialize` | `function` | `JSON.stringify` | Función de serialización |
| `deserialize` | `function` | `JSON.parse` | Función de deserialización |

### Ejemplo de Uso

```typescript
import { createDebouncedJSONStorage } from 'zustand-debounce';

const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000,
  maxRetries: 3,
  onSave: (key, value) => console.log('Guardado:', key)
});
```

## Tipos TypeScript

### `EnhancedJsonStorageOptions`

```typescript
interface EnhancedJsonStorageOptions {
  debounceTime?: number;
  throttleTime?: number;
  immediately?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  ttl?: number;
  onWrite?: (key: string, value: string) => void;
  onSave?: (key: string, value: string) => void;
  onRetry?: (key: string, attempt: number, error: any, delay: number) => void;
  onError?: (key: string, error: any) => void;
  serialize?: (state: unknown) => string;
  deserialize?: (str: string) => unknown;
}
```

### `AdapterIdentifier`

```typescript
type AdapterIdentifier = 
  | StateStorage
  | 'localStorage'
  | 'sessionStorage'
  | 'memoryStorage';
```