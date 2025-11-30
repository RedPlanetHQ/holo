'use client';

import * as React from 'react';
import {
  FileText,
  Twitter,
  Github,
  Linkedin,
  MessageCircle,
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

// Hook to fetch metadata for all pages
function usePageMetadata() {
  const [metadata, setMetadata] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch('/api/metadata');
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata();
  }, []);

  return { metadata, loading };
}

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
  const { metadata } = usePageMetadata();

  // Decode pathname to handle URL-encoded characters (e.g., %20 for spaces)
  const decodedPathname = decodeURIComponent(pathname);

  // Build navigation from holo.json - preserve groups
  const navGroups =
    holoConfig.navigation?.map((group) => ({
      label: group.group,
      items: group.pages.map((page) => {
        const pageName = page.split('/').pop() || page;
        const itemUrl = `/${page}`;

        // Get metadata for this page
        const pageMetadata = metadata[page];
        const title =
          pageMetadata?.title ||
          pageName.charAt(0).toUpperCase() + pageName.slice(1);

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
            <SidebarMenuButton size="md" asChild>
              <a href="/">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
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
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      {socials.length > 0 && (
        <SidebarFooter>
          <NavSecondary items={socials} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
