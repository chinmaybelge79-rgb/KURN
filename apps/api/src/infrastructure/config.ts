export function validateProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return;
  const required = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
  if ((process.env.DATA_SOURCE ?? 'memory') !== 'database') throw new Error('DATA_SOURCE=database is required in production');
  if ((process.env.OTP_PROVIDER ?? 'console') === 'console') throw new Error('A real OTP_PROVIDER is required in production');
  if (process.env.OTP_PROVIDER === 'http' && !process.env.OTP_PROVIDER_URL) throw new Error('OTP_PROVIDER_URL is required when OTP_PROVIDER=http');
  if (process.env.PAYMENT_PROVIDER !== 'http') throw new Error('PAYMENT_PROVIDER=http with a real provider endpoint is required in production');
  if (!process.env.PAYMENT_PROVIDER_URL) throw new Error('PAYMENT_PROVIDER_URL is required in production');
  if (!process.env.PAYMENT_WEBHOOK_SECRET) throw new Error('PAYMENT_WEBHOOK_SECRET is required in production');
}
