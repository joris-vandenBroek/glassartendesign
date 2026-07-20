import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminAuthProvider, useAdminAuth } from '@/lib/useAdminAuth';

const onAuthStateChangedMock = vi.fn();
const signInMock = vi.fn();
const signOutMock = vi.fn();
const resetPasswordMock = vi.fn();
const getDocMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => onAuthStateChangedMock(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => signInMock(...args),
  signOut: (...args: unknown[]) => signOutMock(...args),
  sendPasswordResetEmail: (...args: unknown[]) => resetPasswordMock(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  getDoc: (...args: unknown[]) => getDocMock(...args),
}));

function TestConsumer() {
  const { user, isAdmin, isHydrated } = useAdminAuth();
  if (!isHydrated) return <div data-testid="loading" />;
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'none'}</div>
      <div data-testid="is-admin">{String(isAdmin)}</div>
    </div>
  );
}

function renderProvider() {
  return render(
    <AdminAuthProvider>
      <TestConsumer />
    </AdminAuthProvider>
  );
}

beforeEach(() => {
  onAuthStateChangedMock.mockReset();
  signInMock.mockReset();
  signOutMock.mockReset();
  resetPasswordMock.mockReset();
  getDocMock.mockReset();
});

describe('useAdminAuth', () => {
  it('reports isHydrated with no user when signed out', async () => {
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback(null);
      return () => {};
    });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('user')).toBeInTheDocument());
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
  });

  it('reports isAdmin true when a medewerkers document exists for the signed-in user', async () => {
    getDocMock.mockResolvedValue({ exists: () => true });
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback({ uid: 'uid-1', email: 'paul@glassartanddesign.com' });
      return () => {};
    });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('is-admin')).toHaveTextContent('true'));
    expect(screen.getByTestId('user')).toHaveTextContent('paul@glassartanddesign.com');
  });

  it('reports isAdmin false when no medewerkers document exists for the signed-in user', async () => {
    getDocMock.mockResolvedValue({ exists: () => false });
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback({ uid: 'uid-2', email: 'onbekend@glassartanddesign.com' });
      return () => {};
    });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('is-admin')).toHaveTextContent('false'));
  });

  it('calls signInWithEmailAndPassword with the given credentials', async () => {
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback(null);
      return () => {};
    });
    signInMock.mockResolvedValue(undefined);
    let hookValue: ReturnType<typeof useAdminAuth> | null = null;
    function Capture() {
      hookValue = useAdminAuth();
      return null;
    }
    render(
      <AdminAuthProvider>
        <Capture />
      </AdminAuthProvider>
    );
    await waitFor(() => expect(hookValue?.isHydrated).toBe(true));
    await hookValue!.login('paul@glassartanddesign.com', 'geheim123');
    expect(signInMock).toHaveBeenCalledWith({}, 'paul@glassartanddesign.com', 'geheim123');
  });
});
