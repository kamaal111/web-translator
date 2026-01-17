import z from 'zod';

export type WebTranslatorContext = z.infer<typeof WebTranslatorContextSchema>;

export const WebTranslatorContextSchema = z.object({ locale: z.string().min(2).nullish() });
