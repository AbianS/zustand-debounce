import { IStorage } from '../../types';

export abstract class StorageDecorator implements IStorage {
  constructor(protected wrappedStorage: IStorage) {}

  async getItem(key: string): Promise<string | null> {
    return this.wrappedStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.wrappedStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await this.wrappedStorage.removeItem(key);
  }

  async flush(): Promise<void> {
    if (this.wrappedStorage.flush) {
      await this.wrappedStorage.flush();
    }
  }
}
