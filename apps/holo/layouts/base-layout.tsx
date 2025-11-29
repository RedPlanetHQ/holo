'use client';

import { BaseLayoutContextType } from '@/components/type';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useLocalCommonState } from '@/hooks/storage';
import { Conversation } from '@/modules/conversation/conversation';
import { X } from 'lucide-react';
import { ThemeProvider } from 'next-themes';
import React, { createContext } from 'react';

export const BaseLayoutContext = createContext<
  BaseLayoutContextType | undefined
>(undefined);

export const BaseLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [size, setSize] = useLocalCommonState('panelSize', 15);
  const [rightSideCollapsed, setRightSideCollapsed] = React.useState(false);

  const onClose = () => {
    setRightSideCollapsed(true);
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <BaseLayoutContext.Provider
        value={{
          chatCollapsed: rightSideCollapsed,
          setChatCollapsed: setRightSideCollapsed,
        }}
      >
        <ResizablePanelGroup direction="horizontal" className="bg-background-2">
          <ResizablePanel
            collapsible={false}
            className="rounded-md"
            order={1}
            id="home"
          >
            {children}
          </ResizablePanel>
          {!rightSideCollapsed && (
            <>
              <ResizableHandle className="w-1" />

              <ResizablePanel
                className="bg-background pl-2 h-full"
                collapsible={false}
                maxSize={50}
                minSize={25}
                defaultSize={size}
                onResize={(size) => setSize(size)}
                order={2}
                id="rightScreen"
              >
                <header className="flex h-[48px] shrink-0 items-center justify-between gap-2 py-2">
                  <div className="flex items-center justify-between gap-2 px-2 w-full">
                    <div> Chat with me </div>
                    <div className="flex items-center">
                      <Button variant="ghost" onClick={onClose}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                </header>
                <Conversation />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </BaseLayoutContext.Provider>
    </ThemeProvider>
  );
};
