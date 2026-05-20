const baseUserFixture = {
  id: '64b7f5b9f1d2c3a4b5c6d7e8',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

const makeUserFixture = (overrides = {}) => ({
  ...baseUserFixture,
  ...overrides,
});

module.exports = {
  baseUserFixture,
  makeUserFixture,
};
