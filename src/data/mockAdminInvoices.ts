export interface AdminInvoice {
  invoiceNumber: string;
  date: string;
  companyName: string;
  amount: number;
  status: 'Te betalen' | 'Betaald';
}

export const MOCK_ADMIN_INVOICES: AdminInvoice[] = [
  { invoiceNumber: 'INV-3051', date: '2026-06-20', companyName: 'Hotel De Zilveren Zwaan', amount: 645, status: 'Te betalen' },
  { invoiceNumber: 'INV-3038', date: '2026-06-05', companyName: 'Restaurant De Gouden Lepel', amount: 289, status: 'Te betalen' },
  { invoiceNumber: 'INV-3021', date: '2026-05-22', companyName: 'Wellness Oase', amount: 1240.5, status: 'Te betalen' },
  { invoiceNumber: 'INV-2987', date: '2026-04-30', companyName: 'Kantoor Van Dijk & Partners', amount: 410, status: 'Betaald' },
  { invoiceNumber: 'INV-2965', date: '2026-04-14', companyName: 'Hotel De Zilveren Zwaan', amount: 875, status: 'Betaald' },
  { invoiceNumber: 'INV-2942', date: '2026-03-28', companyName: 'Restaurant De Gouden Lepel', amount: 320, status: 'Betaald' },
];

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' }).replace(/ /g, ' ');
}
