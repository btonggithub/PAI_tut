/**
 * Storage Service - Orchestration Layer
 *
 * Delegates storage operations to configured provider.
 * Owns provider selection and coordination.
 */

const { STORAGE_PROVIDERS } = require('../../../config/upload');
const localStorageProvider = require('./providers/localStorageProvider');

const getProvider = (providerName) => {
  if (providerName === STORAGE_PROVIDERS.LOCAL) {
    return localStorageProvider;
  }
  throw new Error(`Unknown storage provider: ${providerName}`);
};

const storeFile = async (file, providerName = STORAGE_PROVIDERS.LOCAL) => {
  const provider = getProvider(providerName);
  const result = await provider.storeFile(file);

  return {
    storageKey: result.storageKey,
    storedName: result.storedName,
    storageProvider: providerName,
  };
};

const removeFile = async (storageKey, providerName = STORAGE_PROVIDERS.LOCAL) => {
  const provider = getProvider(providerName);
  await provider.removeFile(storageKey);
};

module.exports = {
  storeFile,
  removeFile,
  getProvider,
};
