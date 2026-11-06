import { createHmac, timingSafeEqual } from 'node:crypto';

export type PaymentWebhook = {
  paymentId: string;
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  providerOrderId?: string;
};

export async function createPaymentOrder(input: { paymentId: string; amountPaise: number; idempotencyKey: string; customerId: string }) {
  const provider = process.env.PAYMENT_PROVIDER;
  if (provider === 'mock') return { providerOrderId: `mock_${input.paymentId}`, checkoutUrl: null };
  if (provider !== 'http' || !process.env.PAYMENT_PROVIDER_URL) throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  const response = await fetch(process.env.PAYMENT_PROVIDER_URL, { method: 'POST', headers: { 'content-type': 'application/json', ...(process.env.PAYMENT_PROVIDER_TOKEN ? { authorization: `Bearer ${process.env.PAYMENT_PROVIDER_TOKEN}` } : {}) }, body: JSON.stringify({ amountPaise: input.amountPaise, idempotencyKey: input.idempotencyKey, customerId: input.customerId }) });
  if (!response.ok) throw new Error('PAYMENT_PROVIDER_ERROR');
  const result = await response.json() as { providerOrderId?: string; checkoutUrl?: string };
  if (!result.providerOrderId) throw new Error('PAYMENT_PROVIDER_ERROR');
  return { providerOrderId: result.providerOrderId, checkoutUrl: result.checkoutUrl ?? null };
}

export function verifyPaymentWebhook(rawBody: Buffer, signature: string | undefined): PaymentWebhook {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) throw new Error('PAYMENT_WEBHOOK_NOT_CONFIGURED');
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (provided.length !== expectedBuffer.length || !timingSafeEqual(provided, expectedBuffer)) throw new Error('INVALID_PAYMENT_SIGNATURE');
  const payload = JSON.parse(rawBody.toString('utf8')) as PaymentWebhook;
  if (!payload.paymentId || !['SUCCEEDED', 'FAILED', 'REFUNDED'].includes(payload.status)) throw new Error('INVALID_PAYMENT_WEBHOOK');
  return payload;
}

export function paymentProviderConfigured() {
  return Boolean(process.env.PAYMENT_PROVIDER && process.env.PAYMENT_PROVIDER !== 'unconfigured' && process.env.PAYMENT_WEBHOOK_SECRET);
}
