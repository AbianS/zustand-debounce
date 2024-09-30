import { IStorage } from "../../types"
import { StorageDecorator } from "./storage.decorator"

interface TTLDecoratorOptions {
  ttl: number
}

export class TTLDecorator extends StorageDecorator {
  constructor(
    wrappedStorage: IStorage,
    private options: TTLDecoratorOptions,
  ) {
    super(wrappedStorage)
  }

  async setItem(key: string, value: string): Promise<void> {
    const expiresAt = Date.now() + this.options.ttl
    const data = JSON.stringify({ value, expiresAt })
    await this.wrappedStorage.setItem(key, data)
  }

  async getItem(key: string): Promise<string | null> {
    const dataStr = await this.wrappedStorage.getItem(key)
    if (!dataStr) return null

    try {
      const { value, expiresAt } = JSON.parse(dataStr)
      if (Date.now() > expiresAt) {
        await this.removeItem(key)
        return null
      }
      return value
    } catch (e) {
      // Manejo de errores de deserialización si es necesario
      return null
    }
  }
}
