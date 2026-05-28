/**
 * Audit Result Constants
 *
 * Standardized result values for audit events.
 * Results indicate the outcome of an audited action.
 *
 * Examples:
 *   succeeded - action completed successfully
 *   failed - action failed (business logic failure)
 *   forbidden - action was denied (authorization failure)
 */

const AUDIT_RESULTS = {
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  FORBIDDEN: 'forbidden',
};

module.exports = AUDIT_RESULTS;
