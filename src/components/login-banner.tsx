'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LogIn } from 'lucide-react';

export function LoginBanner() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to true to avoid flash of content
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Check login status on the client side
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);

    const controlBanner = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > 50) { // Hide after scrolling down a bit
            if (isVisible) setIsVisible(false);
        } else {
            if (!isVisible) setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlBanner);
    return () => {
      window.removeEventListener('scroll', controlBanner);
    };
  }, [lastScrollY, isVisible]);

  // Don't render the banner if the user is logged in
  if (isLoggedIn) {
    return null;
  }

  return (
    <div
      className={cn(
        'sticky top-16 z-40 w-full bg-accent text-accent-foreground p-3 transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : '-translate-y-full absolute'
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <p className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          <span className="font-medium">¿Ya tienes una cuenta?</span>
        </p>
        <Button asChild variant="ghost" className="hover:bg-accent-foreground/20">
          <Link href="/login">Inicia Sesión</Link>
        </Button>
      </div>
    </div>
  );
}
