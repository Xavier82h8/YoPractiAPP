'use client';

import { Briefcase } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

export const Logo: FC = () => {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="YoPracticando Home">
      <Briefcase className="h-7 w-7 text-primary" />
      <span id="site-logo-text" className="font-headline text-xl font-bold tracking-tight">
        YoPracticando
      </span>
    </Link>
  );
};
