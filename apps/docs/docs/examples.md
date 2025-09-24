---
sidebar_position: 5
---

# Ejemplos Prácticos

Ejemplos del mundo real para diferentes casos de uso con **Zustand Debounce**.

## 📝 Editor de Texto

Perfecto para editores donde quieres guardar el trabajo sin interrumpir al usuario.

```typescript title="text-editor-store.ts"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface EditorState {
  content: string;
  title: string;
  lastSaved: Date | null;
  isDirty: boolean;
  
  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  markSaved: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      content: '',
      title: 'Documento sin título',
      lastSaved: null,
      isDirty: false,
      
      setContent: (content) => set({ content, isDirty: true }),
      setTitle: (title) => set({ title, isDirty: true }),
      markSaved: () => set({ lastSaved: new Date(), isDirty: false }),
    }),
    {
      name: 'editor-document',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 2000, // 2 segundos después de parar de escribir
        onWrite: () => {
          console.log('💾 Guardando borrador...');
        },
        onSave: () => {
          // Actualizar timestamp de guardado
          useEditorStore.getState().markSaved();
          console.log('✅ Documento guardado');
        },
      }),
    }
  )
);
```

```tsx title="TextEditor.tsx"
import React from 'react';
import { useEditorStore } from './text-editor-store';

export function TextEditor() {
  const { content, title, lastSaved, isDirty, setContent, setTitle } = useEditorStore();

  return (
    <div className="editor">
      <header>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
        <div className="save-status">
          {isDirty ? (
            <span className="saving">💾 Guardando...</span>
          ) : (
            <span className="saved">
              ✅ Guardado {lastSaved ? lastSaved.toLocaleTimeString() : ''}
            </span>
          )}
        </div>
      </header>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Empieza a escribir..."
        className="content-editor"
      />
    </div>
  );
}
```

## 🛒 Carrito de Compras

Mantén el carrito sincronizado sin perder elementos por clics rápidos.

```typescript title="shopping-cart-store.ts"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(item => item.id === newItem.id);
        const updatedItems = existingItem
          ? state.items.map(item =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...state.items, { ...newItem, quantity: 1 }];
        
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { items: updatedItems, total };
      }),
      
      removeItem: (id) => set((state) => {
        const updatedItems = state.items.filter(item => item.id !== id);
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { items: updatedItems, total };
      }),
      
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return get().removeItem(id);
        }
        
        const updatedItems = state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { items: updatedItems, total };
      }),
      
      clearCart: () => set({ items: [], total: 0 }),
      calculateTotal: () => set((state) => ({
        total: state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      })),
    }),
    {
      name: 'shopping-cart',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 500, // Respuesta rápida para UX
        onSave: (key, value) => {
          // Opcional: sincronizar con servidor
          syncCartWithServer(JSON.parse(value));
        },
      }),
    }
  )
);

// Función auxiliar para sincronizar con servidor
async function syncCartWithServer(cartData: any) {
  try {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cartData),
    });
  } catch (error) {
    console.warn('No se pudo sincronizar el carrito con el servidor');
  }
}
```

## 👤 Perfil de Usuario

Guarda cambios del perfil con reintentos para datos importantes.

```typescript title="user-profile-store.ts"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
}

interface UserState extends UserProfile {
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      email: '',
      avatar: '',
      preferences: {
        theme: 'light',
        language: 'es',
        notifications: true,
      },
      
      updateProfile: (updates) => set((state) => ({
        ...state,
        ...updates,
      })),
      
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs },
      })),
    }),
    {
      name: 'user-profile',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000,
        maxRetries: 3,
        retryDelay: 2000,
        
        onWrite: () => {
          showNotification('Guardando perfil...', 'info');
        },
        
        onSave: async (key, value) => {
          showNotification('Perfil guardado', 'success');
          
          // Sincronizar con API
          try {
            await updateUserProfileAPI(JSON.parse(value));
          } catch (error) {
            console.warn('No se pudo sincronizar con el servidor');
          }
        },
        
        onRetry: (key, attempt, error, delay) => {
          showNotification(
            `Reintentando guardar perfil... (${attempt}/3)`,
            'warning'
          );
        },
        
        onError: () => {
          showNotification(
            'Error al guardar el perfil. Inténtalo más tarde.',
            'error'
          );
        },
      }),
    }
  )
);

// Funciones auxiliares
async function updateUserProfileAPI(profile: UserProfile) {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar perfil');
  }
}

function showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error') {
  // Implementar tu sistema de notificaciones favorito
  console.log(`[${type.toUpperCase()}] ${message}`);
}
```

