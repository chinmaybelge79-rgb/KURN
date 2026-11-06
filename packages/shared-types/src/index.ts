import { z } from 'zod';
const USER_ROLES = ['CONSUMER', 'GYM_OWNER', 'TRAINER', 'ADMIN'] as const;
export const roleSchema = z.enum(USER_ROLES);
export const apiEnvelopeSchema = z.object({
  success: z.boolean(), message: z.string(), data: z.unknown(), meta: z.unknown().nullable(),
});
export type ApiEnvelope<T> = { success: true; message: string; data: T; meta: unknown | null };
export type ApiError = { success: false; message: string; error: { code: string; details?: unknown } };

export const locationSchema = z.object({
  city: z.string().min(1), state: z.string().min(1), locality: z.string().optional(), pinCode: z.string().regex(/^\d{6}$/).optional(),
  latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(),
});
