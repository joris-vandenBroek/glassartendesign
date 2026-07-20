import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { AdminLoginForm } from '@/components/beheer/AdminLoginForm';
import messages from '../../../messages/nl.json';

const loginMock = vi.fn();
const resetPasswordMock = vi.fn();

vi.mock('@/lib/useAdminAuth', () => ({
  useAdminAuth: () => ({
    login: loginMock,
    resetPassword: resetPasswordMock,
    logout: vi.fn(),
    user: null,
    isAdmin: false,
    isHydrated: true,
  }),
}));

function renderForm() {
  return render(
    <NextIntlClientProvider locale="nl" messages={messages}>
      <AdminLoginForm />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  loginMock.mockReset();
  resetPasswordMock.mockReset();
});

describe('AdminLoginForm', () => {
  it('calls login with the entered email and password on submit', async () => {
    loginMock.mockResolvedValue(undefined);
    renderForm();
    fireEvent.change(screen.getByTestId('beheer-login-email'), {
      target: { value: 'paul@glassartanddesign.com' },
    });
    fireEvent.change(screen.getByTestId('beheer-login-password'), {
      target: { value: 'geheim123' },
    });
    fireEvent.click(screen.getByTestId('beheer-login-submit'));
    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith('paul@glassartanddesign.com', 'geheim123')
    );
  });

  it('shows a generic error message when login fails', async () => {
    loginMock.mockRejectedValue(new Error('auth/wrong-password'));
    renderForm();
    fireEvent.change(screen.getByTestId('beheer-login-email'), {
      target: { value: 'paul@glassartanddesign.com' },
    });
    fireEvent.change(screen.getByTestId('beheer-login-password'), {
      target: { value: 'fout' },
    });
    fireEvent.click(screen.getByTestId('beheer-login-submit'));
    expect(await screen.findByTestId('beheer-login-error')).toBeInTheDocument();
  });

  it('shows a validation message when requesting a password reset without an email', async () => {
    renderForm();
    fireEvent.click(screen.getByTestId('beheer-forgot-password'));
    expect(await screen.findByTestId('beheer-reset-message')).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it('calls resetPassword and shows a confirmation when an email is filled in', async () => {
    resetPasswordMock.mockResolvedValue(undefined);
    renderForm();
    fireEvent.change(screen.getByTestId('beheer-login-email'), {
      target: { value: 'paul@glassartanddesign.com' },
    });
    fireEvent.click(screen.getByTestId('beheer-forgot-password'));
    await waitFor(() =>
      expect(resetPasswordMock).toHaveBeenCalledWith('paul@glassartanddesign.com')
    );
    expect(await screen.findByTestId('beheer-reset-message')).toBeInTheDocument();
  });
});
