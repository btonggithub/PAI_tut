const eventBus = require('../../src/services/event/eventBus');
const EVENT_NAMES = require('../../src/services/event/eventNames');

describe('EventBus', () => {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    eventBus.clearHandlers();
    eventBus.resetMetrics();
    eventBus.setLogger(logger);
    jest.clearAllMocks();
  });

  afterEach(() => {
    eventBus.clearHandlers();
    eventBus.resetMetrics();
    eventBus.setLogger();
  });

  it('publishes an event to one handler', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    eventBus.subscribe(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, handler);

    const result = await eventBus.publish(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, {
      actor: { id: 'user-1', role: 'user' },
      resource: { type: 'file', id: 'file-1' },
      metadata: { originalName: 'test.txt' },
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      name: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
      actor: { id: 'user-1', role: 'user' },
      resource: { type: 'file', id: 'file-1' },
      metadata: { originalName: 'test.txt' },
      occurredAt: expect.any(String),
    }));
    expect(result).toEqual(expect.objectContaining({
      eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
      handlerCount: 1,
      handled: true,
      errors: [],
    }));
    expect(eventBus.getMetrics()).toEqual({
      publishedCount: 1,
      handledCount: 1,
      failedCount: 0,
    });
  });

  it('publishes an event to multiple handlers in registration order', async () => {
    const calls = [];
    const firstHandler = jest.fn().mockImplementation(async () => calls.push('first'));
    const secondHandler = jest.fn().mockImplementation(async () => calls.push('second'));

    eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED_INTERNAL, firstHandler);
    eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED_INTERNAL, secondHandler);

    const result = await eventBus.publish(EVENT_NAMES.USER_PROFILE_UPDATED_INTERNAL, {
      resource: { type: 'user', id: 'user-1' },
    });

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['first', 'second']);
    expect(result.handlerCount).toBe(2);
  });

  it('safely publishes an event with no handlers', async () => {
    const result = await eventBus.publish(EVENT_NAMES.EMAIL_VERIFICATION_QUEUED_INTERNAL, {
      resource: { type: 'email', id: 'verification' },
    });

    expect(result).toEqual(expect.objectContaining({
      eventName: EVENT_NAMES.EMAIL_VERIFICATION_QUEUED_INTERNAL,
      handlerCount: 0,
      handled: false,
      errors: [],
    }));
    expect(eventBus.getMetrics()).toEqual({
      publishedCount: 1,
      handledCount: 0,
      failedCount: 0,
    });
  });

  it('captures handler failures by default and continues publishing', async () => {
    const error = new Error('handler failed');
    const failingHandler = jest.fn().mockRejectedValue(error);
    const succeedingHandler = jest.fn().mockResolvedValue(undefined);

    eventBus.subscribe(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, failingHandler);
    eventBus.subscribe(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, succeedingHandler);

    const result = await eventBus.publish(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, {
      resource: { type: 'file', id: 'file-1' },
    });

    expect(failingHandler).toHaveBeenCalledTimes(1);
    expect(succeedingHandler).toHaveBeenCalledTimes(1);
    expect(result.errors).toEqual([error]);
    expect(eventBus.getMetrics()).toEqual({
      publishedCount: 1,
      handledCount: 1,
      failedCount: 1,
    });
  });

  it('writes structured publish, handled, and failed logs with correlation id', async () => {
    const error = new Error('handler failed');
    const failingHandler = jest.fn().mockRejectedValue(error);
    const succeedingHandler = jest.fn().mockResolvedValue(undefined);

    eventBus.subscribe(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, failingHandler);
    eventBus.subscribe(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, succeedingHandler);

    await eventBus.publish(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, {
      correlationId: 'request-123',
      resource: { type: 'file', id: 'file-1' },
    });

    expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({
      type: 'event.publish',
      eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
      correlationId: 'request-123',
      handlerCount: 2,
    }));
    expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({
      type: 'event.handled',
      eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
      correlationId: 'request-123',
    }));
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({
      type: 'event.failed',
      eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
      correlationId: 'request-123',
      error: expect.objectContaining({ message: 'handler failed' }),
    }));
  });

  it('propagates correlation id from request context payload', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    eventBus.subscribe(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, handler);

    const result = await eventBus.publish(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, {
      requestContext: { correlationId: 'request-context-123' },
      resource: { type: 'file', id: 'file-1' },
    });

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      correlationId: 'request-context-123',
    }));
    expect(result.payload.correlationId).toBe('request-context-123');
    expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({
      type: 'event.publish',
      correlationId: 'request-context-123',
    }));
  });

  it('propagates handler failures when throwOnError is enabled', async () => {
    const error = new Error('handler failed');
    const failingHandler = jest.fn().mockRejectedValue(error);
    const succeedingHandler = jest.fn().mockResolvedValue(undefined);

    eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED_INTERNAL, failingHandler);
    eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED_INTERNAL, succeedingHandler);

    await expect(eventBus.publish(
      EVENT_NAMES.USER_PROFILE_UPDATED_INTERNAL,
      { resource: { type: 'user', id: 'user-1' } },
      { throwOnError: true }
    )).rejects.toThrow('handler failed');

    expect(failingHandler).toHaveBeenCalledTimes(1);
    expect(succeedingHandler).not.toHaveBeenCalled();
  });

  it('returns an unsubscribe function for handler cleanup', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const unsubscribe = eventBus.subscribe(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, handler);

    expect(eventBus.getHandlerCount(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL)).toBe(1);

    unsubscribe();

    expect(eventBus.getHandlerCount(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL)).toBe(0);

    await eventBus.publish(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL);

    expect(handler).not.toHaveBeenCalled();
  });

  it('resets handlers between tests or isolated workflows', () => {
    eventBus.subscribe(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, jest.fn());
    eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED_INTERNAL, jest.fn());

    expect(eventBus.getHandlerCount()).toBe(2);

    eventBus.clearHandlers();
    eventBus.resetMetrics();

    expect(eventBus.getHandlerCount()).toBe(0);
    expect(eventBus.getEventNames()).toEqual([]);
    expect(eventBus.getMetrics()).toEqual({
      publishedCount: 0,
      handledCount: 0,
      failedCount: 0,
    });
  });

  it('rejects invalid event names and handlers', () => {
    expect(() => eventBus.subscribe('InvalidEvent', jest.fn())).toThrow(
      'Event name must use lowercase dot notation'
    );
    expect(() => eventBus.subscribe(EVENT_NAMES.USER_PROFILE_UPDATED_INTERNAL, 'not-a-function')).toThrow(
      'Event handler must be a function'
    );
  });
});
