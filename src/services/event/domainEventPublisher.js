const env = require('../../config/env');
const eventBus = require('./eventBus');
const DOMAIN_EVENT_NAMES = require('./domainEventNames');
const {
  buildUserRegisteredPayload,
  buildUserEmailVerifiedPayload,
  buildFileUploadedPayload,
} = require('./domainEventPayload');

const supportedDomainEventNames = new Set(Object.values(DOMAIN_EVENT_NAMES));

const publishDomainEvent = async (eventName, payload, options = {}) => {
  if (!supportedDomainEventNames.has(eventName)) {
    throw new Error(`Unsupported domain event: ${eventName}`);
  }

  if (!env.INTERNAL_EVENTS_ENABLED) {
    return {
      eventName,
      payload,
      handlerCount: 0,
      handled: false,
      errors: [],
      skipped: true,
    };
  }

  return eventBus.publish(eventName, payload, options);
};

const publishUserRegistered = async ({ user, requestContext = {} } = {}) => {
  return publishDomainEvent(
    DOMAIN_EVENT_NAMES.USER_REGISTERED_V1,
    buildUserRegisteredPayload({ user, requestContext })
  );
};

const publishUserEmailVerified = async ({
  userId,
  email,
  actor = null,
  requestContext = {},
} = {}) => {
  return publishDomainEvent(
    DOMAIN_EVENT_NAMES.USER_EMAIL_VERIFIED_V1,
    buildUserEmailVerifiedPayload({ userId, email, actor, requestContext })
  );
};

const publishFileUploaded = async ({ file, actor, requestContext = {} } = {}) => {
  return publishDomainEvent(
    DOMAIN_EVENT_NAMES.FILE_UPLOADED_V1,
    buildFileUploadedPayload({ file, actor, requestContext })
  );
};

module.exports = {
  publishDomainEvent,
  publishUserRegistered,
  publishUserEmailVerified,
  publishFileUploaded,
};
