const eventBus = require('../../src/services/event/eventBus');
const EVENT_NAMES = require('../../src/services/event/eventNames');

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clearHandlers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    eventBus.clearHandlers();
  });

  it('publishes an event to one handler', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    eventBus.subscribe(EVENT_NAMES.FILE_UPLOADED, handler);

    const result = await eventBus.publish(EVENT_NAMES.FILE_UPLOADED, {
      actor: { id: 'user-1', role: 'user' },
      resource: { type: 'file', id: 'file-1' },
      metadata: { originalName: 'test.txt' },
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      name: EVENT_NAMES.FILE_UPLOADED,
      actor: { id: 'user-1', role: 'user' },
      resource: { type: 'file', id: 'file-1' },
      metadata: { originalName: 'test.txt' },
      occurredAt: expect.any(String),
    }));
    expect(result).toEqual(expect.objectContaining({
      eventName: EVENT_NAMES.FILE_UPLOADED,
      handlerCount: 1,
      handled: true,
      errors: [],
    }));
  });

  it('publishes an event to multiple handlers in registration order', async () => {
    const calls = [];
    const firstHandler = jest.fn().mockImplementation(async () => calls.push('first'));
    const secondHandler = jest.fn().mockImplementation(async () => calls.push('second'));

    eventBus.subscribe(EVENT_NAMES.USER_UPDATED, firstHandler);
    eventBus.subscribe(EVENT_NAMES.USER_UPDATED, secondHandler);

    const result = await eventBus.publish(EVENT_NAMES.USER_UPDATED, {
      resource: { type: 'user', id: 'user-1' },
    });

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['first', 'second']);
    expect(result.handlerCount).toBe(2);
  });

  it('safely publishes an event with no handlers', async () => {
    const result = await eventBus.publish(EVENT_NAMES.EMAIL_VERIFICATION_SENT, {
      resource: { type: 'email', id: 'verification' },
    });

    expect(result).toEqual(expect.objectContaining({
      eventName: EVENT_NAMES.EMAIL_VERIFICATION_SENT,
      handlerCount: 0,
      handled: false,
      errors: [],
    }));
  });

  it('captures handler failures by default and continues publishing', async () => {
    const error = new Error('handler failed');
    const failingHandler = jest.fn().mockRejectedValue(error);
    const succeedingHandler = jest.fn().mockResolvedValue(undefined);

    eventBus.subscribe(EVENT_NAMES.FILE_UPLOADED, failingHandler);
    eventBus.subscribe(EVENT_NAMES.FILE_UPLOADED, succeedingHandler);

    const result = await eventBus.publish(EVENT_NAMES.FILE_UPLOADED, {
      resource: { type: 'file', id: 'file-1' },
    });

    expect(failingHandler).toHaveBeenCalledTimes(1);
    expect(succeedingHandler).toHaveBeenCalledTimes(1);
    expect(result.errors).toEqual([error]);
  });

  it('propagates handler failures when throwOnError is enabled', async () => {
    const error = new Error('handler failed');
    const failingHandler = jest.fn().mockRejectedValue(error);
    const succeedingHandler = jest.fn().mockResolvedValue(undefined);

    eventBus.subscribe(EVENT_NAMES.USER_UPDATED, failingHandler);
    eventBus.subscribe(EVENT_NAMES.USER_UPDATED, succeedingHandler);

    await expect(eventBus.publish(
      EVENT_NAMES.USER_UPDATED,
      { resource: { type: 'user', id: 'user-1' } },
      { throwOnError: true }
    )).rejects.toThrow('handler failed');

    expect(failingHandler).toHaveBeenCalledTimes(1);
    expect(succeedingHandler).not.toHaveBeenCalled();
  });

  it('returns an unsubscribe function for handler cleanup', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const unsubscribe = eventBus.subscribe(EVENT_NAMES.FILE_UPLOADED, handler);

    expect(eventBus.getHandlerCount(EVENT_NAMES.FILE_UPLOADED)).toBe(1);

    unsubscribe();

    expect(eventBus.getHandlerCount(EVENT_NAMES.FILE_UPLOADED)).toBe(0);

    await eventBus.publish(EVENT_NAMES.FILE_UPLOADED);

    expect(handler).not.toHaveBeenCalled();
  });

  it('resets handlers between tests or isolated workflows', () => {
    eventBus.subscribe(EVENT_NAMES.FILE_UPLOADED, jest.fn());
    eventBus.subscribe(EVENT_NAMES.USER_UPDATED, jest.fn());

    expect(eventBus.getHandlerCount()).toBe(2);

    eventBus.clearHandlers();

    expect(eventBus.getHandlerCount()).toBe(0);
    expect(eventBus.getEventNames()).toEqual([]);
  });

  it('rejects invalid event names and handlers', () => {
    expect(() => eventBus.subscribe('InvalidEvent', jest.fn())).toThrow(
      'Event name must use lowercase dot notation'
    );
    expect(() => eventBus.subscribe(EVENT_NAMES.USER_UPDATED, 'not-a-function')).toThrow(
      'Event handler must be a function'
    );
  });
});
