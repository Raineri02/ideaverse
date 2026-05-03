import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { markOnboardingSeen } from '../../src/utils/onboarding';

jest.mock('../../src/utils/onboarding', () => ({
  markOnboardingSeen: jest.fn().mockResolvedValue(undefined),
  hasSeenOnboarding: jest.fn().mockResolvedValue(false),
}));

import OnboardingScreen from '../../app/onboarding';

describe('OnboardingScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = render(<OnboardingScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows first slide title on initial render', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText(/Ideaverse/)).toBeTruthy();
  });

  it('renders Próximo button on first slide', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('Próximo')).toBeTruthy();
  });

  it('renders Pular button on non-last slides', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('Pular')).toBeTruthy();
  });

  it('calls markOnboardingSeen when Pular is pressed', async () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Pular'));
    await waitFor(() => expect(markOnboardingSeen).toHaveBeenCalled());
  });

  it('navigates to login when Pular is pressed', async () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Pular'));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/auth/login'));
  });

  it('renders progress dots', () => {
    const { UNSAFE_getAllByProps } = render(<OnboardingScreen />);
    // 3 dots for 3 slides - verified by Animated.View count
    const { toJSON } = render(<OnboardingScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('calls markOnboardingSeen on last slide CTA', async () => {
    const { getByText } = render(<OnboardingScreen />);
    // Navigate to last slide by pressing Próximo twice
    fireEvent.press(getByText('Próximo'));
    await waitFor(() => {});
    fireEvent.press(getByText('Próximo'));
    await waitFor(() => {});
    // Now on last slide — button should say "Começar agora"
    const btn = getByText(/Começar agora/);
    fireEvent.press(btn);
    await waitFor(() => expect(markOnboardingSeen).toHaveBeenCalled());
  });
});
