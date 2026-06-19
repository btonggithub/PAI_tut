const eventBus = require('./eventBus');
const EVENT_NAMES = require('./eventNames');
const { createEventPayload } = require('./eventPayload');
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
  createEventPayload,
  registerEventHandlers,
  resetEventHandlers,
  getRegisteredHandlerCount,
  registerInternalEventHandlers,
  bootstrapInternalEvents,
};
