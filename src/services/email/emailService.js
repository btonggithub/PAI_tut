const consoleEmailProvider = require('./providers/consoleEmailProvider');

const EMAIL_PROVIDERS = {
  CONSOLE: 'console',
};

const getProvider = (providerName = EMAIL_PROVIDERS.CONSOLE) => {
  switch (providerName) {
    case EMAIL_PROVIDERS.CONSOLE:
      return consoleEmailProvider;
    default:
      throw new Error(`Unknown email provider: ${providerName}`);
  }
};

const sendEmail = async (params, providerName = EMAIL_PROVIDERS.CONSOLE) => {
  const provider = getProvider(providerName);
  return provider.sendEmail(params);
};

module.exports = {
  sendEmail,
  EMAIL_PROVIDERS,
  getProvider,
};
