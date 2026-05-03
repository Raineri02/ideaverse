import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { supabase } from '../../src/lib/supabase';
import { router } from 'expo-router';
import { toast } from '../../src/utils/toast';

const mockToast = toast as jest.Mock;

import RegisterScreen from '../../app/auth/register';

describe('RegisterScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all fields', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    expect(getByPlaceholderText('Seu nome')).toBeTruthy();
    expect(getByPlaceholderText('seu@email.com')).toBeTruthy();
    expect(getByPlaceholderText('Mínimo 6 caracteres')).toBeTruthy();
  });

  it('renders create account button', () => {
    const { getByText } = render(<RegisterScreen />);
    expect(getByText('Criar conta')).toBeTruthy();
  });

  it('shows error when fields are empty', async () => {
    const { getByText } = render(<RegisterScreen />);
    fireEvent.press(getByText('Criar conta'));
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith('Preencha todos os campos', 'error'));
  });

  it('shows error when password is too short', async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('Seu nome'), 'João');
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'joao@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 6 caracteres'), '123');
    fireEvent.press(getByText('Criar conta'));
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('Senha deve ter pelo menos 6 caracteres', 'error'),
    );
  });

  it('calls supabase signUp with correct data', async () => {
    (supabase.auth.signUp as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('Seu nome'), 'João Silva');
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'joao@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 6 caracteres'), 'senha123');
    fireEvent.press(getByText('Criar conta'));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'joao@test.com',
        password: 'senha123',
        options: { data: { full_name: 'João Silva' } },
      });
    });
  });

  it('redirects to login after successful registration', async () => {
    (supabase.auth.signUp as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('Seu nome'), 'João');
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'joao@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 6 caracteres'), 'senha123');
    fireEvent.press(getByText('Criar conta'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/auth/login'));
  });

  it('shows friendly error when email already registered', async () => {
    (supabase.auth.signUp as jest.Mock) = jest.fn().mockResolvedValue({
      error: { message: 'User already registered' },
    });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('Seu nome'), 'João');
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), 'joao@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 6 caracteres'), 'senha123');
    fireEvent.press(getByText('Criar conta'));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('Este e-mail já está cadastrado', 'error'),
    );
  });

  it('trims name and email before submitting', async () => {
    (supabase.auth.signUp as jest.Mock) = jest.fn().mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('Seu nome'), '  João Silva  ');
    fireEvent.changeText(getByPlaceholderText('seu@email.com'), '  joao@test.com  ');
    fireEvent.changeText(getByPlaceholderText('Mínimo 6 caracteres'), 'senha123');
    fireEvent.press(getByText('Criar conta'));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'joao@test.com',
          options: { data: { full_name: 'João Silva' } },
        }),
      );
    });
  });

  it('navigates back when "Entrar" link is pressed', () => {
    const { getByText } = render(<RegisterScreen />);
    fireEvent.press(getByText(/Entrar/));
    expect(router.back).toHaveBeenCalled();
  });
});
