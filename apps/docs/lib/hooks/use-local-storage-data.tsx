import { useState, useEffect } from 'react';

function useFormattedLocalStorageJSON(key: string): string {
  const getFormattedValue = (): string => {
    const stored = localStorage.getItem(key);
    if (!stored) return '{}';
    try {
      const parsed = JSON.parse(stored);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Si no es un JSON válido, lo convertimos a un JSON string
      // Ej: "algun valor" -> "\"algun valor\""
      return JSON.stringify(stored, null, 2);
    }
  };

  const [formattedValue, setFormattedValue] =
    useState<string>(getFormattedValue);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        setFormattedValue(getFormattedValue());
      }
    };

    // Detecta cambios en otras pestañas
    window.addEventListener('storage', handleStorage);

    // Polling para detectar cambios en la misma pestaña
    const intervalId = setInterval(() => {
      const currentValue = getFormattedValue();
      if (currentValue !== formattedValue) {
        setFormattedValue(currentValue);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(intervalId);
    };
  }, [key, formattedValue]);

  return formattedValue;
}

export default useFormattedLocalStorageJSON;
