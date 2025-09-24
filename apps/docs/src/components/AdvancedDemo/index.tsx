import React, { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';
import styles from './styles.module.css';

// Store con características avanzadas
interface AdvancedDemoState {
  tasks: Array<{
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
  }>;
  settings: {
    theme: 'light' | 'dark';
    autoSave: boolean;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
  };
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateSettings: (settings: Partial<AdvancedDemoState['settings']>) => void;
  clearAllTasks: () => void;
}

const useAdvancedDemoStore = create<AdvancedDemoState>()(
  persist(
    (set, get) => ({
      tasks: [],
      settings: {
        theme: 'light',
        autoSave: true,
      },
      stats: {
        totalTasks: 0,
        completedTasks: 0,
      },
      addTask: (text: string) => {
        const newTask = {
          id: Date.now().toString(),
          text,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        const tasks = [...get().tasks, newTask];
        set({
          tasks,
          stats: {
            totalTasks: tasks.length,
            completedTasks: tasks.filter((t) => t.completed).length,
          },
        });
      },
      toggleTask: (id: string) => {
        const tasks = get().tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        );
        set({
          tasks,
          stats: {
            totalTasks: tasks.length,
            completedTasks: tasks.filter((t) => t.completed).length,
          },
        });
      },
      removeTask: (id: string) => {
        const tasks = get().tasks.filter((task) => task.id !== id);
        set({
          tasks,
          stats: {
            totalTasks: tasks.length,
            completedTasks: tasks.filter((t) => t.completed).length,
          },
        });
      },
      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } });
      },
      clearAllTasks: () => {
        set({
          tasks: [],
          stats: { totalTasks: 0, completedTasks: 0 },
        });
      },
    }),
    {
      name: 'advanced-demo-storage',
      storage: createDebouncedJSONStorage('localStorage', {
        debounceTime: 800,
        maxRetries: 3,
        retryDelay: 1000,
        ttl: 24 * 60 * 60 * 1000, // 24 horas
        onWrite: (key, value) => {
          console.log('💾 Intentando guardar:', key);
        },
        onSave: (key, value) => {
          console.log('✅ Guardado exitoso:', key);
        },
        onRetry: (key, attempt, error, delay) => {
          console.log(`🔄 Reintento ${attempt} para ${key} en ${delay}ms`);
        },
        onError: (key, error) => {
          console.error('❌ Error al guardar:', key, error);
        },
      }),
    },
  ),
);

export default function AdvancedDemo() {
  const {
    tasks,
    settings,
    stats,
    addTask,
    toggleTask,
    removeTask,
    updateSettings,
    clearAllTasks,
  } = useAdvancedDemoStore();

  const [newTaskText, setNewTaskText] = useState('');
  const [operationCount, setOperationCount] = useState(0);
  const [lastSaveTime, setLastSaveTime] = useState<string>('Nunca');

  // Monitorear saves
  useEffect(() => {
    const originalSetItem = localStorage.setItem;

    localStorage.setItem = function (key, value) {
      if (key === 'advanced-demo-storage') {
        setLastSaveTime(new Date().toLocaleTimeString());
      }
      return originalSetItem.call(this, key, value);
    };

    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(newTaskText.trim());
      setNewTaskText('');
      setOperationCount((prev) => prev + 1);
    }
  };

  const handleToggleTask = (id: string) => {
    toggleTask(id);
    setOperationCount((prev) => prev + 1);
  };

  const handleRemoveTask = (id: string) => {
    removeTask(id);
    setOperationCount((prev) => prev + 1);
  };

  const handleClearAll = () => {
    clearAllTasks();
    setOperationCount((prev) => prev + 1);
  };

  return (
    <div className={styles.advancedContainer}>
      <div className={styles.header}>
        <h2>🚀 Demo Avanzado - Lista de Tareas</h2>
        <p>
          Esta demo muestra características avanzadas como TTL (24h), reintentos
          automáticos, y manejo de errores. Todas las operaciones usan debounce
          de 800ms.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          {/* Formulario para agregar tareas */}
          <form onSubmit={handleAddTask} className={styles.addTaskForm}>
            <input
              type="text"
              className={styles.taskInput}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Agregar nueva tarea..."
            />
            <button type="submit" className={styles.addButton}>
              ➕ Agregar
            </button>
          </form>

          {/* Lista de tareas */}
          <div className={styles.tasksList}>
            {tasks.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📋</span>
                <p>No hay tareas. ¡Agrega una para comenzar!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className={styles.taskCheckbox}
                  />
                  <span className={styles.taskText}>{task.text}</span>
                  <span className={styles.taskDate}>
                    {new Date(task.createdAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className={styles.removeButton}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {tasks.length > 0 && (
            <button onClick={handleClearAll} className={styles.clearButton}>
              🗑️ Limpiar todas las tareas
            </button>
          )}
        </div>

        <div className={styles.rightPanel}>
          {/* Estadísticas */}
          <div className={styles.statsCard}>
            <h3>📊 Estadísticas</h3>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total de tareas:</span>
              <span className={styles.statValue}>{stats.totalTasks}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Completadas:</span>
              <span className={styles.statValue}>{stats.completedTasks}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Pendientes:</span>
              <span className={styles.statValue}>
                {stats.totalTasks - stats.completedTasks}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Progreso:</span>
              <span className={styles.statValue}>
                {stats.totalTasks > 0
                  ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>

          {/* Información del storage */}
          <div className={styles.storageInfo}>
            <h3>💾 Info del Storage</h3>
            <div className={styles.infoItem}>
              <strong>Último guardado:</strong> {lastSaveTime}
            </div>
            <div className={styles.infoItem}>
              <strong>Operaciones:</strong> {operationCount}
            </div>
            <div className={styles.infoItem}>
              <strong>Debounce time:</strong> 800ms
            </div>
            <div className={styles.infoItem}>
              <strong>Max reintentos:</strong> 3
            </div>
            <div className={styles.infoItem}>
              <strong>TTL:</strong> 24 horas
            </div>
          </div>

          {/* Configuraciones */}
          <div className={styles.settingsCard}>
            <h3>⚙️ Configuraciones</h3>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSettings({ autoSave: e.target.checked })}
              />
              Auto-guardado activado
            </label>
            <div className={styles.themeSelector}>
              <span>Tema:</span>
              <select
                value={settings.theme}
                onChange={(e) =>
                  updateSettings({ theme: e.target.value as 'light' | 'dark' })
                }
                className={styles.themeSelect}
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
