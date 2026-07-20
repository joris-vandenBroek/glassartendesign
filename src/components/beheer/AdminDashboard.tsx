'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { AdminLoginForm } from './AdminLoginForm';
import { KlantAanvragenSection } from './KlantAanvragenSection';

export function AdminDashboard() {
  const t = useTranslations('beheer');
  const { user, isAdmin, isHydrated, logout } = useAdminAuth();
  const hasSignedOutUnauthorized = useRef(false);

  const isUnauthorized = isHydrated && !!user && !isAdmin;

  useEffect(() => {
    if (isUnauthorized && !hasSignedOutUnauthorized.current) {
      hasSignedOutUnauthorized.current = true;
      logout();
    }
    if (!isUnauthorized) {
      hasSignedOutUnauthorized.current = false;
    }
  }, [isUnauthorized, logout]);

  if (!isHydrated) {
    return null;
  }

  if (isUnauthorized) {
    return (
      <p data-testid="beheer-unauthorized" className="text-sm text-white/80">
        {t('unauthorized')}
      </p>
    );
  }

  if (!user) {
    return <AdminLoginForm />;
  }

  return (
    <div data-testid="beheer-dashboard" className="flex flex-col gap-4 text-sm text-white/80">
      <p data-testid="beheer-logged-in-as">{t('loggedInAs', { email: user.email ?? '' })}</p>
      <button
        type="button"
        onClick={() => logout()}
        data-testid="beheer-logout"
        className="self-start rounded-sm border border-white/20 px-4 py-2 text-xs tracking-wide text-white/70 hover:border-white/40 hover:text-white"
      >
        {t('logout')}
      </button>
      <KlantAanvragenSection />
    </div>
  );
}
