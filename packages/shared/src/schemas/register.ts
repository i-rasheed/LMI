import { z } from 'zod';
import { signupRoleSchema } from '../types/enums';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/\d/, 'Password must contain at least one number');

/** Nigerian phone: 10–11 digits; optional +234 prefix. */
export const phoneNumberSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .refine(
    (value) => /^(\+234|0)?[0-9]{10}$/.test(value),
    'Phone must be 10–11 digits (optional +234 prefix)',
  );

const registerBaseSchema = z.object({
  isOver16: z.literal(true, {
    errorMap: () => ({ message: 'You must be 16 or older to use LMI' }),
  }),
});

export const registerEmailSchema = registerBaseSchema.extend({
  method: z.literal('email'),
  email: z.string().email('Enter a valid email address'),
  password: passwordSchema,
});

export const registerPhoneSchema = registerBaseSchema.extend({
  method: z.literal('phone'),
  phone: phoneNumberSchema,
});

export const registerSchema = z.discriminatedUnion('method', [
  registerEmailSchema,
  registerPhoneSchema,
]);

export const verifyOtpSchema = z.object({
  phone: phoneNumberSchema,
  token: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must be numeric'),
});

export const roleSelectSchema = z.object({
  role: signupRoleSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RoleSelectInput = z.infer<typeof roleSelectSchema>;
