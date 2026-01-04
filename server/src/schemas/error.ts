import z from 'zod';

export const ErrorResponseSchema = z
  .object({
    message: z.string().meta({ description: 'Error message' }),
    code: z.string().optional().meta({ description: 'Error code' }),
  })
  .describe('ErrorResponse')
  .meta({
    title: 'Error Response',
    description: 'Error response containing error message and optional error code',
  });
