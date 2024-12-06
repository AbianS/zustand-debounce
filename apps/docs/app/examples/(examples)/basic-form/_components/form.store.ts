'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDebouncedJSONStorage } from 'zustand-debounce';

interface FormState {
  name: string;
  surname: string;
  email: string;
}

interface FormActions {
  setName: (name: string) => void;
  setSurname: (surname: string) => void;
  setEmail: (email: string) => void;
}

export const useFormStore = create<FormState & FormActions>()(
  persist(
    (set) => ({
      name: '',
      surname: '',
      email: '',
      setName: (name) => set({ name }),
      setSurname: (surname) => set({ surname }),
      setEmail: (email) => set({ email }),
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
          debounceTime: 600, // Debounce time in milliseconds ⏳
        },
      ),
    },
  ),
);
