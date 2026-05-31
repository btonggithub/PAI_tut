const extractRequestContext = (req) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || null,
    userAgent: req.get('user-agent') || null,
  };
};

module.exports = {
  extractRequestContext,
};
