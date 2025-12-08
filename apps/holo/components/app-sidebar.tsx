'use client';

import * as React from 'react';
import {
  FileText,
  Twitter,
  Github,
  Linkedin,
  MessageCircle,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { HoloConfigContext } from '@/components/config-provider';

import { HoloConfig } from '@/types/schema';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

function buildSocials(config: HoloConfig) {
  return config.footer?.socials
    ? [
        ...(config.footer.socials.twitter
          ? [
              {
                title: 'Twitter',
                url: config.footer.socials.twitter,
                icon: Twitter,
              },
            ]
          : []),
        ...(config.footer.socials.github
          ? [
              {
                title: 'GitHub',
                url: config.footer.socials.github,
                icon: Github,
              },
            ]
          : []),
        ...(config.footer.socials.linkedin
          ? [
              {
                title: 'LinkedIn',
                url: config.footer.socials.linkedin,
                icon: Linkedin,
              },
            ]
          : []),
        ...(config.footer.socials.discord
          ? [
              {
                title: 'Discord',
                url: config.footer.socials.discord,
                icon: MessageCircle,
              },
            ]
          : []),
      ]
    : [];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const holoConfig = React.useContext(HoloConfigContext) as HoloConfig;
  const pathname = usePathname();
  const [showDisclaimer, setShowDisclaimer] = React.useState(true);

  // Decode pathname to handle URL-encoded characters (e.g., %20 for spaces)
  const decodedPathname = decodeURIComponent(pathname);

  // Check session storage for warning acknowledgment
  React.useEffect(() => {
    const warningAcknowledged = sessionStorage.getItem('warningAcknowledged');
    setShowDisclaimer(warningAcknowledged !== 'true');
  }, []);

  const handleDismissDisclaimer = () => {
    sessionStorage.setItem('warningAcknowledged', 'true');
    setShowDisclaimer(false);
  };

  // Build navigation from holo.json - preserve groups
  const navGroups =
    holoConfig.navigation?.map((group) => ({
      label: group.group,
      pages: group.pages,
      items: group.pages.map((page) => {
        const pageName = page.split('/').pop() || page;
        const itemUrl = `/${page}`;

        // Use fallback title - NavMain will fetch actual metadata
        const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);

        return {
          title,
          url: itemUrl,
          icon: FileText,
          isActive: decodedPathname === itemUrl,
        };
      }),
    })) || [];

  const socials = buildSocials(holoConfig);

  return (
    <Sidebar variant="inset" {...props} className="bg-background">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="md" asChild className="!bg-transparent">
              <a href="/">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {holoConfig.name}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain
            key={group.label}
            label={group.label}
            items={group.items}
            pageNames={group.pages}
          />
        ))}
      </SidebarContent>
      {socials.length > 0 && (
        <SidebarFooter>
          {showDisclaimer && (
            <Card className="relative">
              <CardContent className="p-4">
                <Button
                  className="absolute right-2 top-2 rounded"
                  variant="ghost"
                  size="xs"
                  onClick={handleDismissDisclaimer}
                >
                  <X size={14} />
                </Button>
                <p>
                  ⚠️ <strong>Disclaimer:</strong> This is a digital representation
                  of {holoConfig.name}'s knowledge. The information provided may
                  sometimes be incomplete or inaccurate. Neither CORE nor{' '}
                  {holoConfig.name} is responsible for any errors or omissions in
                  this content.
                </p>
              </CardContent>
            </Card>
          )}
          <NavSecondary items={socials} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
