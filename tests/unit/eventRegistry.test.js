const { eventBus, EVENT_NAMES, registerEventHandlers, resetEventHandlers } = require('../../src/services/event');

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
      { eventName: EVENT_NAMES.FILE_UPLOADED, handler },
    ]);

    expect(unsubscribers).toHaveLength(1);
    expect(eventBus.getHandlerCount(EVENT_NAMES.FILE_UPLOADED)).toBe(1);

    await eventBus.publish(EVENT_NAMES.FILE_UPLOADED, {
      resource: { type: 'file', id: 'file-1' },
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('resets registered handlers', () => {
    registerEventHandlers([
      { eventName: EVENT_NAMES.FILE_UPLOADED, handler: jest.fn() },
      { eventName: EVENT_NAMES.USER_UPDATED, handler: jest.fn() },
    ]);

    expect(eventBus.getHandlerCount()).toBe(2);

    resetEventHandlers();

    expect(eventBus.getHandlerCount()).toBe(0);
  });
});
