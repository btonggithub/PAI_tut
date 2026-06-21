const { createEventPayload } = require('./eventPayload');

const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
const noopLogger = {
  info: () => {},
  error: () => {},
};

const assertTestOnly = (methodName) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(`${methodName} is only available in test environment`);
  }
};

class EventBus {
  constructor({ logger = noopLogger } = {}) {
    this.handlers = new Map();
    this.logger = logger;
    this.metrics = {
      publishedCount: 0,
      handledCount: 0,
      failedCount: 0,
    };
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

  logInfo(payload) {
    if (this.logger && typeof this.logger.info === 'function') {
      this.logger.info(payload);
    }
  }

  logError(payload) {
    if (this.logger && typeof this.logger.error === 'function') {
      this.logger.error(payload);
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
    
    // Preserve domain event fields (version, owner) if present in input payload
    if (payload.version) {
      eventPayload.version = payload.version;
    }
    if (payload.owner) {
      eventPayload.owner = payload.owner;
    }
    
    const eventHandlers = Array.from(this.handlers.get(eventName) || []);
    const errors = [];
    const correlationId = eventPayload.correlationId;

    this.metrics.publishedCount += 1;
    this.logInfo({
      type: 'event.publish',
      eventName,
      correlationId,
      handlerCount: eventHandlers.length,
    });

    for (const handler of eventHandlers) {
      try {
        await handler(eventPayload);
        this.metrics.handledCount += 1;
        this.logInfo({
          type: 'event.handled',
          eventName,
          correlationId,
          handlerName: handler.name || 'anonymous',
        });
      } catch (err) {
        errors.push(err);
        this.metrics.failedCount += 1;
        this.logError({
          type: 'event.failed',
          eventName,
          correlationId,
          handlerName: handler.name || 'anonymous',
          error: {
            message: err.message,
            name: err.name,
          },
        });

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
    assertTestOnly('clearHandlers');
    this.handlers.clear();
  }

  resetMetrics() {
    assertTestOnly('resetMetrics');
    this.metrics = {
      publishedCount: 0,
      handledCount: 0,
      failedCount: 0,
    };
  }

  getMetrics() {
    return { ...this.metrics };
  }

  setLogger(logger = noopLogger) {
    this.logger = logger;
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
