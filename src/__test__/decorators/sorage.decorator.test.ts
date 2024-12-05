import { StorageDecorator } from '../../core/decorators/storage.decorator';
import { IStorage } from '../../types';

describe('StorageDecorator', () => {
  class ConcreteStorageDecorator extends StorageDecorator {}

  let mockStorage: jest.Mocked<IStorage>;
  let decorator: IStorage;

  beforeEach(() => {
    mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      flush: jest.fn(),
    };

    decorator = new ConcreteStorageDecorator(mockStorage);
  });

  test('getItem forwards the call to wrappedStorage.getItem', async () => {
    mockStorage.getItem.mockResolvedValue('testValue');

    const result = await decorator.getItem('testKey');

    expect(mockStorage.getItem).toHaveBeenCalledTimes(1);
    expect(mockStorage.getItem).toHaveBeenCalledWith('testKey');
    expect(result).toBe('testValue');
  });

  test('setItem forwards the call to wrappedStorage.setItem', async () => {
    await decorator.setItem('testKey', 'testValue');

    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
  });

  test('removeItem forwards the call to wrappedStorage.removeItem', async () => {
    await decorator.removeItem('testKey');

    expect(mockStorage.removeItem).toHaveBeenCalledTimes(1);
    expect(mockStorage.removeItem).toHaveBeenCalledWith('testKey');
  });

  test('flush forwards the call to wrappedStorage.flush if defined', async () => {
    await decorator.flush?.();

    expect(mockStorage.flush).toHaveBeenCalledTimes(1);
  });

  test('flush does nothing if wrappedStorage.flush is not defined', async () => {
    const storageWithoutFlush: IStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    decorator = new ConcreteStorageDecorator(storageWithoutFlush);

    await expect(decorator.flush?.()).resolves.not.toThrow();
  });
});
