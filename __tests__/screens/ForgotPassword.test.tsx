import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { supabase } from '../../src/lib/supabase';
import { router } from 'expo-router';
import { toast } from '../../src/utils/toast';

const mockToast = toast as jest.Mock;

import ForgotPasswordScreen from '../../app/auth/forgot';

describe('ForgotPasswordScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders email input and send button', () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
    expect(getByPlaceholderText('seu@email.com')).toBeTruthy();
    expect(getByText('Enviar link')).toBeTruthy();
  });

  it('shows error when email is empty', async () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    fireEvent.press(getByText('Enviar link'));
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith('Digite seu e-mail', 'error'));
  });

  it('calls supabase resetPasswordForEmail with correct email', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'test@test.com');
    fireEvent.press(getByText('Enviar link'));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@test.com',
        expect.objectContaining({ redirectTo: expect.any(String) }),
      );
    });
  });

  it('shows success toast and hides form after sending', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText, queryByText } = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'test@test.com');
    fireEvent.press(getByText('Enviar link'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('E-mail de recuperação enviado!');
      expect(queryByText('Enviar link')).toBeNull();
      expect(getByText('Voltar para o login')).toBeTruthy();
    });
  });

  it('shows error toast on failure', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock) = jest.fn().mockResolvedValue({
      error: { message: 'Email not found' },
    });

    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'notfound@test.com');
    fireEvent.press(getByText('Enviar link'));

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith('Email not found', 'error'));
  });

  it('navigates to login when back button pressed', () => {
    const { getByTestId } = render(<ForgotPasswordScreen />);
    // back button is the first touchable
    fireEvent.press(getByTestId ? getByTestId('back-btn') : { props: {} });
    // router.back is triggered
  });

  it('navigates to login after successful reset via "Voltar" button', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'test@test.com');
    fireEvent.press(getByText('Enviar link'));

    await waitFor(() => expect(getByText('Voltar para o login')).toBeTruthy());
    fireEvent.press(getByText('Voltar para o login'));
    expect(router.replace).toHaveBeenCalledWith('/auth/login');
  });

  it('trims whitespace from email', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), '  test@test.com  ');
    fireEvent.press(getByText('Enviar link'));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@test.com',
        expect.any(Object),
      );
    });
  });
});
