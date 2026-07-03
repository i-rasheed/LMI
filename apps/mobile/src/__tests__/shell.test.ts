import { FREEMIUM_LIMITS } from '@lmi/shared';
import { colors } from '../theme/colors';

describe('mobile shell', () => {
  it('uses brand green from content guidelines', () => {
    expect(colors.green.primary).toBe('#0A8F52');
  });

  it('imports shared freemium limits', () => {
    expect(FREEMIUM_LIMITS.FAVOURITES).toBe(10);
  });
});
