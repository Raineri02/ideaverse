import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { supabase } from '../../src/lib/supabase';
import { router } from 'expo-router';
import { toast } from '../../src/utils/toast';

// toast is already mocked globally in jest.setup.ts via the supabase mock
// We just need to cast it for assertion
const mockToast = toast as jest.Mock;

// Import after mocks
import LoginScreen from '../../app/auth/login';

describe('LoginScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders email and password fields', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('seu@email.com')).toBeTruthy();
    expect(getByPlaceholderText('Sua senha')).toBeTruthy();
  });

  it('renders login button', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('renders link to register screen', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText(/Criar conta/)).toBeTruthy();
  });

  it('renders forgot password link', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Esqueci minha senha')).toBeTruthy();
  });

  it('shows error toast when fields are empty', async () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Entrar'));
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith('Preencha e-mail e senha', 'error'));
  });

  it('calls supabase signInWithPassword with correct credentials', async () => {
    (supabase.auth.signInWithPassword as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'senha123',
      });
    });
  });

  it('navigates to tabs on successful login', async () => {
    (supabase.auth.signInWithPassword as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(tabs)'));
  });

  it('shows friendly error on invalid credentials', async () => {
    (supabase.auth.signInWithPassword as jest.Mock) = jest.fn().mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'wrong@test.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), 'wrongpass');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('E-mail ou senha incorretos', 'error'),
    );
  });

  it('shows raw error message on unknown error', async () => {
    (supabase.auth.signInWithPassword as jest.Mock) = jest.fn().mockResolvedValue({
      error: { message: 'Email not confirmed' },
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('Email not confirmed', 'error'),
    );
  });

  it('toggles password visibility', () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText('Sua senha');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('navigates to register screen', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText(/Criar conta/));
    expect(router.push).toHaveBeenCalledWith('/auth/register');
  });

  it('navigates to forgot password screen', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Esqueci minha senha'));
    expect(router.push).toHaveBeenCalledWith('/auth/forgot');
  });

  it('trims whitespace from email before submitting', async () => {
    (supabase.auth.signInWithPassword as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), '  test@test.com  ');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'senha123',
      });
    });
  });
});
