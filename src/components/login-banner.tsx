'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LogIn } from 'lucide-react';

export function LoginBanner() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to true to avoid flash of content
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check login status on the client side
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!userId);
    // Show banner immediately if not logged in
    if (!userId) {
        setIsVisible(true);
    }

    let lastScrollY = window.scrollY;

    const controlBanner = () => {
      if (typeof window !== 'undefined') {
        // Hide on scroll down, show on scroll up
        if (window.scrollY > lastScrollY && window.scrollY > 100) { // If scrolling down
            if (isVisible) setIsVisible(false);
        } else { // If scrolling up
            if (!isVisible && !isLoggedIn) setIsVisible(true);
        }
        lastScrollY = window.scrollY;
      }
    };

    window.addEventListener('scroll', controlBanner);
    return () => {
      window.removeEventListener('scroll', controlBanner);
    };
  }, [isVisible, isLoggedIn]);

  // Don't render the banner if the user is logged in
  if (isLoggedIn) {
    return null;
  }

  return (
    <div
      className={cn(
        'sticky top-16 z-40 w-full bg-accent text-accent-foreground p-3 transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : '-translate-y-full'
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
