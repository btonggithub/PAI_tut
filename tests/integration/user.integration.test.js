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

  it('GET /api/v1/users validates query before controller', async () => {
    const response = await request(app)
      .get('/api/v1/users?page=0')
      .set(toAuthHeader());

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 400 });
  });

  it('GET /api/v1/users/:id validates params format', async () => {
    const response = await request(app)
      .get('/api/v1/users/not-an-object-id')
      .set(toAuthHeader());

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 400 });
  });
});
