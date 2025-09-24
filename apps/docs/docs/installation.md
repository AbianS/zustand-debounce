---
sidebar_position: 2
---

# Instalación

Aprende cómo instalar y configurar **Zustand Debounce** en tu proyecto.

## Requisitos Previos

Antes de instalar Zustand Debounce, asegúrate de tener:

- **Node.js** versión 16.0 o superior
- **Zustand** versión 4.0.0 o superior instalado en tu proyecto

:::info Nota sobre Zustand
Zustand Debounce es una extensión para Zustand, por lo que necesitas tener Zustand instalado como dependencia en tu proyecto.
:::

## Instalación con NPM

```bash
npm install zustand-debounce
```

## Instalación con Yarn

```bash
yarn add zustand-debounce
```

## Instalación with PNPM

```bash
pnpm add zustand-debounce
```

## Verificar la Instalación

Después de la instalación, puedes verificar que todo funcione correctamente creando un pequeño ejemplo:

```typescript
import { createDebouncedJSONStorage } from 'zustand-debounce';

// Si no hay errores, la instalación fue exitosa
const storage = createDebouncedJSONStorage('localStorage', {
  debounceTime: 1000
});

console.log('✅ Zustand Debounce instalado correctamente!');
```

## Instalación de Zustand (Si aún no lo tienes)

Si aún no tienes Zustand instalado en tu proyecto:

```bash
# Con npm
npm install zustand

# Con yarn
yarn add zustand

# Con pnpm
pnpm add zustand
```

## Configuración TypeScript

Si estás usando TypeScript, no necesitas instalar tipos adicionales ya que **Zustand Debounce incluye sus propios tipos TypeScript**.

### Configuración `tsconfig.json` Recomendada

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
- **🚀 Zero dependencies**: No dependencias externas adicionales
- **🌳 Tree-shakable**: Solo importa lo que necesitas

## Compatibilidad

| Herramienta | Versión Mínima | ✅ Compatible |
|-------------|----------------|---------------|
| Node.js     | 16.0+          | ✅            |
| Zustand     | 4.0.0+         | ✅            |

## Siguiente Paso

¡Excelente! Ahora que tienes Zustand Debounce instalado, continúa con la [**Guía de Inicio Rápido**](./quick-start) para aprender cómo usar la librería.

---

:::tip ¿Problemas con la instalación?
Si encuentras algún problema durante la instalación, revisa:
- Que tengas la versión correcta de Node.js
- Que Zustand esté instalado en tu proyecto
- Los logs de error completos para diagnosticar el problema

También puedes abrir un [issue en GitHub](https://github.com/AbianS/zustand-debounce/issues) si necesitas ayuda.
:::