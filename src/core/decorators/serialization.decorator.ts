import { IStorage } from "../../types"
import { StorageDecorator } from "./storage.decorator"

interface SerializationOptions {
  serialize: (data: unknown) => string
  deserialize: (str: string) => unknown
}

export class SerializationDecorator extends StorageDecorator {
  constructor(
    wrappedStorage: IStorage,
    private options: SerializationOptions,
  ) {
    super(wrappedStorage)
  }

  async setItem(key: string, value: any): Promise<void> {
    const serializedValue = this.options.serialize(value)
    await this.wrappedStorage.setItem(key, serializedValue)
  }

  async getItem(key: string): Promise<any> {
    const value = await this.wrappedStorage.getItem(key)
    return value ? this.options.deserialize(value) : null
  }
}
