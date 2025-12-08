'use client';

import { Loader } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Home() {
  const router = useRouter();

  React.useEffect(() => {
    router.push('/chat');
  }, []);

  return <Loader />;
}
