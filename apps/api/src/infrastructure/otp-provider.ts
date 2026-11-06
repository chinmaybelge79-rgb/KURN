export type OtpProvider = 'console' | 'http';

export function otpProvider(): OtpProvider {
  const provider = process.env.OTP_PROVIDER ?? 'console';
  if (provider !== 'console' && provider !== 'http') throw new Error('OTP_PROVIDER_UNSUPPORTED');
  return provider;
}

export async function deliverOtp(phone: string, code: string) {
  if (otpProvider() === 'console') {
    console.info(`[KURN DEV OTP] ${phone}: ${code}`);
    return;
  }
  const url = process.env.OTP_PROVIDER_URL;
  if (!url) throw new Error('OTP_PROVIDER_NOT_CONFIGURED');
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(process.env.OTP_PROVIDER_TOKEN ? { authorization: `Bearer ${process.env.OTP_PROVIDER_TOKEN}` } : {}) }, body: JSON.stringify({ phone, code, channel: 'sms' }) });
  if (!response.ok) throw new Error('OTP_PROVIDER_ERROR');
}
