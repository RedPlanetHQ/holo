'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, generateId, UIMessage } from 'ai';
import { ScrollAreaWithAutoScroll } from '@/components/scroll-area';
import { ConversationTextarea } from './conversation-textarea';
import React from 'react';
import { ConversationItem } from './conversation-item';
import { HoloConfigContext } from '@/components/config-provider';
import { HoloConfig } from '@/types/schema';
import Image from 'next/image';

export const Conversation = () => {
  const holoConfig = React.useContext(HoloConfigContext) as HoloConfig;
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fade-in overflow-hidden h-full">
      <div className="flex flex-1 h-full w-full flex-col justify-end overflow-hidden pb-2">
        <ScrollAreaWithAutoScroll>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
              {holoConfig.image && (
                <div className="relative w-24 h-24 rounded-md overflow-hidden">
                  <Image
                    src={`/${holoConfig.image}`}
                    alt={holoConfig.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold">{holoConfig.name}</h1>
                {holoConfig.description && (
                  <p className="text-muted-foreground max-w-md">
                    {holoConfig.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            messages.map((message: UIMessage, index: number) => {
              return (
                <ConversationItem
                  key={index}
                  message={message}
                  isStreaming={
                    status === 'streaming' && index === messages.length - 1
                  }
                />
              );
            })
          )}
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
    </div>
  );
};
