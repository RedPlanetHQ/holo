'use client';

import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';
import { HoloConfigContext } from './config-provider';
import { BaseLayoutContextType, HoloConfigType } from './type';
import { BaseLayoutContext } from '@/layouts/base-layout';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import React from 'react';

export function Nav() {
  const pathname = usePathname();
  const holoConfig = useContext(HoloConfigContext) as HoloConfigType;
  const { setChatCollapsed, chatCollapsed } = useContext(
    BaseLayoutContext,
  ) as BaseLayoutContextType;
  const { setTheme, resolvedTheme } = useTheme();

  const getDefaultValue = () => {
    const group = holoConfig.navigation.find((group) =>
      group.pages.includes(pathname.slice(1)),
    );

    return group?.group;
  };

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <nav className="sticky h-[48px] top-0 right-0 isolate z-10 flex items-center justify-between py-2 px-5">
      <Tabs defaultValue={getDefaultValue()} className="-pl-3">
        <TabsList className="flex w-full flex-wrap">
          {holoConfig.navigation.map((group) => {
            return (
              <TabsTrigger value={group.group}>
                <Link href={`/${group.pages[0]}`}>{group.group}</Link>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex gap-2 items-center">
        {holoConfig?.socials?.github && (
          <a href={holoConfig.socials.github} target="_blank">
            GitHub
          </a>
        )}
        <Button
          variant="secondary"
          isActive={!chatCollapsed}
          onClick={() => setChatCollapsed(!chatCollapsed)}
        >
          Chat with me
        </Button>
        <Button
          variant="ghost"
          className="group/toggle extend-touch-target"
          isActive={!chatCollapsed}
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
    </nav>
  );
}
