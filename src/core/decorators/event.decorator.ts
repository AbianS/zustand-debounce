import { IStorage } from "../../types"
import { StorageDecorator } from "./storage.decorator"

type StorageEvent = "set" | "get" | "remove"

type EventCallbackMap = {
  set: (key: string, value: string) => void
  get: (key: string, value: string | null) => void
  remove: (key: string) => void
}

type EventParametersMap = {
  set: [key: string, value: string]
  get: [key: string, value: string | null]
  remove: [key: string]
}

export class EventDecorator extends StorageDecorator {
  private listeners: {
    [K in StorageEvent]?: EventCallbackMap[K][]
  } = {}

  constructor(wrappedStorage: IStorage) {
    super(wrappedStorage)
  }

  on<E extends StorageEvent>(event: E, callback: EventCallbackMap[E]) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    ;(this.listeners[event] as EventCallbackMap[E][]).push(callback)
  }

  private emit<E extends StorageEvent>(
    event: E,
    ...args: EventParametersMap[E]
  ) {
    this.listeners[event]?.forEach((callback) => {
      ;(callback as (...args: EventParametersMap[E]) => void)(...args)
    })
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.wrappedStorage.setItem(key, value)
    this.emit("set", key, value)
  }

  async getItem(key: string): Promise<string | null> {
    const value = await this.wrappedStorage.getItem(key)
    this.emit("get", key, value)
    return value
  }

  async removeItem(key: string): Promise<void> {
    await this.wrappedStorage.removeItem(key)
    this.emit("remove", key)
  }
}
