const mongoose = require('mongoose');
const Session = require('../../src/models/sessionModel');

describe('sessionModel', () => {
  it('defines a TTL index on expiresAt with expireAfterSeconds 0', () => {
    const indexes = Session.schema.indexes();
    const ttlIndex = indexes.find(([fields]) => fields.expiresAt === 1);

    expect(ttlIndex).toBeDefined();
    expect(ttlIndex[1]).toMatchObject({ expireAfterSeconds: 0 });
  });

  it('defines a migration-safe partial unique index on sessionId', () => {
    const indexes = Session.schema.indexes();
    const sessionIdIndex = indexes.find(([fields]) => fields.sessionId === 1);

    expect(sessionIdIndex).toBeDefined();
    expect(sessionIdIndex[1]).toMatchObject({
      unique: true,
      partialFilterExpression: {
        sessionId: { $type: 'string' },
      },
    });
    expect(Session.schema.path('sessionId').options.unique).toBeUndefined();
    expect(Session.schema.path('sessionId').options.required).toBeUndefined();
  });

  it('allows legacy session documents without sessionId to validate schema-level requirements', () => {
    const legacySession = new Session({
      userId: new mongoose.Types.ObjectId(),
      refreshTokenHash: 'hashed-refresh-token',
      expiresAt: new Date('2027-01-01T00:00:00.000Z'),
    });

    const error = legacySession.validateSync();

    expect(error?.errors?.sessionId).toBeUndefined();
  });
});