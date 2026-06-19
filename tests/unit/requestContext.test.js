const attachRequestContext = require('../../src/middleware/requestContext');
const { extractRequestContext } = require('../../src/utils/requestContext');

describe('request context', () => {
  const createResponse = () => ({
    set: jest.fn(),
  });

  it('uses incoming correlation id and exposes it to request context extraction', () => {
    const req = {
      ip: '127.0.0.1',
      connection: {},
      get: jest.fn((headerName) => ({
        'x-correlation-id': 'incoming-correlation-123',
        'user-agent': 'jest-agent',
      }[headerName] || null)),
    };
    const res = createResponse();
    const next = jest.fn();

    attachRequestContext(req, res, next);

    expect(req.correlationId).toBe('incoming-correlation-123');
    expect(res.set).toHaveBeenCalledWith('x-correlation-id', 'incoming-correlation-123');
    expect(next).toHaveBeenCalledTimes(1);
    expect(extractRequestContext(req)).toEqual({
      correlationId: 'incoming-correlation-123',
      ipAddress: '127.0.0.1',
      userAgent: 'jest-agent',
    });
  });

  it('generates a correlation id when the request has none', () => {
    const req = {
      ip: '127.0.0.1',
      connection: {},
      get: jest.fn((headerName) => (headerName === 'user-agent' ? 'jest-agent' : null)),
    };
    const res = createResponse();
    const next = jest.fn();

    attachRequestContext(req, res, next);

    expect(req.correlationId).toEqual(expect.any(String));
    expect(res.set).toHaveBeenCalledWith('x-correlation-id', req.correlationId);
    expect(next).toHaveBeenCalledTimes(1);
  });
});