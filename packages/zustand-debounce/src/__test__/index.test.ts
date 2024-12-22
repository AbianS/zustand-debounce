import { StateStorage, StorageValue } from 'zustand/middleware';
import { createDebouncedJSONStorage } from '../index';

describe('createDebouncedJSONStorage', () => {
  let storageApi: StateStorage;
  let debouncedStorageApi: ReturnType<typeof createDebouncedJSONStorage>;

  const debounceTime = 1000;

  beforeEach(() => {
    storageApi = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    debouncedStorageApi = createDebouncedJSONStorage(storageApi, {
      debounceTime,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('debounces setItem calls', () => {
    debouncedStorageApi.setItem('key', { state: 'value1' });
    debouncedStorageApi.setItem('key', { state: 'value2' });

    expect(storageApi.setItem).not.toHaveBeenCalled();

    jest.advanceTimersByTime(debounceTime);

    expect(storageApi.setItem).toHaveBeenCalledTimes(1);

    const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock
      .calls[0];

    const parsedValue = JSON.parse(calledValue);

    expect(calledKey).toBe('key');

    expect(parsedValue).toEqual({ state: 'value2' });
  });

  test('calls setItem immediately if immediately is true', () => {
    debouncedStorageApi = createDebouncedJSONStorage(storageApi, {
      debounceTime,
      immediately: true,
    });

    const value: StorageValue<unknown> = { state: 'value' };
    debouncedStorageApi.setItem('key', value);

    expect(storageApi.setItem).toHaveBeenCalledTimes(1);

    const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock
      .calls[0];
    const parsedValue = JSON.parse(calledValue);

    expect(calledKey).toBe('key');
    expect(parsedValue).toEqual(value);
  });

  test('only stores the last value within debounce time', () => {
    debouncedStorageApi.setItem('key', { state: 'value1' });
    jest.advanceTimersByTime(500);
    debouncedStorageApi.setItem('key', { state: 'value2' });
    jest.advanceTimersByTime(500);
    debouncedStorageApi.setItem('key', { state: 'value3' });
    jest.advanceTimersByTime(1000);

    expect(storageApi.setItem).toHaveBeenCalledTimes(1);

    const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock
      .calls[0];
    const parsedValue = JSON.parse(calledValue);

    expect(calledKey).toBe('key');
    expect(parsedValue).toEqual({ state: 'value3' });
  });

  test('debounces setItem calls globally across keys', () => {
    debouncedStorageApi.setItem('key1', { state: 'value1' });
    debouncedStorageApi.setItem('key2', { state: 'value2' });

    jest.advanceTimersByTime(debounceTime);

    expect(storageApi.setItem).toHaveBeenCalledTimes(1);

    const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock
      .calls[0];
    const parsedValue = JSON.parse(calledValue);

    expect(calledKey).toBe('key2');
    expect(parsedValue).toEqual({ state: 'value2' });
  });

  test('does not setItem if debounceTime has not passed', () => {
    debouncedStorageApi.setItem('key', { state: 'value' });

    jest.advanceTimersByTime(debounceTime - 1);

    expect(storageApi.setItem).not.toHaveBeenCalled();
  });

  test('immediately option defaults to false', () => {
    debouncedStorageApi.setItem('key', { state: 'value' });

    expect(storageApi.setItem).not.toHaveBeenCalled();

    jest.advanceTimersByTime(debounceTime);

    expect(storageApi.setItem).toHaveBeenCalledTimes(1);

    const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock
      .calls[0];
    const parsedValue = JSON.parse(calledValue);

    expect(calledKey).toBe('key');
    expect(parsedValue).toEqual({ state: 'value' });
  });
});
