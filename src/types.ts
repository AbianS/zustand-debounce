type JsonStorageOptions = {
  reviver?: (key: string, value: unknown) => unknown
  replacer?: (key: string, value: unknown) => unknown
}

export interface EnhancedJsonStorageOptions extends JsonStorageOptions {
  debounceTime?: number
  throttleTime?: number
  immediately?: boolean
  maxRetries?: number
  retryDelay?: number
  onWrite?: (key: string, value: string) => void
  serialize?: (state: unknown) => string
  deserialize?: (str: string) => unknown
  ttl?: number // Tiempo de vida en milisegundos
}

export interface IStorage {
  getItem(key: string): Promise<string | null> | null | string
  setItem(key: string, value: string): Promise<unknown> | unknown
  removeItem(key: string): Promise<unknown> | unknown
  flush?(): Promise<void>
}
