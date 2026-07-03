import { z } from 'zod';

export const deviceTokenSchema = z.object({
  expoPushToken: z.string().trim().min(10),
  deviceId: z.string().trim().max(200).optional(),
  platform: z.enum(['ios', 'android']),
});

export type DeviceTokenInput = z.infer<typeof deviceTokenSchema>;
