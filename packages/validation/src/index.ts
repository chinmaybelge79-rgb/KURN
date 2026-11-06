import { z } from 'zod';

export const phoneSchema = z.string().regex(/^\+91[6-9]\d{9}$/, 'Enter a valid Indian mobile number');
export const sendOtpSchema = z.object({ phone: phoneSchema });
export const verifyOtpSchema = z.object({ phone: phoneSchema, code: z.string().regex(/^\d{6}$/) });
export const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
