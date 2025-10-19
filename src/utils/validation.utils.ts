import { z } from 'zod';

export const memberValidationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  tz: z.string().min(1, 'Timezone is required'),
  email: z.string().email('Invalid email address')
});

export const aiMessageValidationSchema = z.object({
  memberId: z.number(),
  tone: z.string().optional(),
  locale: z.string().optional(),
  sendEmail: z.boolean().optional(),
  dryRunEmail: z.boolean().optional()
});
