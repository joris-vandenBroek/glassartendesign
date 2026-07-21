'use client';

import { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/lib/useCustomerAuth';
import { useRouter } from '@/i18n/navigation';
import { GlassPanel } from '@/components/GlassPanel';
import { AccountNav, type AccountSection } from './AccountNav';
import { OrdersSection } from './OrdersSection';
import { InvoicesDueSection } from './InvoicesDueSection';
import { InvoicesPaidSection } from './InvoicesPaidSection';
import { ReturnsSection } from './ReturnsSection';
import { ConversationsSection } from './ConversationsSection';
import { SettingsSection } from './SettingsSection';

const SECTION_COMPONENTS: Record<AccountSection, () => JSX.Element> = {
  orders: OrdersSection,
  invoicesDue: InvoicesDueSection,
  invoicesPaid: InvoicesPaidSection,
  returns: ReturnsSection,
  conversations: ConversationsSection,
  settings: SettingsSection,
};

export function AccountDashboard() {
  const { isCustomer, isHydrated } = useCustomerAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AccountSection>('orders');

  useEffect(() => {
    if (isHydrated && !isCustomer) {
      router.replace('/');
    }
  }, [isHydrated, isCustomer, router]);

  if (!isHydrated || !isCustomer) {
    return null;
  }

  const ActiveSectionComponent = SECTION_COMPONENTS[activeSection];

  return (
    <div
      data-testid="account-dashboard"
      className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]"
    >
      <GlassPanel className="w-full">
        <AccountNav activeSection={activeSection} onSelect={setActiveSection} />
      </GlassPanel>
      <GlassPanel className="w-full">
        <ActiveSectionComponent />
      </GlassPanel>
    </div>
  );
}
