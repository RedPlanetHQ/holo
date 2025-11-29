import { ScrollAreaWithAutoScroll } from '@/components/scroll-area';
import { ConversationTextarea } from './conversation-textarea';

export const Conversation = () => {
  return (
    <div className="flex h-[calc(100vh_-_48px)] w-full flex-col justify-end overflow-hidden py-4 pb-12 lg:pb-4">
      <ScrollAreaWithAutoScroll>
        <h2>asdf</h2>
      </ScrollAreaWithAutoScroll>

      <div className="flex w-full flex-col items-center shrink-0">
        <div className="w-full max-w-[90ch] px-1 pr-2">
          <ConversationTextarea
            className="bg-background-3 w-full border-1 border-gray-300"
            isLoading={status === 'streaming' || status === 'submitted'}
            placeholder="Ask me anything..."
            onConversationCreated={(message) => {
              if (message) {
                console.log(message);
              }
            }}
            stop={() => stop()}
          />
        </div>
      </div>
    </div>
  );
};