## 🎮 Estado de Juego

Para juegos donde quieres guardar progreso sin afectar el rendimiento.

```typescript title="game-state-store.ts"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface GameState {
  level: number;
  score: number;
  lives: number;
  inventory: string[];
  achievements: string[];
  settings: {
    soundEnabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  
  // Actions
  incrementScore: (points: number) => void;
  loseLife: () => void;
  nextLevel: () => void;
  addToInventory: (item: string) => void;
  unlockAchievement: (achievement: string) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      level: 1,
      score: 0,
      lives: 3,
      inventory: [],
      achievements: [],
      settings: {
        soundEnabled: true,
        difficulty: 'medium',
      },
      
      incrementScore: (points) => set((state) => ({
        score: state.score + points,
      })),
      
      loseLife: () => set((state) => ({
        lives: Math.max(0, state.lives - 1),
      })),
      
      nextLevel: () => set((state) => ({
        level: state.level + 1,
        lives: Math.min(5, state.lives + 1), // Vida extra por nivel
      })),
      
      addToInventory: (item) => set((state) => ({
        inventory: [...state.inventory, item],
      })),
      
      unlockAchievement: (achievement) => set((state) => {
        if (!state.achievements.includes(achievement)) {
          return {
            achievements: [...state.achievements, achievement],
          };
        }
        return state;
      }),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
    }),
    {
      name: 'game-save',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 3000, // 3 segundos para no interrumpir el juego
        maxRetries: 5, // Importante no perder el progreso
        retryDelay: 1000,
        
        onSave: () => {
          console.log('🎮 Juego guardado automáticamente');
        },
        
        onError: () => {
          // Mostrar aviso al jugador
          showGameMessage('⚠️ No se pudo guardar el progreso');
        },
        
        // Serialización personalizada para comprimir el save
        serialize: (state) => {
          // Solo guardar datos importantes, no funciones
          const saveData = {
            level: state.level,
            score: state.score,
            lives: state.lives,
            inventory: state.inventory,
            achievements: state.achievements,
            settings: state.settings,
            timestamp: Date.now(),
          };
          return JSON.stringify(saveData);
        },
      }),
    }
  )
);

function showGameMessage(message: string) {
  // Mostrar mensaje en el UI del juego
  console.log(message);
}
```

## 📊 Dashboard con Métricas

Para dashboards que se actualizan frecuentemente.

```typescript title="dashboard-store.ts"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface DashboardState {
  filters: {
    dateRange: [Date, Date];
    category: string[];
    status: string;
  };
  layout: {
    widgets: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      size: { w: number; h: number };
    }>;
  };
  preferences: {
    autoRefresh: boolean;
    refreshInterval: number;
    theme: string;
  };
  
  updateFilters: (filters: Partial<DashboardState['filters']>) => void;
  updateLayout: (layout: DashboardState['layout']) => void;
  updatePreferences: (prefs: Partial<DashboardState['preferences']>) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      filters: {
        dateRange: [new Date(), new Date()],
        category: [],
        status: 'all',
      },
      layout: {
        widgets: [],
      },
      preferences: {
        autoRefresh: true,
        refreshInterval: 30000,
        theme: 'light',
      },
      
      updateFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters },
      })),
      
      updateLayout: (layout) => set({ layout }),
      
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs },
      })),
    }),
    {
      name: 'dashboard-config',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1500, // Balance entre responsividad y rendimiento
        throttleTime: 5000, // No más de una actualización cada 5 segundos
        
        onSave: () => {
          console.log('📊 Configuración del dashboard guardada');
        },
        
        // TTL de 30 días para la configuración
        ttl: 30 * 24 * 60 * 60 * 1000,
      }),
    }
  )
);
```

---

:::tip Consejos para estos ejemplos

1. **Editor de texto**: `debounceTime` alto (2000ms) para no interrumpir la escritura
2. **Carrito**: `debounceTime` bajo (500ms) para respuesta rápida del usuario
3. **Perfil**: Reintentos habilitados porque los datos son importantes
4. **Juego**: `debounceTime` alto (3000ms) para no afectar el rendimiento
5. **Dashboard**: Combinación de debounce y throttle para balance perfecto

:::

## Próximos Pasos

- 🔧 **[Crear adaptadores personalizados](./custom-adapters)** para bases de datos
- ⚡ **[Optimización de rendimiento](./performance)** para casos específicos
- ❓ **[Preguntas frecuentes](./faq)** sobre implementación