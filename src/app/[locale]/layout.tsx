import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { NavBar } from '@/components/NavBar';
import { MockAuthProvider } from '@/lib/useMockAuth';
import { AdminAuthProvider } from '@/lib/useAdminAuth';
import { CartProvider } from '@/lib/useCart';
import { OrdersProvider } from '@/lib/useOrders';
import { ReturnsProvider } from '@/lib/useReturns';
import { MockProfileProvider } from '@/lib/useMockProfile';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AdminAuthProvider>
        <MockAuthProvider>
          <CartProvider>
            <OrdersProvider>
              <ReturnsProvider>
                <MockProfileProvider>
                  <NavBar />
                  {children}
                </MockProfileProvider>
              </ReturnsProvider>
            </OrdersProvider>
          </CartProvider>
        </MockAuthProvider>
      </AdminAuthProvider>
    </NextIntlClientProvider>
  );
}
