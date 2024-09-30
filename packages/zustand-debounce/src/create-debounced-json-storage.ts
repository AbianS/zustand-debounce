import { createJSONStorage, StateStorage } from "zustand/middleware"
import { EnhancedJsonStorageOptions, IStorage } from "./types"
import { BaseStorage } from "./core/base-storage"
import { SerializationDecorator } from "./core/decorators/serialization.decorator"
import { TTLDecorator } from "./core/decorators/ttl.decorator"
import { RetryDecorator } from "./core/decorators/retry.decorator"
import { ThrottleDecorator } from "./core/decorators/throttle.decorator"
import { EventDecorator } from "./core/decorators/event.decorator"

export function createDebouncedJSONStorage(
  storageApi: StateStorage,
  options: EnhancedJsonStorageOptions = {},
) {
  let storage: IStorage = new BaseStorage(storageApi)

  const {
    debounceTime,
    throttleTime,
    immediately,
    maxRetries,
    retryDelay,
    onWrite,
    serialize,
    deserialize,
    ttl,
    ...restOptions
  } = options

  // Aplicamos los decoradores según las opciones proporcionadas

  if (serialize && deserialize) {
    storage = new SerializationDecorator(storage, { serialize, deserialize })
  }

  if (typeof ttl === "number") {
    storage = new TTLDecorator(storage, { ttl })
  }

  if (maxRetries || retryDelay) {
    storage = new RetryDecorator(storage, { maxRetries, retryDelay })
  }

  if (debounceTime || throttleTime || immediately !== undefined) {
    storage = new ThrottleDecorator(storage, {
      debounceTime,
      throttleTime,
      immediately,
    })
  }

  if (onWrite) {
    const eventStorage = new EventDecorator(storage)
    eventStorage.on("set", onWrite)
    storage = eventStorage
  }

  // Convertimos nuestro IStorage a StateStorage para usar con Zustand
  const zustandStorage: StateStorage = {
    getItem: async (name: string) => {
      const value = await storage.getItem(name)
      return value
    },
    setItem: async (name: string, value: string) => {
      await storage.setItem(name, value)
    },
    removeItem: async (name: string) => {
      await storage.removeItem(name)
    },
  }

  // Devolvemos el almacenamiento JSON usando createJSONStorage
  return createJSONStorage(() => zustandStorage, restOptions)
}
