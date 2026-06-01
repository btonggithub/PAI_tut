/**
 * Storage Service - Backward Compatibility Wrapper
 *
 * This file maintains backward compatibility.
 * All storage operations have been reorganized under ./storage/
 *
 * New code should import from ./storage/storageService
 */

module.exports = require('./storage/storageService');
