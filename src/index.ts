import { createJSONStorage, type StateStorage } from "zustand/middleware"

type JsonStorageOptions = {
  reviver?: (key: string, value: unknown) => unknown
  replacer?: (key: string, value: unknown) => unknown
}

// Extend the JsonStorageOptions with a debounceTime property
interface DebouncedJsonStorageOptions extends JsonStorageOptions {
  debounceTime: number
}

// Function to create a debounced JSON storage
export function createDebouncedJSONStorage(
  storageApi: StateStorage,
  options: DebouncedJsonStorageOptions,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let pendingValue: string | null = null

  // Function to set an item with debouncing
  async function debouncedSetItem(name: string, value: string): Promise<void> {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    pendingValue = value

    // Set a timeout to set the item after the debounce time has passed
    timeoutId = setTimeout(async () => {
      if (pendingValue !== null) {
        await storageApi.setItem(name, pendingValue)
        pendingValue = null
      }
    }, options.debounceTime)
  }

  // Create a new storage API with the debounced setItem function
  const debouncedStorageApi: StateStorage = {
    ...storageApi,
    setItem: debouncedSetItem,
  }

  const { debounceTime, ...restOptions } = options

  // Create and return a JSON storage with the debounced storage API and the rest of the options
  return createJSONStorage(() => debouncedStorageApi, restOptions)
}
