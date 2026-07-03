import {
  registerSchema,
  verifyOtpSchema,
  phoneNumberSchema,
} from '../register';

describe('registerSchema', () => {
  it('accepts valid email registration', () => {
    const result = registerSchema.safeParse({
      method: 'email',
      email: 'amaka@example.com',
      password: 'password1',
      isOver16: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid phone registration', () => {
    const result = registerSchema.safeParse({
      method: 'phone',
      phone: '08012345678',
      isOver16: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects registration when under 16', () => {
    const result = registerSchema.safeParse({
      method: 'email',
      email: 'amaka@example.com',
      password: 'password1',
      isOver16: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects weak password without a number', () => {
    const result = registerSchema.safeParse({
      method: 'email',
      email: 'amaka@example.com',
      password: 'password',
      isOver16: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      method: 'email',
      email: 'not-an-email',
      password: 'password1',
      isOver16: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('phoneNumberSchema', () => {
  it('normalizes spaced phone numbers', () => {
    const result = phoneNumberSchema.safeParse('0801 234 5678');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('08012345678');
    }
  });

  it('accepts +234 prefix', () => {
    const result = phoneNumberSchema.safeParse('+2348012345678');
    expect(result.success).toBe(true);
  });

  it('rejects too-short phone', () => {
    const result = phoneNumberSchema.safeParse('12345');
    expect(result.success).toBe(false);
  });
});

describe('verifyOtpSchema', () => {
  it('accepts 6-digit OTP', () => {
    const result = verifyOtpSchema.safeParse({
      phone: '08012345678',
      token: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric OTP', () => {
    const result = verifyOtpSchema.safeParse({
      phone: '08012345678',
      token: '12ab56',
    });
    expect(result.success).toBe(false);
  });
});
