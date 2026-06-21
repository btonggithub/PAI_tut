const eventBus = require('./eventBus');
const EVENT_NAMES = require('./eventNames');
const DOMAIN_EVENT_NAMES = require('./domainEventNames');
const { createEventPayload } = require('./eventPayload');
const {
  createDomainEventPayload,
  buildUserRegisteredPayload,
  buildUserEmailVerifiedPayload,
  buildFileUploadedPayload,
} = require('./domainEventPayload');
const domainEventPublisher = require('./domainEventPublisher');
const {
  registerEventHandlers,
  resetEventHandlers,
  getRegisteredHandlerCount,
} = require('./eventRegistry');
const { registerInternalEventHandlers } = require('./internalEventHandlers');
const { bootstrapInternalEvents } = require('./bootstrapInternalEvents');

module.exports = {
  eventBus,
  EventBus: eventBus.EventBus,
  EVENT_NAME_PATTERN: eventBus.EVENT_NAME_PATTERN,
  EVENT_NAMES,
  DOMAIN_EVENT_NAMES,
  createEventPayload,
  createDomainEventPayload,
  buildUserRegisteredPayload,
  buildUserEmailVerifiedPayload,
  buildFileUploadedPayload,
  domainEventPublisher,
  registerEventHandlers,
  resetEventHandlers,
  getRegisteredHandlerCount,
  registerInternalEventHandlers,
  bootstrapInternalEvents,
};
