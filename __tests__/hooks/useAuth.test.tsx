import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAuth, AuthProvider } from '../../src/hooks/useAuth';
import { supabase } from '../../src/lib/supabase';
import React from 'react';

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@ideaverse.com',
    user_metadata: { full_name: 'João Silva' },
  },
  access_token: 'fake-token',
};

const mockUnsubscribe = jest.fn();
const mockAuthChange = { data: { subscription: { unsubscribe: mockUnsubscribe } } };

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function setupAuthMock(session: any = null, onChangeCb?: (cb: any) => void) {
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session } });
  (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((cb) => {
    if (onChangeCb) onChangeCb(cb);
    return mockAuthChange;
  });
}

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe.mockClear();
  });

  it('starts with loading true and null session', () => {
    setupAuthMock(null);
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('sets session when user is logged in', async () => {
    setupAuthMock(mockSession);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user?.email).toBe('test@ideaverse.com');
  });

  it('sets null session when no user is logged in', async () => {
    setupAuthMock(null);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('updates session when auth state changes', async () => {
    let authCallback: any;
    setupAuthMock(null, (cb) => { authCallback = cb; });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toBeNull();

    act(() => authCallback('SIGNED_IN', mockSession));
    await waitFor(() => expect(result.current.session).toEqual(mockSession));
  });

  it('clears session on signOut', async () => {
    setupAuthMock(mockSession);
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.session).toEqual(mockSession));

    await act(async () => { await result.current.signOut(); });
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(result.current.session).toBeNull();
  });

  it('unsubscribes from auth changes on unmount', async () => {
    setupAuthMock(null);
    const { unmount } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {});
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('exposes signOut function', async () => {
    setupAuthMock(null);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.signOut).toBe('function');
  });
});
