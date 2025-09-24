import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface TTLDemoState {
  data: string;
  timestamp: number | null;
  setData: (data: string) => void;
}

const useTTLStore = create<TTLDemoState>()(
  persist(
    (set, get) => ({
      data: '',
      timestamp: null,
      setData: (data) => set({ data, timestamp: Date.now() }),
    }),
    {
      name: 'ttl-demo',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 500,
        ttl: 10000, // 10 segundos
        onSave: () => console.log('💾 Saved with 10 seconds TTL'),
      }),
    },
  ),
);

export default function TTLDemo() {
  const { data, timestamp, setData } = useTTLStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!timestamp) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - timestamp;
      const remaining = Math.max(0, 10000 - elapsed);

      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timestamp]);

  const handleClear = () => {
    localStorage.removeItem('ttl-demo');
    setData('');
  };

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
      <h4 style={{ margin: '0 0 1rem 0' }}>Demo: Time-to-Live (TTL)</h4>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Type something that will expire in 10 seconds..."
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--ifm-border-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--ifm-background-surface-color)',
            color: 'var(--ifm-font-color-base)',
          }}
        />
      </div>

      {timeLeft !== null && timeLeft > 0 && (
        <div
          style={{
            padding: '0.5rem',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          ⏰ Data will expire in:{' '}
          <strong>{Math.ceil(timeLeft / 1000)} seconds</strong>
        </div>
      )}

      {timeLeft === 0 && data && (
        <div
          style={{
            padding: '0.5rem',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          ⚠️ Data has expired and will be removed on next load
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--ifm-color-emphasis-600)',
        }}
      >
        <button
          onClick={handleClear}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          Clear
        </button>
        <span>💡 Data is automatically removed after 10 seconds</span>
      </div>
    </div>
  );
}
