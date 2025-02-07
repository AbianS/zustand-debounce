import { StateStorage } from 'zustand/middleware';

export type AdapterIdentifier =
  | StateStorage
  | 'localStorage'
  | 'sessionStorage'
  | 'memoryStorage';

function createMemoryStorage(): StateStorage {
  const store: Record<string, string> = {};
  return {
    getItem: async (key: string) => store[key] || null,
    setItem: async (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: async (key: string) => {
      delete store[key];
    },
  };
}

export function getStorageAdapter(identifier: AdapterIdentifier): StateStorage {
  if (
    typeof identifier === 'object' &&
    identifier !== null &&
    typeof identifier.getItem === 'function'
  ) {
    return identifier;
  }
  if (identifier === 'localStorage') {
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        getItem: async (key: string) => window.localStorage.getItem(key),
        setItem: async (key: string, value: string) =>
          window.localStorage.setItem(key, value),
        removeItem: async (key: string) => window.localStorage.removeItem(key),
      };
    }
    throw new Error('localStorage no está disponible.');
  }
  if (identifier === 'sessionStorage') {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return {
        getItem: async (key: string) => window.sessionStorage.getItem(key),
        setItem: async (key: string, value: string) =>
          window.sessionStorage.setItem(key, value),
        removeItem: async (key: string) =>
          window.sessionStorage.removeItem(key),
      };
    }
    throw new Error('sessionStorage no está disponible.');
  }
  if (identifier === 'memoryStorage') {
    return createMemoryStorage();
  }
  throw new Error(`Adaptador de almacenamiento no soportado: ${identifier}`);
}
