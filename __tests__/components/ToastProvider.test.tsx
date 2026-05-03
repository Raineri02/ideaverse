import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { ToastProvider } from '../../src/components/ToastProvider';

// Unmock toast for this test — we need the REAL registerToast
jest.unmock('../../src/utils/toast');
const { toast } = require('../../src/utils/toast');

describe('ToastProvider', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ToastProvider />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows success toast message', async () => {
    const { getByText } = render(<ToastProvider />);

    act(() => {
      toast('Projeto salvo com sucesso!');
    });

    await waitFor(() => {
      expect(getByText('Projeto salvo com sucesso!')).toBeTruthy();
    });
  });

  it('shows error toast message', async () => {
    const { getByText } = render(<ToastProvider />);

    act(() => {
      toast('Erro ao salvar', 'error');
    });

    await waitFor(() => {
      expect(getByText('Erro ao salvar')).toBeTruthy();
    });
  });

  it('shows info toast message', async () => {
    const { getByText } = render(<ToastProvider />);

    act(() => {
      toast('Dica do sistema', 'info');
    });

    await waitFor(() => {
      expect(getByText('Dica do sistema')).toBeTruthy();
    });
  });

  it('shows multiple toasts simultaneously', async () => {
    const { getByText } = render(<ToastProvider />);

    act(() => {
      toast('Primeiro toast');
      toast('Segundo toast', 'error');
    });

    await waitFor(() => {
      expect(getByText('Primeiro toast')).toBeTruthy();
      expect(getByText('Segundo toast')).toBeTruthy();
    });
  });

  it('removes toast after timeout', async () => {
    jest.useFakeTimers();
    const { getByText, queryByText } = render(<ToastProvider />);

    act(() => {
      toast('Toast temporário');
    });

    await waitFor(() => expect(getByText('Toast temporário')).toBeTruthy());

    act(() => {
      jest.advanceTimersByTime(3100);
    });

    await waitFor(() => {
      expect(queryByText('Toast temporário')).toBeNull();
    });

    jest.useRealTimers();
  });
});
