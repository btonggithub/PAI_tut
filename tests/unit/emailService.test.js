jest.mock('../../src/services/email/providers/consoleEmailProvider', () => ({
  sendEmail: jest.fn().mockResolvedValue({
    messageId: 'console-123456',
    provider: 'console',
    sentAt: new Date(),
  }),
}));

const emailService = require('../../src/services/email/emailService');
const { EMAIL_PROVIDERS } = require('../../src/services/email/emailService');

describe('Email service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('sends email through console provider by default', async () => {
      const emailParams = {
        to: 'user@example.com',
        subject: 'Test Subject',
        body: 'Test body',
      };

      const result = await emailService.sendEmail(emailParams);

      expect(result).toBeDefined();
      expect(result.provider).toBe('console');
    });

    it('sends email through specified provider', async () => {
      const emailParams = {
        to: 'user@example.com',
        subject: 'Test Subject',
        body: 'Test body',
      };

      const result = await emailService.sendEmail(emailParams, EMAIL_PROVIDERS.CONSOLE);

      expect(result).toBeDefined();
      expect(result.provider).toBe('console');
    });

    it('throws error for unknown provider', async () => {
      const emailParams = {
        to: 'user@example.com',
        subject: 'Test Subject',
        body: 'Test body',
      };

      await expect(emailService.sendEmail(emailParams, 'unknown')).rejects.toThrow();
    });
  });

  describe('EMAIL_PROVIDERS', () => {
    it('should have CONSOLE provider', () => {
      expect(EMAIL_PROVIDERS.CONSOLE).toBe('console');
    });
  });

  describe('getProvider', () => {
    it('returns console provider', () => {
      const provider = emailService.getProvider(EMAIL_PROVIDERS.CONSOLE);
      expect(provider).toBeDefined();
    });

    it('returns console provider by default', () => {
      const provider = emailService.getProvider();
      expect(provider).toBeDefined();
    });

    it('throws error for unknown provider', () => {
      expect(() => emailService.getProvider('unknown')).toThrow();
    });
  });
});
