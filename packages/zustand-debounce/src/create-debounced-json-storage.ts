import { StateStorage, createJSONStorage } from 'zustand/middleware';
import { BaseStorage } from './core/base-storage';
import { EventDecorator } from './core/decorators/event.decorator';
import { RetryDecorator } from './core/decorators/retry.decorator';
import { SerializationDecorator } from './core/decorators/serialization.decorator';
import { ThrottleDecorator } from './core/decorators/throttle.decorator';
import { TTLDecorator } from './core/decorators/ttl.decorator';
import { EventEmitter } from './core/event-emitter';
import { EnhancedJsonStorageOptions, IStorage } from './types';

export function createDebouncedJSONStorage(
  storageApi: StateStorage,
  options: EnhancedJsonStorageOptions = {},
) {
  const eventEmitter = new EventEmitter();

  let storage: IStorage = new BaseStorage(storageApi);

  const {
    debounceTime,
    throttleTime,
    immediately,
    maxRetries,
    retryDelay,
    onWrite,
    onSave,
    serialize,
    deserialize,
    ttl,
    ...restOptions
  } = options;

  if (serialize && deserialize) {
    storage = new SerializationDecorator(storage, { serialize, deserialize });
  }

  if (typeof ttl === 'number') {
    storage = new TTLDecorator(storage, { ttl });
  }

  if (maxRetries || retryDelay) {
    storage = new RetryDecorator(storage, { maxRetries, retryDelay });
  }

  if (debounceTime || throttleTime || immediately !== undefined) {
    storage = new ThrottleDecorator(
      storage,
      { debounceTime, throttleTime, immediately },
      eventEmitter,
    );
  }

  const eventStorage = new EventDecorator(storage, eventEmitter);
  if (onWrite) {
    eventStorage.on('write', onWrite);
  }
  if (onSave) {
    eventStorage.on('save', onSave);
  }
  storage = eventStorage;

  const zustandStorage: StateStorage = {
    getItem: async (name: string) => {
      const value = await storage.getItem(name);
      return value;
    },
    setItem: async (name: string, value: string) => {
      await storage.setItem(name, value);
    },
    removeItem: async (name: string) => {
      await storage.removeItem(name);
    },
  };

  const jsonStorage = createJSONStorage(() => zustandStorage, restOptions);

  if (jsonStorage === undefined) {
    throw new Error('createJSONStorage returned undefined');
  }

  return jsonStorage;
}
