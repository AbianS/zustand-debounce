import { useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface EventDemoState {
  message: string;
  setMessage: (message: string) => void;
}

const useEventStore = create<EventDemoState>()(
  persist(
    (set) => ({
      message: '',
      setMessage: (message) => set({ message }),
    }),
    {
      name: 'event-demo',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000,
        onSave: (data) => {
          const event = new CustomEvent('storage-saved', {
            detail: { data, timestamp: new Date().toLocaleTimeString() },
          });
          window.dispatchEvent(event);
        },
      }),
    },
  ),
);

export default function EventDemo() {
  const { message, setMessage } = useEventStore();
  const [events, setEvents] = useState<string[]>([]);

  // Listen to save events
  useState(() => {
    const handleStorageSaved = (e: CustomEvent) => {
      const eventMessage = `💾 Saved at ${e.detail.timestamp}: "${e.detail.data.state.message}"`;
      setEvents((prev) => [eventMessage, ...prev.slice(0, 4)]); // Keep only last 5
    };

    window.addEventListener(
      'storage-saved',
      handleStorageSaved as EventListener,
    );

    return () => {
      window.removeEventListener(
        'storage-saved',
        handleStorageSaved as EventListener,
      );
    };
  });

  const handleClear = () => {
    setEvents([]);
    setMessage('');
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
      <h4 style={{ margin: '0 0 1rem 0' }}>Demo: Storage Events</h4>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message to see events..."
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

      {events.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--ifm-code-background)',
            border: '1px solid var(--ifm-border-color)',
            borderRadius: '4px',
            padding: '0.75rem',
            marginBottom: '1rem',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
            📡 Event History:
          </h5>
          {events.map((event, index) => (
            <div
              key={index}
              style={{
                fontSize: '0.75rem',
                marginBottom: '0.25rem',
                color: 'var(--ifm-color-emphasis-700)',
                fontFamily: 'monospace',
              }}
            >
              {event}
            </div>
          ))}
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
            background: '#6c757d',
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
        <span>
          💡 Events are triggered each time data is saved with 1 second debounce
        </span>
      </div>
    </div>
  );
}
