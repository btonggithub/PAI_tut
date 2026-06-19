const { registerEventHandlers } = require('./eventRegistry');
const EVENT_NAMES = require('./eventNames');

const registerInternalEventHandlers = ({ logger = console } = {}) => {
  return registerEventHandlers([
    {
      key: 'internal.file-upload.persisted.observer.v1',
      eventName: EVENT_NAMES.FILE_UPLOAD_PERSISTED_INTERNAL,
      handler: async (eventPayload) => {
        if (logger && typeof logger.info === 'function') {
          logger.info({
            type: 'event.integration.fileUploadPersisted',
            eventName: eventPayload.name,
            correlationId: eventPayload.correlationId,
            resourceId: eventPayload.resource && eventPayload.resource.id,
          });
        }
      },
    },
  ]);
};

module.exports = {
  registerInternalEventHandlers,
};