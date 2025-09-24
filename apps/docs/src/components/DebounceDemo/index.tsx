import React, { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import styles from './styles.module.css';

// Store para demostrar el debounce
interface DemoState {
  message: string;
  counter: number;
  lastSaved: string;
  setMessage: (message: string) => void;
  incrementCounter: () => void;
  reset: () => void;
}

const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      message: '',
      counter: 0,
      lastSaved: 'Nunca',
      setMessage: (message: string) => set({ message }),
      incrementCounter: () => set({ counter: get().counter + 1 }),
      reset: () => set({ message: '', counter: 0, lastSaved: 'Nunca' }),
    }),
    {
      name: 'demo-storage',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 1000, // 1 segundo de debounce
        onSave: () => {
          // Actualizamos el timestamp cuando se guarda
          useDemoStore.setState({ lastSaved: new Date().toLocaleTimeString() });
        },
      }),
    },
  ),
);

export default function DebounceDemo() {
  const { message, counter, lastSaved, setMessage, incrementCounter, reset } =
    useDemoStore();
  const [writeAttempts, setWriteAttempts] = useState(0);
  const [actualWrites, setActualWrites] = useState(0);

  // Simular el conteo de intentos de escritura
  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    let writes = 0;

    localStorage.setItem = function (key, value) {
      if (key === 'demo-storage') {
        writes++;
        setActualWrites(writes);
      }
      return originalSetItem.call(this, key, value);
    };

    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setWriteAttempts((prev) => prev + 1);
  };

  const handleCounterClick = () => {
    incrementCounter();
    setWriteAttempts((prev) => prev + 1);
  };

  return (
    <div className={styles.demoContainer}>
      <div className={styles.demoHeader}>
        <h3>🎮 Demo Interactivo</h3>
        <p>
          Experimenta el debounce en tiempo real. Los cambios se guardan
          automáticamente después de 1 segundo.
        </p>
      </div>

      <div className={styles.demoContent}>
        <div className={styles.inputSection}>
          <label className={styles.label} htmlFor="demo-input">
            Escribe algo (se guarda con debounce):
          </label>
          <input
            id="demo-input"
            type="text"
            className={styles.input}
            value={message}
            onChange={handleMessageChange}
            placeholder="Escribe aquí para ver el debounce..."
          />

          <div className={styles.counterSection}>
            <button className={styles.button} onClick={handleCounterClick}>
              Incrementar Contador: {counter}
            </button>
          </div>

          <button className={styles.resetButton} onClick={reset}>
            🗑️ Resetear Demo
          </button>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{writeAttempts}</div>
            <div className={styles.statLabel}>Cambios realizados</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber}>{actualWrites}</div>
            <div className={styles.statLabel}>Escrituras reales</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {writeAttempts > 0
                ? Math.round(
                    ((writeAttempts - actualWrites) / writeAttempts) * 100,
                  )
                : 0}
              %
            </div>
            <div className={styles.statLabel}>Operaciones ahorradas</div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoItem}>
            <strong>Último guardado:</strong> {lastSaved}
          </div>
          <div className={styles.infoItem}>
            <strong>Debounce time:</strong> 1000ms
          </div>
          <div className={styles.infoItem}>
            <strong>Storage:</strong> localStorage
          </div>
        </div>
      </div>
    </div>
  );
}
