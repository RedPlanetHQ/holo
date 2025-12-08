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

// Metadata cache context
type MetadataCache = Record<
  string,
  { title: string; description?: string } | null
>;
type MetadataLoadingState = Record<string, boolean>;

const MetadataCacheContext = React.createContext<{
  cache: MetadataCache;
  loading: MetadataLoadingState;
  fetchMetadata: (pageName: string) => void;
}>({
  cache: {},
  loading: {},
  fetchMetadata: () => {},
});

// Provider component to manage metadata cache
export function MetadataCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache, setCache] = React.useState<MetadataCache>({});
  const [loading, setLoading] = React.useState<MetadataLoadingState>({});
  // Use ref to track what's being fetched to avoid dependency issues
  const fetchingRef = React.useRef<Set<string>>(new Set());

  const fetchMetadata = React.useCallback((pageName: string) => {
    // Skip if already cached or currently being fetched
    if (fetchingRef.current.has(pageName)) {
      return;
    }

    // Check cache using functional state update to get latest value
    setCache((currentCache) => {
      if (currentCache[pageName] !== undefined) {
        return currentCache;
      }

      // Mark as fetching
      fetchingRef.current.add(pageName);
      setLoading((prev) => ({ ...prev, [pageName]: true }));

      fetch(`/api/metadata?fileName=${encodeURIComponent(pageName)}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return null;
        })
        .then((data) => {
          setCache((prev) => ({ ...prev, [pageName]: data }));
        })
        .catch((error) => {
          console.error(`Error fetching metadata for ${pageName}:`, error);
          setCache((prev) => ({ ...prev, [pageName]: null }));
        })
        .finally(() => {
          setLoading((prev) => ({ ...prev, [pageName]: false }));
          fetchingRef.current.delete(pageName);
        });

      return currentCache;
    });
  }, []); // Empty deps - stable function

  const value = React.useMemo(
    () => ({ cache, loading, fetchMetadata }),
    [cache, loading, fetchMetadata],
  );

  return (
    <MetadataCacheContext.Provider value={value}>
      {children}
    </MetadataCacheContext.Provider>
  );
}

// Hook to fetch metadata for a single page with caching
function usePageMetadata(pageName: string) {
  const { cache, loading, fetchMetadata } =
    React.useContext(MetadataCacheContext);

  // Trigger fetch on mount if not already cached
  React.useEffect(() => {
    fetchMetadata(pageName);
  }, [pageName, fetchMetadata]);

  return {
    metadata: cache[pageName] ?? null,
    loading: loading[pageName] ?? true,
  };
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
        className="w-fit text-sm !font-normal"
      >
        <Link href={item.url} className="max-w-[100%] h-[28px]">
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
        <div className="px-2 py-1.5 text-xs text-muted-foreground capitalize">
          {label}
        </div>
      )}
      <SidebarMenu>
        {items.map((item, index) => (
          <NavItem key={index} item={item} pageName={pageNames[index]} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
