import { EventDecorator } from '../../core/decorators/event.decorator';
import { EventEmitter } from '../../core/event-emitter';

describe('EventDecorator', () => {
  let mockStorage: {
    getItem: jest.Mock<Promise<string | null>, [string]>;
    setItem: jest.Mock<Promise<void>, [string, string]>;
    removeItem: jest.Mock<Promise<void>, [string]>;
  };
  let mockEventEmitter: EventEmitter;
  let eventDecorator: EventDecorator;

  beforeEach(() => {
    mockStorage = {
      getItem: jest.fn<Promise<string | null>, [string]>(),
      setItem: jest.fn<Promise<void>, [string, string]>(),
      removeItem: jest.fn<Promise<void>, [string]>(),
    };

    mockEventEmitter = new EventEmitter();
    eventDecorator = new EventDecorator(mockStorage, mockEventEmitter);
  });

  test('setItem calls wrappedStorage.setItem and emits write event', async () => {
    const key = 'testKey';
    const value = 'testValue';

    const emitSpy = jest.spyOn(mockEventEmitter, 'emit');

    mockStorage.setItem.mockResolvedValue(undefined);

    await eventDecorator.setItem(key, value);

    expect(mockStorage.setItem).toHaveBeenCalledWith(key, value);
    expect(emitSpy).toHaveBeenCalledWith('write', key, value);
  });

  test('getItem calls wrappedStorage.getItem and emits get event', async () => {
    const key = 'testKey';
    const value = 'testValue';

    const emitSpy = jest.spyOn(mockEventEmitter, 'emit');

    mockStorage.getItem.mockResolvedValue(value);

    const result = await eventDecorator.getItem(key);

    expect(mockStorage.getItem).toHaveBeenCalledWith(key);
    expect(result).toBe(value);
    expect(emitSpy).toHaveBeenCalledWith('get', key, value);
  });

  test('removeItem calls wrappedStorage.removeItem and emits remove event', async () => {
    const key = 'testKey';

    const emitSpy = jest.spyOn(mockEventEmitter, 'emit');

    mockStorage.removeItem.mockResolvedValue(undefined);

    await eventDecorator.removeItem(key);

    expect(mockStorage.removeItem).toHaveBeenCalledWith(key);
    expect(emitSpy).toHaveBeenCalledWith('remove', key);
  });

  test('on registers event callbacks', () => {
    const callback = jest.fn();

    eventDecorator.on('set', callback);

    expect(mockEventEmitter['events']['set']).toContain(callback);
  });

  test('emits events correctly when operations are performed', async () => {
    const setCallback = jest.fn();
    const getCallback = jest.fn();
    const removeCallback = jest.fn();

    eventDecorator.on('write', setCallback);
    eventDecorator.on('get', getCallback);
    eventDecorator.on('remove', removeCallback);

    mockStorage.setItem.mockResolvedValue(undefined);
    mockStorage.getItem.mockResolvedValue('value');
    mockStorage.removeItem.mockResolvedValue(undefined);

    await eventDecorator.setItem('key', 'value');
    await eventDecorator.getItem('key');
    await eventDecorator.removeItem('key');

    expect(setCallback).toHaveBeenCalledWith('key', 'value');
    expect(getCallback).toHaveBeenCalledWith('key', 'value');
    expect(removeCallback).toHaveBeenCalledWith('key');
  });

  test('on method handles multiple callbacks for the same event', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    eventDecorator.on('write', callback1);
    eventDecorator.on('write', callback2);

    mockStorage.setItem.mockResolvedValue(undefined);

    await eventDecorator.setItem('key', 'value');

    expect(callback1).toHaveBeenCalledWith('key', 'value');
    expect(callback2).toHaveBeenCalledWith('key', 'value');
  });
});
