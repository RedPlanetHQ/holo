'use client';

import { HoloConfigContext } from '@/components/config-provider';

import { Loader } from '@/components/ui/loader';
import { HoloConfig } from '@/types/schema';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useContext } from 'react';

export default function Home() {
  const holoConfig = useContext(HoloConfigContext) as HoloConfig;
  const router = useRouter();
  const group = holoConfig.navigation[0];

  React.useEffect(() => {
    const route = group.pages[0];
    router.push(route);
  }, []);

  return <Loader />;
}
