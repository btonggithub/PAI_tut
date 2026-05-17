const fetchSystemInfo = async () => {
  return {
    service: 'PAI_tut Backend',
    version: 'v1',
    uptime: process.uptime(),
  };
};

module.exports = {
  fetchSystemInfo,
};
