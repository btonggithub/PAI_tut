const createEventPayload = (eventName, payload = {}) => {
  const {
    actor = null,
    resource = null,
    metadata = {},
    correlationId = null,
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
