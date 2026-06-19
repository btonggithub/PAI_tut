const env = require('../../config/env');
const { getRegisteredHandlerCount } = require('./eventRegistry');
const { registerInternalEventHandlers } = require('./internalEventHandlers');

const bootstrapInternalEvents = ({ enabled = env.INTERNAL_EVENTS_ENABLED, logger = console } = {}) => {
  if (!enabled) {
    return {
      enabled: false,
      registeredHandlers: 0,
    };
  }

  const countBefore = getRegisteredHandlerCount();
  registerInternalEventHandlers({ logger });
  const countAfter = getRegisteredHandlerCount();

  return {
    enabled: true,
    registeredHandlers: Math.max(countAfter - countBefore, 0),
  };
};

module.exports = {
  bootstrapInternalEvents,
};