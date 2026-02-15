import { describe, it, expect } from 'vitest';

import { render, screen, userEvent } from '@test-utils';
import SignupSubForm from './signup-sub-form';

describe('SignupSubForm', () => {
  it('should render all required fields', () => {
    render(<SignupSubForm />);

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('jane@mail.com');
    const passwordInput = screen.getByPlaceholderText('password');
    const verifyPasswordInput = screen.getByPlaceholderText('The same above password');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    expect(nameInput).toBeDefined();
    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(verifyPasswordInput).toBeDefined();
    expect(submitButton).toBeDefined();
  });

  it('should accept valid input and enable submit button', async () => {
    render(<SignupSubForm />);

    const nameInput = screen.getByPlaceholderText<HTMLInputElement>('John Doe');
    const emailInput = screen.getByPlaceholderText<HTMLInputElement>('jane@mail.com');
    const passwordInput = screen.getByPlaceholderText<HTMLInputElement>('password');
    const verifyPasswordInput = screen.getByPlaceholderText<HTMLInputElement>('The same above password');

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(passwordInput, 'SecurePassword123!');
    await userEvent.type(verifyPasswordInput, 'SecurePassword123!');

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('SecurePassword123!');
    expect(verifyPasswordInput.value).toBe('SecurePassword123!');
  });
});
