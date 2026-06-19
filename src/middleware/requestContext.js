const { randomUUID } = require('crypto');

const REQUEST_ID_HEADERS = ['x-correlation-id', 'x-request-id'];

const getIncomingCorrelationId = (req) => {
  for (const headerName of REQUEST_ID_HEADERS) {
    const value = req.get(headerName);

    if (value) {
      return value;
    }
  }

  return null;
};

const attachRequestContext = (req, res, next) => {
  const correlationId = getIncomingCorrelationId(req) || randomUUID();

  req.correlationId = correlationId;
  res.set('x-correlation-id', correlationId);

  next();
};

module.exports = attachRequestContext;