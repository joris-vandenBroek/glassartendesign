export interface MockInvoice {
  id: string;
  date: string;
  amount: string;
  status: 'te-betalen' | 'betaald';
  messageKey: string;
}

export const MOCK_INVOICES: MockInvoice[] = [
  { id: 'INV-3051', date: '2026-06-20', amount: '€ 645,00', status: 'te-betalen', messageKey: 'invoice1' },
  { id: 'INV-3038', date: '2026-06-05', amount: '€ 289,00', status: 'te-betalen', messageKey: 'invoice2' },
  { id: 'INV-3021', date: '2026-05-22', amount: '€ 1.240,00', status: 'te-betalen', messageKey: 'invoice3' },
  { id: 'INV-2987', date: '2026-04-30', amount: '€ 410,00', status: 'betaald', messageKey: 'invoice4' },
  { id: 'INV-2965', date: '2026-04-14', amount: '€ 875,00', status: 'betaald', messageKey: 'invoice5' },
  { id: 'INV-2942', date: '2026-03-28', amount: '€ 320,00', status: 'betaald', messageKey: 'invoice6' },
];
