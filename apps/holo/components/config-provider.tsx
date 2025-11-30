'use client';

import { createContext, useContext, useState } from 'react';
import { HoloConfig as HoloConfigType } from '@/types/schema';

import { useDynamicFile } from '@/lib/use-dynamic-file';
import { Loader } from './ui/loader';

export const HoloConfigContext = createContext<HoloConfigType | undefined>(
  undefined,
);

export function HoloConfig({ children }: { children: React.ReactNode }) {
  const { data, loading } = useDynamicFile('holo.json');

  if (loading) {
    return <Loader />;
  }

  return (
    <HoloConfigContext.Provider value={data}>
      {children}
    </HoloConfigContext.Provider>
  );
}
