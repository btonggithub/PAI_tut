const createEventPayload = (eventName, payload = {}) => {
  const {
    actor = null,
    resource = null,
    metadata = {},
    requestContext = {},
    correlationId = requestContext.correlationId || null,
    occurredAt = new Date().toISOString(),
  } = payload;

  return {
    name: eventName,
    occurredAt,
    actor,
    resource,
    metadata,
    correlationId,
  };
};

module.exports = {
  createEventPayload,
};
