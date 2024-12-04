// createDebouncedJSONStorage.test.ts

import { createDebouncedJSONStorage } from '../index';
import { StateStorage, StorageValue } from 'zustand/middleware';


describe('createDebouncedJSONStorage', () => {
    let storageApi: StateStorage;
    let debouncedStorageApi: ReturnType<typeof createDebouncedJSONStorage>;

    const debounceTime = 1000;

    beforeEach(() => {
        // Mock the storage API methods
        storageApi = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
        };

        // Initialize debouncedStorageApi with default options
        debouncedStorageApi = createDebouncedJSONStorage(storageApi, { debounceTime });

        // Use fake timers
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Clear all timers after each test
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('debounces setItem calls', () => {
        // Call setItem multiple times within the debounce period
        debouncedStorageApi.setItem('key', { state: 'value1' });
        debouncedStorageApi.setItem('key', { state: 'value2' });

        // At this point, setItem should not have been called yet
        expect(storageApi.setItem).not.toHaveBeenCalled();

        // Fast-forward time by debounceTime
        jest.advanceTimersByTime(debounceTime);

        // Now, setItem should have been called once
        expect(storageApi.setItem).toHaveBeenCalledTimes(1);

        // Retrieve the arguments with which setItem was called
        const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock.calls[0];

        // Parse the JSON string
        const parsedValue = JSON.parse(calledValue);

        // Check that the key matches
        expect(calledKey).toBe('key');

        // Check that the value matches
        expect(parsedValue).toEqual({ state: 'value2' });
    });

    test('calls setItem immediately if immediately is true', () => {
        // Re-initialize debouncedStorageApi with immediately: true
        debouncedStorageApi = createDebouncedJSONStorage(storageApi, {
            debounceTime,
            immediately: true,
        });

        const value: StorageValue<unknown> = { state: 'value' };
        debouncedStorageApi.setItem('key', value);

        // setItem should be called immediately
        expect(storageApi.setItem).toHaveBeenCalledTimes(1);

        // Retrieve the arguments
        const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock.calls[0];
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

        // setItem should have been called once with the last value
        expect(storageApi.setItem).toHaveBeenCalledTimes(1);

        const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock.calls[0];
        const parsedValue = JSON.parse(calledValue);

        expect(calledKey).toBe('key');
        expect(parsedValue).toEqual({ state: 'value3' });
    });

    test('debounces setItem calls globally across keys', () => {
        debouncedStorageApi.setItem('key1', { state: 'value1' });
        debouncedStorageApi.setItem('key2', { state: 'value2' });

        jest.advanceTimersByTime(debounceTime);

        // With the current implementation, only the last setItem call will be executed
        expect(storageApi.setItem).toHaveBeenCalledTimes(1);

        const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock.calls[0];
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

        const [calledKey, calledValue] = (storageApi.setItem as jest.Mock).mock.calls[0];
        const parsedValue = JSON.parse(calledValue);

        expect(calledKey).toBe('key');
        expect(parsedValue).toEqual({ state: 'value' });
    });
});     