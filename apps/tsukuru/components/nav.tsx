'use client';

import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';
import { HoloConfigContext } from './config-provider';
import { HoloConfigType } from './type';

export function Nav() {
  const pathname = usePathname();
  const holoConfig = useContext(HoloConfigContext) as HoloConfigType;

  const getDefaultValue = () => {
    const group = holoConfig.navigation.find((group) =>
      group.pages.includes(pathname.slice(1)),
    );

    return group?.group;
  };

  return (
    <nav className="sticky top-0 right-0 isolate z-10 flex items-center justify-between py-4 px-5 bg-background">
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

      <div className="flex gap-1">
        {holoConfig.socials.github && (
          <a href={holoConfig.socials.github} target="_blank">
            GitHub
          </a>
        )}
      </div>
    </nav>
  );
}
