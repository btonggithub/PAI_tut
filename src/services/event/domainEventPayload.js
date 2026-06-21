const DOMAIN_EVENT_NAMES = require('./domainEventNames');

const SENSITIVE_KEY_PARTS = [
  'password',
  'token',
  'tokenhash',
  'authorization',
  'bearer',
  'secret',
  'privatekey',
  'storagekey',
  'path',
];

const EVENT_OWNERS = Object.freeze({
  [DOMAIN_EVENT_NAMES.USER_REGISTERED_V1]: 'user',
  [DOMAIN_EVENT_NAMES.USER_EMAIL_VERIFIED_V1]: 'user',
  [DOMAIN_EVENT_NAMES.FILE_UPLOADED_V1]: 'file',
});

const toId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value._id) {
    return String(value._id);
  }

  if (value.id) {
    return String(value.id);
  }

  return String(value);
};

const getVersion = (eventName) => {
  const version = eventName.split('.').pop();
  if (!/^v\d+$/.test(version)) {
    throw new Error('Domain event name must include a version suffix');
  }

  return version;
};

const isSensitiveKey = (key) => {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part));
};

const sanitizeValue = (value) => {
  if (value === null || typeof value === 'undefined') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') {
    return sanitizeMetadata(value);
  }

  return value;
};

const sanitizeMetadata = (metadata = {}) => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  return Object.entries(metadata).reduce((safeMetadata, [key, value]) => {
    if (isSensitiveKey(key)) {
      return safeMetadata;
    }

    return {
      ...safeMetadata,
      [key]: sanitizeValue(value),
    };
  }, {});
};

const toActor = (actor) => {
  if (!actor) {
    return null;
  }

  return sanitizeMetadata({
    id: toId(actor),
    role: actor.role || null,
  });
};

const createDomainEventPayload = (eventName, payload = {}) => {
  const ownerDomain = EVENT_OWNERS[eventName];
  if (!ownerDomain) {
    throw new Error(`Unsupported domain event: ${eventName}`);
  }

  const {
    actor = null,
    resource,
    metadata = {},
    requestContext = {},
    correlationId = requestContext.correlationId || null,
    occurredAt = new Date().toISOString(),
  } = payload;

  if (!resource || !resource.type || !resource.id) {
    throw new Error('Domain event payload requires resource type and id');
  }

  return {
    name: eventName,
    version: getVersion(eventName),
    occurredAt,
    owner: {
      domain: ownerDomain,
    },
    actor: toActor(actor),
    resource: sanitizeMetadata({
      type: resource.type,
      id: String(resource.id),
    }),
    metadata: sanitizeMetadata(metadata),
    correlationId,
  };
};

const buildUserRegisteredPayload = ({ user, requestContext = {}, occurredAt } = {}) => {
  const userId = toId(user);
  return createDomainEventPayload(DOMAIN_EVENT_NAMES.USER_REGISTERED_V1, {
    actor: user,
    resource: { type: 'user', id: userId },
    metadata: {
      email: user && user.email,
      role: user && user.role,
      emailVerified: Boolean(user && user.emailVerified),
    },
    requestContext,
    occurredAt,
  });
};

const buildUserEmailVerifiedPayload = ({
  userId,
  email,
  actor = null,
  requestContext = {},
  occurredAt,
} = {}) => {
  return createDomainEventPayload(DOMAIN_EVENT_NAMES.USER_EMAIL_VERIFIED_V1, {
    actor,
    resource: { type: 'user', id: userId },
    metadata: { email },
    requestContext,
    occurredAt,
  });
};

const buildFileUploadedPayload = ({ file, actor, requestContext = {}, occurredAt } = {}) => {
  const fileId = toId(file);
  return createDomainEventPayload(DOMAIN_EVENT_NAMES.FILE_UPLOADED_V1, {
    actor,
    resource: { type: 'file', id: fileId },
    metadata: {
      ownerId: file && file.ownerId ? String(file.ownerId) : actor && toId(actor),
      mimeType: file && file.mimeType,
      size: file && file.size,
      extension: file && file.extension,
      storageProvider: file && file.storageProvider,
      status: file && file.status,
    },
    requestContext,
    occurredAt,
  });
};

module.exports = {
  EVENT_OWNERS,
  createDomainEventPayload,
  buildUserRegisteredPayload,
  buildUserEmailVerifiedPayload,
  buildFileUploadedPayload,
  sanitizeMetadata,
};
