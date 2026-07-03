import { loginSchema, forgotPasswordSchema } from '../login';

describe('loginSchema', () => {
  it('accepts email login with password', () => {
    const result = loginSchema.safeParse({
      identifier: 'amaka@example.com',
      password: 'password1',
    });
    expect(result.success).toBe(true);
  });

  it('accepts phone login without password', () => {
    const result = loginSchema.safeParse({
      identifier: '08012345678',
    });
    expect(result.success).toBe(true);
  });

  it('rejects email login without password', () => {
    const result = loginSchema.safeParse({
      identifier: 'amaka@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid identifier', () => {
    const result = loginSchema.safeParse({
      identifier: 'not-valid',
      password: 'password1',
    });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(
      forgotPasswordSchema.safeParse({ email: 'amaka@example.com' }).success,
    ).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
  });
});
