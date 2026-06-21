const eventBus = require('../../src/services/event/eventBus');
const DOMAIN_EVENT_NAMES = require('../../src/services/event/domainEventNames');
const {
  publishDomainEvent,
  publishUserRegistered,
  publishUserEmailVerified,
  publishFileUploaded,
} = require('../../src/services/event/domainEventPublisher');

describe('domain event publisher', () => {
  beforeEach(() => {
    eventBus.clearHandlers();
    eventBus.resetMetrics();
  });

  afterEach(() => {
    eventBus.clearHandlers();
    eventBus.resetMetrics();
  });

  it('delegates supported domain events to the existing event bus', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    eventBus.subscribe(DOMAIN_EVENT_NAMES.USER_REGISTERED_V1, handler);

    const result = await publishUserRegistered({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: 'user',
      },
      requestContext: { correlationId: 'register-1' },
    });

    // Debug: log what was actually called
    if (handler.mock.calls.length > 0) {
      console.log('Handler called with:', JSON.stringify(handler.mock.calls[0][0], null, 2));
    }

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      name: DOMAIN_EVENT_NAMES.USER_REGISTERED_V1,
      version: 'v1',
      owner: { domain: 'user' },
      actor: { id: 'user-1', role: 'user' },
      resource: { type: 'user', id: 'user-1' },
      metadata: expect.objectContaining({
        email: 'user@example.com',
        role: 'user',
        emailVerified: false,
      }),
      correlationId: 'register-1',
      occurredAt: expect.any(String),
    }));
    expect(result).toEqual(expect.objectContaining({
      eventName: DOMAIN_EVENT_NAMES.USER_REGISTERED_V1,
      handlerCount: 1,
      handled: true,
      errors: [],
    }));
  });

  it('publishes user email verified events', async () => {
    const result = await publishUserEmailVerified({
      userId: 'user-1',
      email: 'user@example.com',
    });

    expect(result).toEqual(expect.objectContaining({
      eventName: DOMAIN_EVENT_NAMES.USER_EMAIL_VERIFIED_V1,
      handlerCount: 0,
      handled: false,
      errors: [],
    }));
  });

  it('publishes file uploaded events', async () => {
    const result = await publishFileUploaded({
      actor: { id: 'user-1', role: 'user' },
      file: {
        id: 'file-1',
        ownerId: 'user-1',
        mimeType: 'text/plain',
        size: 512,
        storageProvider: 'local',
      },
    });

    expect(result).toEqual(expect.objectContaining({
      eventName: DOMAIN_EVENT_NAMES.FILE_UPLOADED_V1,
      handlerCount: 0,
      handled: false,
      errors: [],
    }));
  });

  it('rejects unsupported domain event names', async () => {
    await expect(
      publishDomainEvent('user.created.v1', {
        name: 'user.created.v1',
      })
    ).rejects.toThrow('Unsupported domain event');
  });
});
