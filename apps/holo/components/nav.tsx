'use client';

import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import React from 'react';
import { SidebarTrigger } from './ui/sidebar';

export function Nav() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <header className="sticky h-[48px] top-0 right-0 isolate z-10 flex items-center justify-between py-2 px-3">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>

      <div className="flex gap-2 items-center">
        <Button
          variant="ghost"
          className="group/toggle extend-touch-target"
          onClick={toggleTheme}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4.5"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 3l0 18" />
            <path d="M12 9l4.65 -4.65" />
            <path d="M12 14.3l7.37 -7.37" />
            <path d="M12 19.6l8.85 -8.85" />
          </svg>
        </Button>
      </div>
    </header>
  );
}
