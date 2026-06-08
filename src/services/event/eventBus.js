const { createEventPayload } = require('./eventPayload');

const EVENT_NAME_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  validateEventName(eventName) {
    if (typeof eventName !== 'string' || !EVENT_NAME_PATTERN.test(eventName)) {
      throw new Error('Event name must use lowercase dot notation');
    }
  }

  validateHandler(handler) {
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function');
    }
  }

  subscribe(eventName, handler) {
    this.validateEventName(eventName);
    this.validateHandler(handler);

    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }

    const eventHandlers = this.handlers.get(eventName);
    eventHandlers.add(handler);

    return () => {
      eventHandlers.delete(handler);

      if (eventHandlers.size === 0) {
        this.handlers.delete(eventName);
      }
    };
  }

  async publish(eventName, payload = {}, options = {}) {
    this.validateEventName(eventName);

    const { throwOnError = false } = options;
    const eventPayload = createEventPayload(eventName, payload);
    const eventHandlers = Array.from(this.handlers.get(eventName) || []);
    const errors = [];

    for (const handler of eventHandlers) {
      try {
        await handler(eventPayload);
      } catch (err) {
        errors.push(err);

        if (throwOnError) {
          throw err;
        }
      }
    }

    return {
      eventName,
      payload: eventPayload,
      handlerCount: eventHandlers.length,
      handled: eventHandlers.length > 0,
      errors,
    };
  }

  clearHandlers() {
    this.handlers.clear();
  }

  getHandlerCount(eventName) {
    if (eventName) {
      this.validateEventName(eventName);
      return (this.handlers.get(eventName) || new Set()).size;
    }

    return Array.from(this.handlers.values()).reduce(
      (count, eventHandlers) => count + eventHandlers.size,
      0
    );
  }

  getEventNames() {
    return Array.from(this.handlers.keys());
  }
}

const eventBus = new EventBus();

module.exports = eventBus;
module.exports.EventBus = EventBus;
module.exports.EVENT_NAME_PATTERN = EVENT_NAME_PATTERN;
