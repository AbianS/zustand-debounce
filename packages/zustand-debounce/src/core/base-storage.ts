import type { IStorage } from '../types';
import type { PluginManager } from './plugin-manager';

export class BaseStorage implements IStorage {
  constructor(
    private storageApi: IStorage,
    private pluginManager?: PluginManager,
  ) {}

  async getItem(key: string): Promise<string | null> {
    // Read raw value from storage
    const rawValue = await this.storageApi.getItem(key);

    // If no plugin manager, return raw value as-is (backward compatible)
    if (!this.pluginManager) {
      return rawValue;
    }

    // Apply plugin transformations
    return this.pluginManager.applyAfterGetItem(rawValue);
  }

  async setItem(key: string, value: string): Promise<unknown> {
    // If no plugin manager, write value as-is (backward compatible)
    if (!this.pluginManager) {
      return this.storageApi.setItem(key, value);
    }

    // Apply plugin transformations
    const transformedValue = this.pluginManager.applyBeforeSetItem(value);

    // Write transformed value to storage
    return this.storageApi.setItem(key, transformedValue);
  }

  async removeItem(key: string): Promise<unknown> {
    return this.storageApi.removeItem(key);
  }
}
