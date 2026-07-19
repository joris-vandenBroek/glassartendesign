export interface MockConversation {
  id: string;
  date: string;
  time: string;
  messageKey: string;
}

export const MOCK_CONVERSATIONS: MockConversation[] = [
  { id: 'CONV-1', date: '2026-07-10', time: '14:32', messageKey: 'conversation1' },
  { id: 'CONV-2', date: '2026-06-24', time: '10:05', messageKey: 'conversation2' },
  { id: 'CONV-3', date: '2026-06-02', time: '16:47', messageKey: 'conversation3' },
  { id: 'CONV-4', date: '2026-05-11', time: '09:18', messageKey: 'conversation4' },
];
