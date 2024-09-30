import { IStorage } from "../../types"
import { StorageDecorator } from "./storage.decorator"

interface ThrottleOptions {
  debounceTime?: number
  throttleTime?: number
  immediately?: boolean
}

export class ThrottleDecorator extends StorageDecorator {
  private timeoutId?: ReturnType<typeof setTimeout>
  private pendingValue: { key: string; value: string } | null = null
  private lastExecutionTime = 0

  constructor(
    wrappedStorage: IStorage,
    private options: ThrottleOptions,
  ) {
    super(wrappedStorage)
  }

  async setItem(key: string, value: string): Promise<void> {
    const {
      debounceTime = 0,
      throttleTime = 0,
      immediately = false,
    } = this.options

    if (immediately) {
      await this.wrappedStorage.setItem(key, value)
      return
    }

    const now = Date.now()

    if (throttleTime && now - this.lastExecutionTime < throttleTime) {
      // Throttle: Omite esta ejecución
      return
    }

    this.pendingValue = { key, value }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(async () => {
      if (this.pendingValue !== null) {
        await this.wrappedStorage.setItem(
          this.pendingValue.key,
          this.pendingValue.value,
        )
        this.pendingValue = null
        this.lastExecutionTime = Date.now()
      }
    }, debounceTime)
  }

  async flush(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
    if (this.pendingValue !== null) {
      await this.wrappedStorage.setItem(
        this.pendingValue.key,
        this.pendingValue.value,
      )
      this.pendingValue = null
    }
    await this.wrappedStorage.flush?.()
  }
}
