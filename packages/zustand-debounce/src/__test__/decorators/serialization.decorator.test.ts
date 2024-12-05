import { SerializationDecorator } from '../../core/decorators/serialization.decorator';

describe('SerializationDecorator', () => {
  let mockStorage: {
    getItem: jest.Mock<Promise<string | null>, [string]>;
    setItem: jest.Mock<Promise<void>, [string, string]>;
    removeItem: jest.Mock<Promise<void>, [string]>;
    flush: jest.Mock<Promise<void>, []>;
  };
  let serializationDecorator: SerializationDecorator;
  let serializeMock: jest.Mock<string, [any]>;
  let deserializeMock: jest.Mock<any, [string]>;

  beforeEach(() => {
    mockStorage = {
      getItem: jest.fn<Promise<string | null>, [string]>(),
      setItem: jest.fn<Promise<void>, [string, string]>(),
      removeItem: jest.fn<Promise<void>, [string]>(),
      flush: jest.fn<Promise<void>, []>(),
    };

    serializeMock = jest.fn((data: any) => JSON.stringify(data));
    deserializeMock = jest.fn((str: string) => JSON.parse(str));

    serializationDecorator = new SerializationDecorator(mockStorage, {
      serialize: serializeMock,
      deserialize: deserializeMock,
    });
  });

  test('setItem serializa el valor y llama a wrappedStorage.setItem', async () => {
    const key = 'testKey';
    const value = { foo: 'bar' };
    const serializedValue = JSON.stringify(value);

    mockStorage.setItem.mockResolvedValue(undefined);

    await serializationDecorator.setItem(key, value);

    expect(serializeMock).toHaveBeenCalledWith(value);
    expect(mockStorage.setItem).toHaveBeenCalledWith(key, serializedValue);
  });

  test('getItem llama a wrappedStorage.getItem y deserializa el resultado', async () => {
    const key = 'testKey';
    const value = { foo: 'bar' };
    const serializedValue = JSON.stringify(value);

    mockStorage.getItem.mockResolvedValue(serializedValue);

    const result = await serializationDecorator.getItem(key);

    expect(mockStorage.getItem).toHaveBeenCalledWith(key);
    expect(deserializeMock).toHaveBeenCalledWith(serializedValue);
    expect(result).toEqual(value);
  });

  test('getItem devuelve null si wrappedStorage.getItem devuelve null', async () => {
    const key = 'testKey';

    mockStorage.getItem.mockResolvedValue(null);

    const result = await serializationDecorator.getItem(key);

    expect(mockStorage.getItem).toHaveBeenCalledWith(key);
    expect(deserializeMock).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('maneja errores de serialización en setItem', async () => {
    const key = 'testKey';
    const value = { foo: 'bar' };
    const error = new Error('Error de serialización');

    serializeMock.mockImplementation(() => {
      throw error;
    });

    await expect(serializationDecorator.setItem(key, value)).rejects.toThrow(
      'Error de serialización',
    );

    expect(serializeMock).toHaveBeenCalledWith(value);
    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });

  test('maneja errores de deserialización en getItem', async () => {
    const key = 'testKey';
    const serializedValue = '{"foo": "bar"';
    const error = new Error('Error de deserialización');

    mockStorage.getItem.mockResolvedValue(serializedValue);
    deserializeMock.mockImplementation(() => {
      throw error;
    });

    await expect(serializationDecorator.getItem(key)).rejects.toThrow(
      'Error de deserialización',
    );

    expect(mockStorage.getItem).toHaveBeenCalledWith(key);
    expect(deserializeMock).toHaveBeenCalledWith(serializedValue);
  });
});
