'use client';

import Link from 'next/link';
import type { FC } from 'react';

export const Logo: FC = () => {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="YoPracticando Home">
      <div className="w-8 h-8 flex items-center justify-center">
         <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-primary"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M50 2.5L95.5 26.25V73.75L50 97.5L4.5 73.75V26.25L50 2.5Z"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinejoin="round"
            />
            <text
                x="50"
                y="62"
                fontFamily="Poppins, sans-serif"
                fontSize="48"
                fontWeight="bold"
                textAnchor="middle"
                fill="currentColor"
            >
                YP
            </text>
        </svg>
      </div>
      <span id="site-logo-text" className="font-headline text-xl font-bold tracking-tight">
        YoPracticando
      </span>
    </Link>
  );
};
