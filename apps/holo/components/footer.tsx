'use client';

import { useContext } from 'react';
import { HoloConfigContext } from '@/components/config-provider';

import { HoloConfig } from '@/types/schema';

export function Footer() {
  const holoConfig = useContext(HoloConfigContext) as HoloConfig;
  const currentYear = new Date().getFullYear();

  return (
    <div className="text-sm text-muted-foreground">
      Copyright © {holoConfig.name} {currentYear}
    </div>
  );
}
