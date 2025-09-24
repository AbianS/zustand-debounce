import { useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface RetryDemoState {
  message: string;
  setMessage: (message: string) => void;
}

// Simulamos un storage que falla a veces
const createFailingStorage = () => {
  let failCount = 0;
  return {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => {
      failCount++;
      if (failCount % 3 === 0) {
        throw new Error('Simulated network error');
      }
      localStorage.setItem(key, value);
    },
    removeItem: (key: string) => localStorage.removeItem(key),
  };
};

const useRetryStore = create<RetryDemoState>()(
  persist(
    (set) => ({
      message: '',
      setMessage: (message) => set({ message }),
    }),
    {
      name: 'retry-demo',
      storage: createDebouncedJSONStorage(createFailingStorage(), {
        debounceTime: 500,
        maxRetries: 3,
        retryDelay: 1000,
        onWrite: () => console.log('📝 Attempting to save...'),
        onSave: () => console.log('✅ Successfully saved!'),
        onRetry: (key, attempt, error) =>
          console.log(`🔄 Retry ${attempt}/3 - Error: ${error.message}`),
        onError: (key, error) =>
          console.error('❌ Final error after all retries:', error.message),
      }),
    },
  ),
);

export default function RetryDemo() {
  const { message, setMessage } = useRetryStore();
  const [logs, setLogs] = useState<string[]>([]);

  // Interceptar console.log para mostrar en el componente
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => {
    setLogs((prev) => [...prev.slice(-2), args.join(' ')]);
    originalLog(...args);
  };

  console.error = (...args) => {
    setLogs((prev) => [...prev.slice(-2), `❌ ${args.join(' ')}`]);
    originalError(...args);
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
      <h4 style={{ margin: '0 0 1rem 0' }}>Demo: Retry System</h4>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type something to test retries..."
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

      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--ifm-color-emphasis-600)',
          marginBottom: '1rem',
        }}
      >
        💡 This storage fails every 3 attempts to demonstrate retries
      </div>

      {logs.length > 0 && (
        <div
          style={{
            backgroundColor: '#1e1e1e',
            color: '#fff',
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            maxHeight: '100px',
            overflow: 'auto',
          }}
        >
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}
