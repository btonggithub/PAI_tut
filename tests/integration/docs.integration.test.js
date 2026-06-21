const request = require('supertest');
const app = require('../../src/app');

describe('API documentation integration', () => {
  it('GET /api/openapi.json returns the OpenAPI contract as JSON', async () => {
    const response = await request(app).get('/api/openapi.json');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.info).toEqual(expect.objectContaining({
      title: 'PAI Tut REST API',
      version: '1.0.0',
    }));
  });

  it('GET /api/docs serves the documentation page', async () => {
    const response = await request(app).get('/api/docs');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.text).toContain('/api/openapi.json');
  });

  it('documents required key API paths', async () => {
    const response = await request(app).get('/api/openapi.json');
    const paths = response.body.paths;

    expect(paths).toHaveProperty('/api/v1/health');
    expect(paths).toHaveProperty('/api/v1/auth/login');
    expect(paths).toHaveProperty('/api/v1/auth/register');
    expect(paths).toHaveProperty('/api/v1/files');
    expect(paths).toHaveProperty('/api/v1/files/upload');
    expect(paths).toHaveProperty('/api/v1/admin/users');
    expect(paths).toHaveProperty('/api/v1/admin/audit/logs');
  });

  it('defines bearer auth and shared response schemas', async () => {
    const response = await request(app).get('/api/openapi.json');
    const components = response.body.components;

    expect(components.securitySchemes).toHaveProperty('bearerAuth');
    expect(components.securitySchemes.bearerAuth).toEqual(expect.objectContaining({
      type: 'http',
      scheme: 'bearer',
    }));
    expect(components.schemas).toHaveProperty('SuccessResponse');
    expect(components.schemas).toHaveProperty('ErrorResponse');
    expect(components.schemas).toHaveProperty('ValidationErrorResponse');
    expect(components.schemas).toHaveProperty('PaginationMeta');
  });
});
