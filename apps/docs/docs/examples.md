---
sidebar_position: 5
---

# Practical Examples

Real-world examples for different use cases with **Zustand Debounce**.

## 📝 Text Editor

Perfect for editors where you want to save work without interrupting the user.

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
      title: 'Untitled Document',
      lastSaved: null,
      isDirty: false,
      
      setContent: (content) => set({ content, isDirty: true }),
      setTitle: (title) => set({ title, isDirty: true }),
      markSaved: () => set({ lastSaved: new Date(), isDirty: false }),
    }),
    {
      name: 'editor-document',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 2000, // 2 seconds after stopping typing
        onWrite: () => {
          console.log('💾 Saving draft...');
        },
        onSave: () => {
          // Update save timestamp
          useEditorStore.getState().markSaved();
          console.log('✅ Document saved');
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
            <span className="saving">💾 Saving...</span>
          ) : (
            <span className="saved">
              ✅ Saved {lastSaved ? lastSaved.toLocaleTimeString() : ''}
            </span>
          )}
        </div>
      </header>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        className="content-editor"
      />
    </div>
  );
}
```

## 🛒 Shopping Cart

Keep the cart synchronized without losing items due to rapid clicks.

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
        debounceTime: 500, // Fast response for UX
        onSave: (key, value) => {
          // Optional: sync with server
          syncCartWithServer(JSON.parse(value));
        },
      }),
    }
  )
);

// Helper function to sync with server
async function syncCartWithServer(cartData: any) {
  try {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cartData),
    });
  } catch (error) {
    console.warn('Could not sync cart with server');
  }
}
```

## 👤 User Profile

Save profile changes with retries for important data.

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
        language: 'en',
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
          showNotification('Saving profile...', 'info');
        },
        
        onSave: async (key, value) => {
          showNotification('Profile saved', 'success');
          
          // Sync with API
          try {
            await updateUserProfileAPI(JSON.parse(value));
          } catch (error) {
            console.warn('Could not sync with server');
          }
        },
        
        onRetry: (key, attempt, error, delay) => {
          showNotification(
            `Retrying profile save... (${attempt}/3)`,
            'warning'
          );
        },
        
        onError: () => {
          showNotification(
            'Error saving profile. Try again later.',
            'error'
          );
        },
      }),
    }
  )
);

// Helper functions
async function updateUserProfileAPI(profile: UserProfile) {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  
  if (!response.ok) {
    throw new Error('Error updating profile');
  }
}

function showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error') {
  // Implement your favorite notification system
  console.log(`[${type.toUpperCase()}] ${message}`);
}
```

## 🎮 Game State

For games where you want to save progress without affecting performance.

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
        lives: Math.min(5, state.lives + 1), // Extra life per level
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
        debounceTime: 3000, // 3 seconds to not interrupt the game
        maxRetries: 5, // Important not to lose progress
        retryDelay: 1000,
        
        onSave: () => {
          console.log('🎮 Game saved automatically');
        },
        
        onError: () => {
          // Show warning to player
          showGameMessage('⚠️ Could not save progress');
        },
        
        // Custom serialization to compress the save
        serialize: (state) => {
          // Only save important data, not functions
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
  // Show message in game UI
  console.log(message);
}
```

## 📊 Dashboard with Metrics

For dashboards that update frequently.

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
        debounceTime: 1500, // Balance between responsiveness and performance
        throttleTime: 5000, // No more than one update every 5 seconds
        
        onSave: () => {
          console.log('📊 Dashboard configuration saved');
        },
        
        // 30-day TTL for configuration
        ttl: 30 * 24 * 60 * 60 * 1000,
      }),
    }
  )
);
```

---

:::tip Tips for these examples

1. **Text editor**: High `debounceTime` (2000ms) to not interrupt typing
2. **Cart**: Low `debounceTime` (500ms) for quick user response
3. **Profile**: Retries enabled because data is important
4. **Game**: High `debounceTime` (3000ms) to not affect performance
5. **Dashboard**: Combination of debounce and throttle for perfect balance

:::

## Next Steps

- 🔧 **[Create custom adapters](./custom-adapters)** for databases
- ⚡ **[Performance optimization](./performance)** for specific cases
- ❓ **[Frequently asked questions](./faq)** about implementation