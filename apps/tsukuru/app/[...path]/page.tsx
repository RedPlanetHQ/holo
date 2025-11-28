'use client';

import { HoloConfigContext } from '@/components/config-provider';
import { HoloConfigType } from '@/components/type';
import { MDXContent } from '@/components/ui/mdx-content';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

export default function AllRoutes() {
  const pathname = usePathname();

  return (
    <div>
      <MDXContent fileName={`${pathname.slice(1)}.mdx`} />
    </div>
  );
}
