const systemRepository = require('../../repositories/system/systemRepository');

const getSystemInfo = async () => {
  return systemRepository.fetchSystemInfo();
};

module.exports = {
  getSystemInfo,
};
