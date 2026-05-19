const request = require('supertest');
const app = require('../../src/app');

describe('Health API integration', () => {
  it('GET /api/v1/health returns standardized success response', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Success',
      data: {
        status: 'ok',
      },
    });
  });
});
