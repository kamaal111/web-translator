import { describe, it, expect, vi } from 'vitest';

import z from 'zod';

import { render, screen, userEvent } from '@test-utils';
import Form from './form';

const TestSchema = z.object({
  email: z.email({ message: 'Invalid email' }),
  name: z.string().min(2),
});

describe('Form', () => {
  it('should submit form with correct values', async () => {
    const handleSubmit = vi.fn();

    const fields = [
      {
        id: 'email',
        placeholder: 'Enter email',
        label: 'Email',
        type: 'email',
      },
      {
        id: 'name',
        placeholder: 'Enter name',
        label: 'Name',
      },
    ] as const;

    render(<Form schema={TestSchema} fields={fields} onSubmit={handleSubmit} />);

    const emailInput = screen.getByPlaceholderText('Enter email');
    const nameInput = screen.getByPlaceholderText('Enter name');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(nameInput, 'John Doe');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({ email: 'test@example.com', name: 'John Doe' }, expect.anything());
  });
});
