'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { MetadataCacheProvider } from '@/components/nav-main';
import { Button } from '@/components/ui/button';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { MessageSquare } from 'lucide-react';
import { ThemeProvider } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

export const BaseLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { push } = useRouter();
  const pathname = usePathname();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 64)',
            '--header-height': 'calc(var(--spacing) * 12)',
            background: 'var(--background)',
          } as React.CSSProperties
        }
      >
        <MetadataCacheProvider>
          <AppSidebar />
        </MetadataCacheProvider>
        <SidebarInset className="bg-background-2">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              collapsible={false}
              className="rounded-md"
              order={1}
              id="home"
            >
              {children}
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarInset>
      </SidebarProvider>

      {pathname !== '/chat' && (
        <Button
          variant="default"
          className="fixed bottom-4 right-4 gap-2 h-10 text-md rounded-lg px-5"
          size="xl"
          onClick={() => {
            push('/chat');
          }}
        >
          <MessageSquare size={16} />
          Chat
        </Button>
      )}
    </ThemeProvider>
  );
};
