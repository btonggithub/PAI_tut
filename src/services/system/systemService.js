const AppError = require('../../utils/AppError');

const getSystemInfo = async (scope) => {
  if (scope && scope !== 'basic') {
    throw new AppError('Invalid scope parameter. Allowed value: basic', 400);
  }

  return {
    service: 'PAI_tut Backend',
    version: 'v1',
    uptime: process.uptime(),
  };
};

module.exports = {
  getSystemInfo,
};
