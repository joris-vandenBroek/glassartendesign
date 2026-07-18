export interface MockOrder {
  id: string;
  date: string;
  messageKey: string;
}

export const MOCK_ORDERS: MockOrder[] = [
  { id: 'GD-10234', date: '2026-06-02', messageKey: 'order1' },
  { id: 'GD-10221', date: '2026-05-18', messageKey: 'order2' },
  { id: 'GD-10198', date: '2026-04-30', messageKey: 'order3' },
  { id: 'GD-10177', date: '2026-04-12', messageKey: 'order4' },
];
