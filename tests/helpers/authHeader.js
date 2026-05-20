const toAuthHeader = (token = 'mock-token') => {
  return { Authorization: `Bearer ${token}` };
};

module.exports = {
  toAuthHeader,
};
