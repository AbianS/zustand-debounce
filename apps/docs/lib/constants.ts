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

export const BASIC_FORM_CODE = `
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface FormState {
  name: string;
  surname: string;
}

interface FormActions {
  setName: (name: string) => void;
  setSurname: (surname: string) => void;
}

export const useFormStore = create<FormState & FormActions>()(
  persist(
    (set) => ({
      name: '',
      surname: '',
      setName: (name) => set({ name }),
      setSurname: (surname) => set({ surname }),
    }),
    {
      name: 'form-storage',
      storage: createDebouncedJSONStorage(
        {
          getItem: (key) => localStorage.getItem(key),
          setItem: (key, value) => localStorage.setItem(key, value),
          removeItem: (key) => localStorage.removeItem(key),
        },
        {
          debounceTime: 2000, // Debounce time in milliseconds ⏳
        },
      ),
    },
  ),
);

`;
