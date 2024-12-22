import { ThrottleDecorator } from '../../core/decorators/throttle.decorator';
import { IStorage } from '../../types';
import { EventEmitter } from '../../core/event-emitter';

describe('ThrottleDecorator', () => {
  let mockStorage: jest.Mocked<IStorage>;
  let mockEventEmitter: jest.Mocked<EventEmitter>;
  let throttleDecorator: ThrottleDecorator;

  beforeEach(() => {
    jest.useFakeTimers();
    mockStorage = {
      getItem: jest.fn().mockResolvedValue(undefined),
      setItem: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    mockEventEmitter =
      new EventEmitter() as unknown as jest.Mocked<EventEmitter>;
    jest.spyOn(mockEventEmitter, 'emit');
    jest.spyOn(mockEventEmitter, 'on');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('setItem calls wrappedStorage.setItem immediately when immediately is true', async () => {
    const options = { immediately: true };
    throttleDecorator = new ThrottleDecorator(
      mockStorage,
      options,
      mockEventEmitter,
    );

    await throttleDecorator.setItem('key', 'value');

    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('save', 'key', 'value');
  });

  test('setItem debounces calls when debounceTime is set', async () => {
    const options = { debounceTime: 1000 };
    throttleDecorator = new ThrottleDecorator(
      mockStorage,
      options,
      mockEventEmitter,
    );

    throttleDecorator.setItem('key', 'value1');
    throttleDecorator.setItem('key', 'value2');

    jest.advanceTimersByTime(500);

    throttleDecorator.setItem('key', 'value3');

    expect(mockStorage.setItem).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    jest.runAllTimers();
    await Promise.resolve();

    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value3');
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('save', 'key', 'value3');
  });

  test('setItem throttles calls when throttleTime is set', async () => {
    const options = { throttleTime: 1000 };
    throttleDecorator = new ThrottleDecorator(
      mockStorage,
      options,
      mockEventEmitter,
    );

    throttleDecorator.setItem('key1', 'value1');

    jest.runAllTimers();
    await Promise.resolve();

    expect(mockStorage.setItem).toHaveBeenCalledWith('key1', 'value1');

    jest.advanceTimersByTime(500);
    throttleDecorator.setItem('key2', 'value2');

    jest.runAllTimers();
    await Promise.resolve();

    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(500);
    throttleDecorator.setItem('key3', 'value3');

    jest.runAllTimers();
    await Promise.resolve();

    expect(mockStorage.setItem).toHaveBeenCalledTimes(2);
    expect(mockStorage.setItem).toHaveBeenCalledWith('key3', 'value3');
  });

  test('setItem with both debounceTime and throttleTime', async () => {
    const options = { debounceTime: 500, throttleTime: 1000 };
    throttleDecorator = new ThrottleDecorator(
      mockStorage,
      options,
      mockEventEmitter,
    );

    throttleDecorator.setItem('key', 'value1');

    expect(mockStorage.setItem).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    jest.runOnlyPendingTimers();
    await Promise.resolve();

    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value1');
    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(200);
    throttleDecorator.setItem('key', 'value2');

    jest.runAllTimers();
    await Promise.resolve();

    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(800);
    throttleDecorator.setItem('key', 'value3');

    jest.advanceTimersByTime(500);
    jest.runAllTimers();
    await Promise.resolve();

    expect(mockStorage.setItem).toHaveBeenCalledTimes(2);
    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value3');
  });

  test('flush writes pending value immediately', async () => {
    const options = { debounceTime: 1000 };
    throttleDecorator = new ThrottleDecorator(
      mockStorage,
      options,
      mockEventEmitter,
    );

    throttleDecorator.setItem('key', 'value');

    await throttleDecorator.flush();

    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('save', 'key', 'value');
  });

  test('flush clears pending timeout', async () => {
    const options = { debounceTime: 1000 };
    throttleDecorator = new ThrottleDecorator(
      mockStorage,
      options,
      mockEventEmitter,
    );

    throttleDecorator.setItem('key', 'value');

    await throttleDecorator.flush();

    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);

    jest.runAllTimers();
    await Promise.resolve();

    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
  });

  test('does not emit save event if there is no pending value on flush', async () => {
    const options = { debounceTime: 1000 };
    throttleDecorator = new ThrottleDecorator(
      mockStorage,
      options,
      mockEventEmitter,
    );

    await throttleDecorator.flush();

    expect(mockStorage.setItem).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalledWith(
      'save',
      expect.any(String),
      expect.any(String),
    );
  });

  test('removeItem calls wrappedStorage.removeItem', async () => {
    throttleDecorator = new ThrottleDecorator(
      mockStorage,
      {},
      mockEventEmitter,
    );

    await throttleDecorator.removeItem('key');

    expect(mockStorage.removeItem).toHaveBeenCalledWith('key');
  });

  test('getItem calls wrappedStorage.getItem', async () => {
    throttleDecorator = new ThrottleDecorator(
      mockStorage,
      {},
      mockEventEmitter,
    );

    await throttleDecorator.getItem('key');

    expect(mockStorage.getItem).toHaveBeenCalledWith('key');
  });
});
