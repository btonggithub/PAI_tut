const request = require('supertest');
const app = require('../../src/app');

describe('Auth API integration', () => {
  it('POST /api/v1/auth/register validates request and returns standardized error shape', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'john@example.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 400 });
  });

  it('POST /api/v1/auth/login validates request and returns standardized error shape', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual({ status: 400 });
  });
});
