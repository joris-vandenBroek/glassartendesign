'use client';

import { useTranslations } from 'next-intl';
import { MOCK_CONVERSATIONS } from '@/data/mockConversations';

export function ConversationsSection() {
  const t = useTranslations('accountPage');
  const tConversations = useTranslations('accountPage.conversations');

  return (
    <div data-testid="conversations-section">
      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
        {t('navConversations')}
      </p>
      <ul className="flex flex-col gap-3">
        {MOCK_CONVERSATIONS.map((conversation) => (
          <li
            key={conversation.id}
            data-testid={`conversation-${conversation.id}`}
            className="text-xs text-white/80"
          >
            <div className="flex items-center justify-between">
              <span>{conversation.date}</span>
              <span className="text-white/50">{conversation.time}</span>
            </div>
            <p>{tConversations(`items.${conversation.messageKey}.topic`)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
