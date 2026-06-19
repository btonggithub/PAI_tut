const {
  eventBus,
  EVENT_NAMES,
  registerEventHandlers,
  resetEventHandlers,
  getRegisteredHandlerCount,
} = require('../../src/services/event');

describe('eventRegistry', () => {
  beforeEach(() => {
    resetEventHandlers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetEventHandlers();
  });

  it('registers handlers through the service event registry', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    const unsubscribers = registerEventHandlers([
      {
        key: 'file-upload-test-handler',
        eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
        handler,
      },
    ]);

    expect(unsubscribers).toHaveLength(1);
    expect(eventBus.getHandlerCount(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL)).toBe(1);
    expect(getRegisteredHandlerCount()).toBe(1);

    await eventBus.publish(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, {
      resource: { type: 'file', id: 'file-1' },
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('resets registered handlers', () => {
    registerEventHandlers([
      {
        key: 'file-upload-test-handler',
        eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
        handler: jest.fn(),
      },
      {
        key: 'user-profile-test-handler',
        eventName: EVENT_NAMES.USER_PROFILE_UPDATED_INTERNAL,
        handler: jest.fn(),
      },
    ]);

    expect(eventBus.getHandlerCount()).toBe(2);
    expect(getRegisteredHandlerCount()).toBe(2);

    resetEventHandlers();

    expect(eventBus.getHandlerCount()).toBe(0);
    expect(getRegisteredHandlerCount()).toBe(0);
  });

  it('prevents duplicate handler registration across startup re-runs', () => {
    const firstHandler = jest.fn();
    const secondHandler = jest.fn();
    const registrations = [
      {
        key: 'file-upload-audit-handler',
        eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
        handler: firstHandler,
      },
    ];

    registerEventHandlers(registrations);
    registerEventHandlers([
      {
        key: 'file-upload-audit-handler',
        eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
        handler: secondHandler,
      },
    ]);

    expect(eventBus.getHandlerCount(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL)).toBe(1);
    expect(getRegisteredHandlerCount()).toBe(1);
  });

  it('requires a stable key for every registered handler', () => {
    expect(() => registerEventHandlers([
      { eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL, handler: jest.fn() },
    ])).toThrow('Event handler registration requires a stable key');

    expect(eventBus.getHandlerCount(EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL)).toBe(0);
    expect(getRegisteredHandlerCount()).toBe(0);
  });
});
