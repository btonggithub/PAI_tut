const AppError = require('../../utils/AppError');
const verificationRepository = require('../../repositories/email/verificationRepository');
const userRepository = require('../../repositories/user/userRepository');
const emailService = require('./emailService');
const { recordAuditEvent } = require('../audit/auditLogService');
const AUDIT_ACTIONS = require('../audit/auditActions');
const AUDIT_RESULTS = require('../audit/auditResults');
const { generateToken, hashToken } = require('../../utils/token');
const { VERIFICATION_TOKEN_TYPES } = require('../../models/verificationTokenModel');

// Token configuration
const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Build verification link for email
 * @param {string} token - Raw verification token
 * @returns {string} Full verification URL
 */
const buildVerificationLink = (token) => {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/v1/email/verify?token=${token}`;
};

/**
 * Generate verification email HTML
 * @param {string} token - Raw verification token
 * @param {string} userName - User's name
 * @returns {object} Email content
 */
const buildVerificationEmail = (token, userName) => {
  const link = buildVerificationLink(token);
  const subject = 'Verify Your Email Address';
  const html = `
    <h1>Email Verification</h1>
    <p>Hello ${userName},</p>
    <p>Please click the link below to verify your email address:</p>
    <a href="${link}">${link}</a>
    <p>This link will expire in 24 hours.</p>
  `;
  const body = `
    Email Verification
    
    Hello ${userName},
    
    Please visit this link to verify your email address:
    ${link}
    
    This link will expire in 24 hours.
  `;

  return {
    subject,
    html,
    body,
  };
};

/**
 * Send verification email to user
 * @param {object} user - User object with id, email, name
 * @param {object} requestContext - Request context for audit logging
 * @returns {Promise<object>} Result with token (raw) and metadata
 */
const sendVerificationEmail = async (user, requestContext = {}) => {
  if (!user || !user.id || !user.email) {
    throw new AppError('Invalid user object for verification email', 400);
  }

  try {
    // Invalidate any previous unverified tokens
    await verificationRepository.invalidatePreviousTokens(
      user.id,
      VERIFICATION_TOKEN_TYPES.EMAIL
    );

    // Generate cryptographically secure token
    const rawToken = generateToken();
    const tokenHash = await hashToken(rawToken);

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS);

    // Store hashed token in database
    const tokenRecord = await verificationRepository.createVerificationToken({
      userId: user.id,
      tokenHash,
      type: VERIFICATION_TOKEN_TYPES.EMAIL,
      expiresAt,
      metadata: {
        email: user.email,
      },
    });

    // Build and send email
    const emailContent = buildVerificationEmail(rawToken, user.name);
    await emailService.sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      body: emailContent.body,
    });

    // Record successful send verification email audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.EMAIL_SEND_VERIFICATION,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: user.id,
      actorRole: user.role,
      resourceType: 'verification_token',
      resourceId: tokenRecord._id,
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { email: user.email },
    }).catch(() => {});

    // Return token metadata (NOT including raw token to consumer)
    return {
      tokenId: tokenRecord._id,
      expiresAt,
      sentAt: new Date(),
    };
  } catch (err) {
    // Record failed send verification audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.EMAIL_SEND_VERIFICATION,
      result: AUDIT_RESULTS.FAILED,
      actorId: user.id,
      actorRole: user.role,
      resourceType: 'verification_token',
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: err.message, email: user.email },
    }).catch(() => {});

    throw err;
  }
};

/**
 * Verify user email using token
 * @param {string} userId - User ID
 * @param {string} rawToken - Raw verification token from email
 * @param {object} requestContext - Request context for audit logging
 * @returns {Promise<object>} Success metadata
 */
const verifyEmail = async (userId, rawToken, requestContext = {}) => {
  if (!userId || !rawToken) {
    throw new AppError('Invalid verification request', 400);
  }

  try {
    // Hash the provided token to match against stored hash
    const tokenHash = await hashToken(rawToken);

    // Find valid token (not yet used, not expired)
    const tokenRecord = await verificationRepository.findValidVerificationToken(
      userId,
      tokenHash,
      VERIFICATION_TOKEN_TYPES.EMAIL
    );

    if (!tokenRecord) {
      // Record failed verification audit event
      await recordAuditEvent({
        action: AUDIT_ACTIONS.EMAIL_VERIFY,
        result: AUDIT_RESULTS.FAILED,
        actorId: userId,
        resourceType: 'verification_token',
        ipAddress: requestContext.ipAddress || null,
        userAgent: requestContext.userAgent || null,
        metadata: { reason: 'invalid or expired token' },
      }).catch(() => {});

      throw new AppError('Invalid or expired verification token', 400);
    }

    // Mark token as used
    await verificationRepository.markTokenUsed(tokenRecord._id);

    // Update user's email verification status
    const updatedUser = await userRepository.updateUserProfile(userId, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    // Record successful verification audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.EMAIL_VERIFY,
      result: AUDIT_RESULTS.SUCCEEDED,
      actorId: userId,
      resourceType: 'verification_token',
      resourceId: tokenRecord._id,
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { email: tokenRecord.metadata.email },
    }).catch(() => {});

    // Return verification result
    return {
      userId,
      verifiedAt: new Date(),
      email: tokenRecord.metadata.email,
    };
  } catch (err) {
    // If error is already an AppError, rethrow it
    if (err.statusCode) {
      throw err;
    }

    // Record failed verification audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.EMAIL_VERIFY,
      result: AUDIT_RESULTS.FAILED,
      actorId: userId,
      resourceType: 'verification_token',
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: err.message },
    }).catch(() => {});

    throw err;
  }
};

/**
 * Resend verification email
 * @param {object} user - User object with id, email, name
 * @param {object} requestContext - Request context for audit logging
 * @returns {Promise<object>} Result with new token metadata
 */
const resendVerificationEmail = async (user, requestContext = {}) => {
  if (!user || !user.id || !user.email) {
    throw new AppError('Invalid user object for verification email', 400);
  }

  try {
    // Invalidate all previous unverified tokens
    await verificationRepository.invalidatePreviousTokens(
      user.id,
      VERIFICATION_TOKEN_TYPES.EMAIL
    );

    // Generate and send new verification email
    return await sendVerificationEmail(user, requestContext);
  } catch (err) {
    // Record failed resend verification audit event
    await recordAuditEvent({
      action: AUDIT_ACTIONS.EMAIL_RESEND_VERIFICATION,
      result: AUDIT_RESULTS.FAILED,
      actorId: user.id,
      actorRole: user.role,
      resourceType: 'verification_token',
      ipAddress: requestContext.ipAddress || null,
      userAgent: requestContext.userAgent || null,
      metadata: { reason: err.message, email: user.email },
    }).catch(() => {});

    throw err;
  }
};

module.exports = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
  buildVerificationEmail,
  buildVerificationLink,
};
