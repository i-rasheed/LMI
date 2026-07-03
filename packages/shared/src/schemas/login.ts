import { z } from 'zod';
import { phoneNumberSchema } from './register';

const emailSchema = z.string().email('Enter a valid email address');

export const loginSchema = z
  .object({
    identifier: z.string().trim().min(1, 'Enter your phone or email'),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isEmail = emailSchema.safeParse(data.identifier).success;
    const isPhone = phoneNumberSchema.safeParse(data.identifier).success;

    if (!isEmail && !isPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid phone number or email address',
        path: ['identifier'],
      });
      return;
    }

    if (isEmail && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required for email login',
        path: ['password'],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
