const consoleEmailProvider = require('../../src/services/email/providers/consoleEmailProvider');

describe('Console email provider', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('sendEmail', () => {
    it('logs email to console', async () => {
      const emailParams = {
        to: 'user@example.com',
        subject: 'Test Subject',
        body: 'Test body',
        html: '<p>Test HTML</p>',
      };

      await consoleEmailProvider.sendEmail(emailParams);

      expect(console.log).toHaveBeenCalled();
      const logCall = console.log.mock.calls[0];
      expect(logCall[0]).toContain('[EMAIL SENT TO CONSOLE]');
    });

    it('returns send result metadata', async () => {
      const emailParams = {
        to: 'user@example.com',
        subject: 'Test Subject',
        body: 'Test body',
      };

      const result = await consoleEmailProvider.sendEmail(emailParams);

      expect(result).toHaveProperty('messageId');
      expect(result).toHaveProperty('provider', 'console');
      expect(result).toHaveProperty('sentAt');
      expect(result.messageId).toContain('console-');
    });

    it('includes all email parameters in console output', async () => {
      const emailParams = {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test body',
      };

      await consoleEmailProvider.sendEmail(emailParams);

      const logCall = console.log.mock.calls[0];
      const loggedContent = logCall[1];
      expect(loggedContent).toContain('test@example.com');
      expect(loggedContent).toContain('Test Subject');
      expect(loggedContent).toContain('Test body');
    });

    it('includes text body in console output when provided', async () => {
      const emailParams = {
        to: 'user@example.com',
        subject: 'Test Subject',
        body: 'Text body',
        html: '<p>HTML body</p>',
      };

      await consoleEmailProvider.sendEmail(emailParams);

      const logCall = console.log.mock.calls[0];
      const loggedContent = logCall[1];
      expect(loggedContent).toContain('Text body');
    });
  });
});
