export const LANDING_CODE = `
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

// Your store interface
interface PersonState {
  name: string;
  age: number;
  // Other state properties
}

interface Actions {
  setName: (name: string) => void;
  setAge: (age: number) => void;
  // Other actions
}

// Create the store
export const usePersonStore = create<PersonState & Actions>()(
  persist(
    (set) => ({
      // Initial state
      name: '',
      age: 0,
      // Actions
      setName: (name) => set({ name }),
      setAge: (age) => set({ age }),
    }),
    {
      name: 'person-storage',
      storage: createDebouncedJSONStorage(localStorage, {
        debounceTime: 2000, // Debounce time in milliseconds ⏳
        // Other options can be specified here
      }),
    }
  )
);

`;
