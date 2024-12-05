import { IStorage } from '../types';

export class BaseStorage implements IStorage {
  constructor(private storageApi: IStorage) {}

  async getItem(key: string): Promise<string | null> {
    return this.storageApi.getItem(key);
  }

  async setItem(key: string, value: string): Promise<unknown> {
    return this.storageApi.setItem(key, value);
  }

  async removeItem(key: string): Promise<unknown> {
    return this.storageApi.removeItem(key);
  }
}
