const extractRequestContext = (req) => {
  return {
    correlationId: req.correlationId || req.get('x-correlation-id') || req.get('x-request-id') || null,
    ipAddress: req.ip || req.connection.remoteAddress || null,
    userAgent: req.get('user-agent') || null,
  };
};

module.exports = {
  extractRequestContext,
};
