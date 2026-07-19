import { describe, expect, it } from 'vitest';
import { MOCK_CONVERSATIONS } from '@/data/mockConversations';

describe('MOCK_CONVERSATIONS', () => {
  it('contains exactly 4 mock conversations', () => {
    expect(MOCK_CONVERSATIONS).toHaveLength(4);
  });

  it('has a unique id and messageKey for every conversation', () => {
    expect(new Set(MOCK_CONVERSATIONS.map((c) => c.id)).size).toBe(MOCK_CONVERSATIONS.length);
    expect(new Set(MOCK_CONVERSATIONS.map((c) => c.messageKey)).size).toBe(MOCK_CONVERSATIONS.length);
  });
});
