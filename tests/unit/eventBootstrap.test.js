const { bootstrapInternalEvents, resetEventHandlers, getRegisteredHandlerCount } = require('../../src/services/event');

describe('event bootstrap', () => {
  beforeEach(() => {
    resetEventHandlers();
  });

  afterEach(() => {
    resetEventHandlers();
  });

  it('registers internal event handlers when enabled', () => {
    const result = bootstrapInternalEvents({ enabled: true, logger: { info: jest.fn() } });

    expect(result).toEqual({
      enabled: true,
      registeredHandlers: 1,
    });
    expect(getRegisteredHandlerCount()).toBe(1);
  });

  it('skips registration when disabled', () => {
    const result = bootstrapInternalEvents({ enabled: false });

    expect(result).toEqual({
      enabled: false,
      registeredHandlers: 0,
    });
    expect(getRegisteredHandlerCount()).toBe(0);
  });
});