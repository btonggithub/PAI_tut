const eventBus = require('./eventBus');

const registerEventHandlers = (registrations = []) => {
  return registrations.map(({ eventName, handler }) => eventBus.subscribe(eventName, handler));
};

const resetEventHandlers = () => {
  eventBus.clearHandlers();
};

module.exports = {
  registerEventHandlers,
  resetEventHandlers,
};
