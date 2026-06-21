const DOMAIN_EVENT_NAMES = require('../../src/services/event/domainEventNames');
const {
  createDomainEventPayload,
  buildUserRegisteredPayload,
  buildUserEmailVerifiedPayload,
  buildFileUploadedPayload,
  sanitizeMetadata,
} = require('../../src/services/event/domainEventPayload');

describe('domain event payloads', () => {
  it('centralizes versioned domain event names', () => {
    expect(DOMAIN_EVENT_NAMES).toEqual({
      USER_REGISTERED_V1: 'user.registered.v1',
      USER_EMAIL_VERIFIED_V1: 'user.email_verified.v1',
      FILE_UPLOADED_V1: 'file.uploaded.v1',
    });
  });

  it('builds a versioned user registered payload', () => {
    const payload = buildUserRegisteredPayload({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: 'user',
        password: 'secret-password',
      },
      requestContext: { correlationId: 'request-1' },
      occurredAt: '2026-06-21T00:00:00.000Z',
    });

    expect(payload).toEqual({
      name: DOMAIN_EVENT_NAMES.USER_REGISTERED_V1,
      version: 'v1',
      occurredAt: '2026-06-21T00:00:00.000Z',
      owner: { domain: 'user' },
      actor: { id: 'user-1', role: 'user' },
      resource: { type: 'user', id: 'user-1' },
      metadata: {
        email: 'user@example.com',
        role: 'user',
        emailVerified: false,
      },
      correlationId: 'request-1',
    });
    expect(payload).not.toHaveProperty('password');
  });

  it('builds a user email verified payload', () => {
    const payload = buildUserEmailVerifiedPayload({
      userId: 'user-1',
      email: 'user@example.com',
      requestContext: { correlationId: 'verify-1' },
      occurredAt: '2026-06-21T00:00:00.000Z',
    });

    expect(payload).toEqual(expect.objectContaining({
      name: DOMAIN_EVENT_NAMES.USER_EMAIL_VERIFIED_V1,
      version: 'v1',
      owner: { domain: 'user' },
      resource: { type: 'user', id: 'user-1' },
      metadata: { email: 'user@example.com' },
      correlationId: 'verify-1',
    }));
  });

  it('builds a file uploaded payload without private storage fields', () => {
    const payload = buildFileUploadedPayload({
      actor: { id: 'user-1', role: 'user' },
      file: {
        _id: 'file-1',
        ownerId: 'user-1',
        mimeType: 'text/plain',
        size: 512,
        extension: 'txt',
        storageProvider: 'local',
        storageKey: 'private-key',
        path: 'C:/private/path',
        status: 'active',
      },
    });

    expect(payload).toEqual(expect.objectContaining({
      name: DOMAIN_EVENT_NAMES.FILE_UPLOADED_V1,
      version: 'v1',
      owner: { domain: 'file' },
      actor: { id: 'user-1', role: 'user' },
      resource: { type: 'file', id: 'file-1' },
    }));
    expect(payload.metadata).toEqual({
      ownerId: 'user-1',
      mimeType: 'text/plain',
      size: 512,
      extension: 'txt',
      storageProvider: 'local',
      status: 'active',
    });
    expect(JSON.stringify(payload)).not.toContain('private-key');
    expect(JSON.stringify(payload)).not.toContain('private/path');
  });

  it('sanitizes sensitive metadata recursively', () => {
    const metadata = sanitizeMetadata({
      safe: 'value',
      password: 'secret',
      accessToken: 'token',
      nested: {
        refreshTokenHash: 'hash',
        keep: 'yes',
      },
    });

    expect(metadata).toEqual({
      safe: 'value',
      nested: {
        keep: 'yes',
      },
    });
  });

  it('rejects unsupported domain event names', () => {
    expect(() => createDomainEventPayload('user.created.v1', {
      resource: { type: 'user', id: 'user-1' },
    })).toThrow('Unsupported domain event');
  });
});
