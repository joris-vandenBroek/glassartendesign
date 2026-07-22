'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { GlassPanel } from '@/components/GlassPanel';
import { logActiviteit, actorFromMedewerker } from '@/lib/logActiviteit';
import { AdminLoginForm } from './AdminLoginForm';
import { BeheerShell } from './BeheerShell';

export function AdminDashboard() {
  const t = useTranslations('beheer');
  const { user, isAdmin, isHydrated, logout } = useAdminAuth();
  const hasSignedOutUnauthorized = useRef(false);
  const hasLoggedVisit = useRef(false);

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

  useEffect(() => {
    if (isHydrated && user && isAdmin && !hasLoggedVisit.current) {
      hasLoggedVisit.current = true;
      void logActiviteit('beheer_bezocht', actorFromMedewerker(user));
    }
  }, [isHydrated, user, isAdmin]);

  if (!isHydrated) {
    return null;
  }

  if (isUnauthorized) {
    return (
      <GlassPanel className="mx-auto !max-w-lg">
        <p data-testid="beheer-unauthorized" className="text-sm text-white/80">
          {t('unauthorized')}
        </p>
      </GlassPanel>
    );
  }

  if (!user) {
    return (
      <GlassPanel className="mx-auto !max-w-lg">
        <AdminLoginForm />
      </GlassPanel>
    );
  }

  return <BeheerShell email={user.email ?? ''} onLogout={() => logout()} />;
}
