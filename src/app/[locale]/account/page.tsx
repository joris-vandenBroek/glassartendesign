import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GlassPanel } from '@/components/GlassPanel';
import { AccountDashboard } from '@/components/account/AccountDashboard';

export default async function AccountPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-ink via-charcoal to-graphite px-4 pb-16 pt-24 sm:px-8">
      <GlassPanel className="mx-auto mb-10 !max-w-5xl text-center">
        <h1 className="text-2xl font-light text-white sm:text-3xl">{t('myAccount')}</h1>
      </GlassPanel>

      <AccountDashboard />
    </main>
  );
}
