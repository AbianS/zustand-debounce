import { RetryDecorator } from '../../core/decorators/retry.decorator';

describe('RetryDecorator', () => {
  let mockStorage: {
    getItem: jest.Mock<Promise<string | null>, [string]>;
    setItem: jest.Mock<Promise<void>, [string, string]>;
    removeItem: jest.Mock<Promise<void>, [string]>;
    flush: jest.Mock<Promise<void>, []>;
  };
  let retryDecorator: RetryDecorator;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStorage = {
      getItem: jest.fn<Promise<string | null>, [string]>(),
      setItem: jest.fn<Promise<void>, [string, string]>(),
      removeItem: jest.fn<Promise<void>, [string]>(),
      flush: jest.fn<Promise<void>, []>(),
    };
  });

  test('setItem succeeds on first attempt without retries', async () => {
    mockStorage.setItem.mockResolvedValue(undefined);
    retryDecorator = new RetryDecorator(mockStorage);

    await retryDecorator.setItem('key', 'value');

    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });

  test('setItem retries when wrappedStorage.setItem fails', async () => {
    const maxRetries = 3;
    const retryDelay = 0;
    retryDecorator = new RetryDecorator(mockStorage, {
      maxRetries,
      retryDelay,
    });

    mockStorage.setItem
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValueOnce(undefined);

    await retryDecorator.setItem('key', 'value');

    expect(mockStorage.setItem).toHaveBeenCalledTimes(3);
    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });

  test('setItem throws error after exceeding maxRetries', async () => {
    const maxRetries = 2;
    const retryDelay = 0;
    retryDecorator = new RetryDecorator(mockStorage, {
      maxRetries,
      retryDelay,
    });

    mockStorage.setItem.mockRejectedValue(new Error('Failure'));

    await expect(retryDecorator.setItem('key', 'value')).rejects.toThrow(
      'Failure',
    );
    expect(mockStorage.setItem).toHaveBeenCalledTimes(maxRetries);
  });

  test('setItem respects custom maxRetries and retryDelay', async () => {
    const maxRetries = 5;
    const retryDelay = 0;
    retryDecorator = new RetryDecorator(mockStorage, {
      maxRetries,
      retryDelay,
    });

    mockStorage.setItem
      .mockRejectedValueOnce(new Error('Failure 1'))
      .mockRejectedValueOnce(new Error('Failure 2'))
      .mockRejectedValueOnce(new Error('Failure 3'))
      .mockRejectedValueOnce(new Error('Failure 4'))
      .mockResolvedValueOnce(undefined);

    await retryDecorator.setItem('key', 'value');

    expect(mockStorage.setItem).toHaveBeenCalledTimes(maxRetries);
    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });
});
