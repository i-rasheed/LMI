import { profileSchema } from '../profile';

describe('profileSchema', () => {
  it('accepts valid profile', () => {
    expect(
      profileSchema.safeParse({
        displayName: 'Chukwuemeka',
        bio: 'Daily Mile 12 reporter.',
        languagePreference: 'en',
        themePreference: 'light',
      }).success,
    ).toBe(true);
  });

  it('requires display name', () => {
    expect(profileSchema.safeParse({ displayName: '' }).success).toBe(false);
  });

  it('rejects bio over 160 chars', () => {
    expect(
      profileSchema.safeParse({
        displayName: 'Vendor',
        bio: 'a'.repeat(161),
      }).success,
    ).toBe(false);
  });

  it('accepts empty bio string', () => {
    expect(
      profileSchema.safeParse({
        displayName: 'Amaka',
        bio: '',
      }).success,
    ).toBe(true);
  });
});
