
import Link from 'next/link';
import { Logo } from './logo';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { HeaderClient } from './header-client';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="block px-2 py-1 text-lg">
                Home
              </Link>
              <Link href="/#featured-internships" className="block px-2 py-1 text-lg">
                Internships
              </Link>
              <Link href="/profile" className="block px-2 py-1 text-lg">
                Profile
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        
        <HeaderClient />
      </div>
    </header>
  );
}
