import { EditorContent, useEditor } from '@tiptap/react';

import { useEffect, memo } from 'react';

import { type UIMessage } from 'ai';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { extensionsForConversation } from './editor-extensions';
import React from 'react';
import { HoloConfigContext } from '@/components/config-provider';
import { HoloConfig } from '@/types/schema';

interface AIConversationItemProps {
  message: UIMessage;
  isStreaming?: boolean;
}

function getMessage(message: string) {
  let finalMessage = message.replace('<final_response>', '');
  finalMessage = finalMessage.replace('</final_response>', '');
  finalMessage = finalMessage.replace('<question_response>', '');
  finalMessage = finalMessage.replace('</question_response>', '');

  return finalMessage;
}

const Tool = () => {
  const holoConfig = React.useContext(HoloConfigContext) as HoloConfig;

  return (
    <Button
      variant="link"
      full
      size="xl"
      className="flex justify-between gap-4 text-muted-foreground px-0 py-2"
    >
      <div className="flex items-center gap-2">
        {' '}
        {holoConfig.name} is thinking...
      </div>
    </Button>
  );
};

const ConversationItemComponent = ({
  message,
  isStreaming,
}: AIConversationItemProps) => {
  const isUser = message.role === 'user' || false;
  const textPart = message.parts.find((part) => part.type === 'text');

  const editor = useEditor({
    extensions: [...extensionsForConversation],
    editable: false,
    content: textPart ? getMessage(textPart.text) : '',
  });

  useEffect(() => {
    if (textPart) {
      editor?.commands.setContent(getMessage(textPart.text));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, isStreaming]);

  if (!message) {
    return null;
  }

  const getComponent = (part: any) => {
    if (part.type.includes('tool-') && isStreaming) {
      return <Tool />;
    }

    if (part.type.includes('text')) {
      return <EditorContent editor={editor} className="editor-container" />;
    }

    return null;
  };

  return (
    <div
      className={cn(
        'flex w-full gap-2 px-4 pb-2',
        isUser && 'my-4 justify-end',
      )}
    >
      <div
        className={cn(
          'flex w-fit flex-col',
          isUser && 'bg-primary/20 max-w-[500px] rounded-md p-3',
        )}
      >
        {message.parts.map((part, index) => (
          <div key={index}>{getComponent(part)}</div>
        ))}
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ConversationItem = memo(
  ConversationItemComponent,
  (prevProps, nextProps) => {
    // Only re-render if the conversation history ID or message changed
    return (
      prevProps.message === nextProps.message &&
      nextProps.isStreaming === prevProps.isStreaming
    );
  },
);
