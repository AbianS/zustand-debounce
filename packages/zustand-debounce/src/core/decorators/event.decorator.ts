import { IStorage } from "../../types"
import { EventEmitter } from "../event-emitter"
import { StorageDecorator } from "./storage.decorator"

type StorageEvent = "set" | "get" | "remove" | "write" | "save"

type EventCallbackMap = {
  set: (key: string, value: string) => void
  get: (key: string, value: string | null) => void
  remove: (key: string) => void
  write: (key: string, value: string) => void
  save: (key: string, value: string) => void
}

export class EventDecorator extends StorageDecorator {
  private eventEmitter: EventEmitter

  constructor(wrappedStorage: IStorage, eventEmitter: EventEmitter) {
    super(wrappedStorage)
    this.eventEmitter = eventEmitter
  }

  on<E extends StorageEvent>(event: E, callback: EventCallbackMap[E]) {
    this.eventEmitter.on(event, callback)
  }

  async setItem(key: string, value: string): Promise<void> {
    this.eventEmitter.emit("write", key, value)
    await this.wrappedStorage.setItem(key, value)
  }

  async getItem(key: string): Promise<string | null> {
    const value = await this.wrappedStorage.getItem(key)
    this.eventEmitter.emit("get", key, value)
    return value
  }

  async removeItem(key: string): Promise<void> {
    await this.wrappedStorage.removeItem(key)
    this.eventEmitter.emit("remove", key)
  }
}
