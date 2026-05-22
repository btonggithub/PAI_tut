const request = require('supertest');
const app = require('../../src/app');
const { toAuthHeader } = require('../helpers/authHeader');

describe('User API integration', () => {
  it('GET /api/v1/users/me requires authentication', async () => {
    const response = await request(app).get('/api/v1/users/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 401 });
  });

  it('GET /api/v1/users requires authentication', async () => {
    const response = await request(app).get('/api/v1/users');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 401 });
  });

  it('GET /api/v1/users/:id requires authentication', async () => {
    const response = await request(app).get('/api/v1/users/64b7f5b9f1d2c3a4b5c6d7e8');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 401 });
  });

  it('GET /api/v1/users rejects invalid authentication token', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .set(toAuthHeader());

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 401 });
  });
});
