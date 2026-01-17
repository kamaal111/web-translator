import z from 'zod';

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export type SignUpPayload = z.infer<typeof SignUpPayloadSchema>;

export const LoginPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  callbackURL: z.url().optional(),
});

export const SignUpPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  name: z
    .string()
    .trim()
    .min(3)
    .refine(val => val === val.trim(), {
      message: 'Name must not have leading or trailing spaces',
    })
    .refine(val => /^[^\s]+(\s[^\s]+)+$/.test(val), {
      message: 'Name must contain at least 2 words separated by single spaces',
    })
    .refine(val => val.split(/\s+/).every(word => /[a-zA-Z]/.test(word)), {
      message: 'Each word must contain at least one letter',
    }),
  callbackURL: z.url().optional(),
});
