import { TTLDecorator } from '../../core/decorators/ttl.decorator';
import { IStorage } from '../../types';

describe('TTLDecorator', () => {
  let mockStorage: jest.Mocked<IStorage>;
  let ttlDecorator: TTLDecorator;
  const ttl = 1000;

  beforeEach(() => {
    mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    ttlDecorator = new TTLDecorator(mockStorage, { ttl });
  });

  test('setItem stores value with expiration time', async () => {
    const key = 'testKey';
    const value = 'testValue';

    const now = Date.now();
    jest.spyOn(global.Date, 'now').mockReturnValue(now);

    await ttlDecorator.setItem(key, value);

    const expectedData = JSON.stringify({
      value,
      expiresAt: now + ttl,
    });

    expect(mockStorage.setItem).toHaveBeenCalledWith(key, expectedData);
  });

  test('getItem returns value if not expired', async () => {
    const key = 'testKey';
    const value = 'testValue';

    const now = Date.now();
    const expiresAt = now + ttl;

    const storedData = JSON.stringify({ value, expiresAt });

    mockStorage.getItem.mockResolvedValue(storedData);

    jest.spyOn(global.Date, 'now').mockReturnValue(now);

    const result = await ttlDecorator.getItem(key);

    expect(result).toBe(value);
  });

  test('getItem returns null and removes item if expired', async () => {
    const key = 'testKey';
    const value = 'testValue';

    const now = Date.now();
    const expiresAt = now - 1;

    const storedData = JSON.stringify({ value, expiresAt });

    mockStorage.getItem.mockResolvedValue(storedData);

    jest.spyOn(global.Date, 'now').mockReturnValue(now);

    const result = await ttlDecorator.getItem(key);

    expect(result).toBeNull();
    expect(mockStorage.removeItem).toHaveBeenCalledWith(key);
  });

  test('getItem returns null if data is invalid JSON', async () => {
    const key = 'testKey';

    mockStorage.getItem.mockResolvedValue('invalid json');

    const result = await ttlDecorator.getItem(key);

    expect(result).toBeNull();
  });

  test('getItem returns null if data is null', async () => {
    const key = 'testKey';

    mockStorage.getItem.mockResolvedValue(null);

    const result = await ttlDecorator.getItem(key);

    expect(result).toBeNull();
  });
});
