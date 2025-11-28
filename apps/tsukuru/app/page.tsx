'use client';

import { HoloConfigContext } from '@/components/config-provider';
import { HoloConfigType } from '@/components/type';
import { Loader } from '@/components/ui/loader';
import { useRouter } from 'next/router';
import React from 'react';
import { useContext } from 'react';

export default function Home() {
  const holoConfig = useContext(HoloConfigContext) as HoloConfigType;
  const router = useRouter();
  const group = holoConfig.navigation[0];

  React.useEffect(() => {
    const route = group.pages[0];
    router.push(route);
  }, []);

  return <Loader />;
}
