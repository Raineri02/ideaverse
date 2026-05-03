import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSeenOnboarding, markOnboardingSeen } from '../../src/utils/onboarding';

const ONBOARDING_KEY = '@ideaverse:onboarding_seen';

describe('onboarding utility', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('returns false when onboarding has never been seen', async () => {
    const result = await hasSeenOnboarding();
    expect(result).toBe(false);
  });

  it('returns true after markOnboardingSeen is called', async () => {
    await markOnboardingSeen();
    const result = await hasSeenOnboarding();
    expect(result).toBe(true);
  });

  it('stores correct key in AsyncStorage', async () => {
    await markOnboardingSeen();
    const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
    expect(stored).toBe('true');
  });

  it('returns false when AsyncStorage returns null', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const result = await hasSeenOnboarding();
    expect(result).toBe(false);
  });

  it('returns false gracefully when AsyncStorage throws', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
    const result = await hasSeenOnboarding();
    expect(result).toBe(false);
  });

  it('does not throw when AsyncStorage setItem fails', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
    await expect(markOnboardingSeen()).resolves.not.toThrow();
  });

  it('calling markOnboardingSeen twice keeps value true', async () => {
    await markOnboardingSeen();
    await markOnboardingSeen();
    const result = await hasSeenOnboarding();
    expect(result).toBe(true);
  });
});
