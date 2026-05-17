const healthRepository = require('../../repositories/health/healthRepository');

const getHealthStatus = async () => {
  return healthRepository.fetchHealthStatus();
};

module.exports = {
  getHealthStatus,
};
