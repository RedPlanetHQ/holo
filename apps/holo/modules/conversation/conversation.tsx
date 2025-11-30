'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, generateId, UIMessage } from 'ai';
import { ScrollAreaWithAutoScroll } from '@/components/scroll-area';
import { ConversationTextarea } from './conversation-textarea';
import React from 'react';
import { ConversationItem } from './conversation-item';

export const Conversation = () => {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <div className="flex h-[calc(100vh_-_64px)] w-full flex-col justify-end overflow-hidden pb-2">
      <ScrollAreaWithAutoScroll>
        {messages.map((message: UIMessage, index: number) => {
          return <ConversationItem key={index} message={message} />;
        })}
      </ScrollAreaWithAutoScroll>

      <div className="flex w-full flex-col items-center shrink-0">
        <div className="w-full px-1 pr-2">
          <ConversationTextarea
            className="bg-background-3 w-full"
            isLoading={status === 'streaming' || status === 'submitted'}
            placeholder="Ask me anything..."
            onConversationCreated={(message) => {
              if (message) {
                sendMessage({ text: message });
              }
            }}
            stop={() => stop()}
          />
        </div>
      </div>
    </div>
  );
};
