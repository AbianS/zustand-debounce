import { createJSONStorage, type StateStorage } from "zustand/middleware"

type JsonStorageOptions = {
  reviver?: (key: string, value: unknown) => unknown
  replacer?: (key: string, value: unknown) => unknown
}

// Extend the JsonStorageOptions with a debounceTime property
interface DebouncedJsonStorageOptions extends JsonStorageOptions {
  /**
   * @property debounceTime - The time to wait before setting the item
   */
  debounceTime: number
  /**
   * @property immediately - Whether to set the item immediately
   * @default false
   */
  immediately?: boolean
}

export function createDebouncedJSONStorage(
  storageApi: StateStorage,
  options: DebouncedJsonStorageOptions,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let pendingValue: string | null = null

  const { debounceTime, immediately = false, ...restOptions } = options

  async function debouncedSetItem(name: string, value: string): Promise<void> {
    if (immediately) {
      await storageApi.setItem(name, value)
      return
    }

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    pendingValue = value

    timeoutId = setTimeout(async () => {
      if (pendingValue !== null) {
        await storageApi.setItem(name, pendingValue)
        pendingValue = null
      }
    }, debounceTime)
  }

  const debouncedStorageApi: StateStorage = {
    ...storageApi,
    setItem: debouncedSetItem,
  }

  return createJSONStorage(() => debouncedStorageApi, restOptions)
}
