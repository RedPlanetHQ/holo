'use client';

import { MDXContent } from '@/components/ui/mdx-content';
import { usePathname } from 'next/navigation';

export default function AllRoutes() {
  const pathname = usePathname();

  return (
    <div>
      <MDXContent fileName={`${pathname.slice(1)}.mdx`} />
    </div>
  );
}
