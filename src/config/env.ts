import 'dotenv/config';

export const env = {
  port: +(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  aiProvider: process.env.AI_PROVIDER || 'mock',
  openaiKey: process.env.OPENAI_API_KEY || '',
  emailProvider: process.env.EMAIL_PROVIDER || 'console',
  emailDryRun: (process.env.EMAIL_DRY_RUN || 'true') === 'true',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: +(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Datavid Planner <no-reply@datavid.test>'
  }
};
