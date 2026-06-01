/**
 * Console Email Provider
 * 
 * Initial email implementation that logs to console/logs
 * Useful for development and testing
 */

const consoleEmailProvider = {
  sendEmail: async ({ to, subject, body, html }) => {
    const timestamp = new Date().toISOString();
    const emailContent = {
      timestamp,
      to,
      subject,
      body: body || html,
    };

    // Log to console for development visibility
    console.log('[EMAIL SENT TO CONSOLE]', JSON.stringify(emailContent, null, 2));

    // In a real system, this would return send result metadata
    return {
      messageId: `console-${Date.now()}`,
      provider: 'console',
      sentAt: new Date(),
    };
  },
};

module.exports = consoleEmailProvider;
