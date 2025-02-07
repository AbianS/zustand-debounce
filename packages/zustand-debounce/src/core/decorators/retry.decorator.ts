import { IStorage } from '../../types';
import { StorageDecorator } from './storage.decorator';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export class RetryDecorator extends StorageDecorator {
  constructor(
    wrappedStorage: IStorage,
    private options: RetryOptions = {},
  ) {
    super(wrappedStorage);
  }

  async setItem(key: string, value: string): Promise<void> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 1,
    } = this.options;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        await this.wrappedStorage.setItem(key, value);
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw error;
        }
        const delay = retryDelay * backoffMultiplier ** (attempts - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
