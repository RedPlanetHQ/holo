'use client';

import * as React from 'react';
import { type LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';

// Hook to fetch metadata for a single page
function usePageMetadata(pageName: string) {
  const [metadata, setMetadata] = React.useState<{
    title: string;
    description?: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch(
          `/api/metadata?fileName=${encodeURIComponent(pageName)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch (error) {
        console.error(`Error fetching metadata for ${pageName}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata();
  }, [pageName]);

  return { metadata, loading };
}

function NavItem({
  item,
  pageName,
}: {
  item: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  };
  pageName: string;
}) {
  const { metadata, loading } = usePageMetadata(pageName);

  // Show loading state or use metadata title if available
  const displayTitle = React.useMemo(() => {
    if (loading) {
      return item.title; // Show fallback while loading
    }
    // Only show metadata title if it's not "Untitled"
    if (metadata?.title && metadata.title !== 'Untitled') {
      return metadata.title;
    }
    return item.title;
  }, [loading, metadata, item.title]);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={displayTitle}
        isActive={item.isActive}
        className="w-fit"
      >
        <Link href={item.url} className="max-w-[100%]">
          <item.icon />
          <span className="truncate">{displayTitle}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({
  label,
  items,
  pageNames,
}: {
  label?: string;
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
  pageNames: string[];
}) {
  return (
    <SidebarGroup>
      {label && (
        <div className="px-2 py-1.5 text-xs text-muted-foreground">{label}</div>
      )}
      <SidebarMenu>
        {items.map((item, index) => (
          <NavItem key={index} item={item} pageName={pageNames[index]} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
