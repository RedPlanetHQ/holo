import * as React from 'react';
import { type LucideIcon } from 'lucide-react';

import { SidebarGroup, SidebarMenu } from '@/components/ui/sidebar';
import { Button } from './ui/button';

export function NavSecondary({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <div className="flex flex-col gap-2">
      <SidebarMenu className="flex gap-1">
        {items.map((item) => (
          <a href={item.url} target="_blank">
            <Button className="" variant="ghost">
              <item.icon size={16} />
            </Button>
          </a>
        ))}
      </SidebarMenu>
      <div className="px-2 text-center">
        Built with{' '}
        <a
          href="https://github.com/redplanethq/core"
          target="_blank"
          className="text-primary"
        >
          CORE
        </a>
      </div>
    </div>
  );
}
