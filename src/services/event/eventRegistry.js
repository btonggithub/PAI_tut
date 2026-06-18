const eventBus = require('./eventBus');

const registeredHandlers = new Map();

const getRegistrationKey = ({ key }) => {
  if (key) {
    return key;
  }

  return null;
};

const registerEventHandlers = (registrations = []) => {
  return registrations.map((registration) => {
    const { eventName, handler } = registration;
    const registrationKey = getRegistrationKey(registration);

    if (registrationKey && registeredHandlers.has(registrationKey)) {
      return () => {};
    }

    const unsubscribe = eventBus.subscribe(eventName, handler);

    if (registrationKey) {
      registeredHandlers.set(registrationKey, unsubscribe);
    }

    return () => {
      unsubscribe();

      if (registrationKey) {
        registeredHandlers.delete(registrationKey);
      }
    };
  });
};

const resetEventHandlers = () => {
  eventBus.clearHandlers();
  registeredHandlers.clear();
};

const getRegisteredHandlerCount = () => {
  return registeredHandlers.size;
};

module.exports = {
  registerEventHandlers,
  resetEventHandlers,
  getRegisteredHandlerCount,
};
