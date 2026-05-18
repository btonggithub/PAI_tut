const BaseRepository = require('../base/BaseRepository');

const healthBaseRepository = new BaseRepository();

const fetchHealthStatus = async () => {
  healthBaseRepository.buildFilters({}, []);

  return {
    status: 'ok',
  };
};

module.exports = {
  fetchHealthStatus,
};
