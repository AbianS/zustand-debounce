import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'demo-counter',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000,
        onWrite: () =>
          console.log('📝 Change detected - saving in 1 second...'),
        onSave: () => console.log('💾 Saved to localStorage!'),
      }),
    },
  ),
);

export default function SimpleCounter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div
      style={{
        border: '1px solid var(--ifm-border-color)',
        borderRadius: '8px',
        padding: '1rem',
        margin: '1rem 0',
        backgroundColor: 'var(--ifm-card-background-color)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Counter: {count}</h4>
        <small style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Changes are saved after 1 second of inactivity
        </small>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <button
          onClick={increment}
          style={{
            background: 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
          }}
        >
          +1
        </button>
        <button
          onClick={decrement}
          style={{
            background: 'var(--ifm-color-secondary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
          }}
        >
          -1
        </button>
        <button
          onClick={reset}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--ifm-color-emphasis-600)',
          textAlign: 'center',
        }}
      >
        💡 Abre la consola del navegador para ver los logs de debounce
      </div>
    </div>
  );
}
