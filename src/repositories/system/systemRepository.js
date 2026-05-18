const BaseRepository = require('../base/BaseRepository');

const systemBaseRepository = new BaseRepository();

const fetchSystemInfo = async () => {
  systemBaseRepository.buildPagination({ page: 1, limit: 1 });

  return {
    service: 'PAI_tut Backend',
    version: 'v1',
    uptime: process.uptime(),
  };
};

module.exports = {
  fetchSystemInfo,
};
