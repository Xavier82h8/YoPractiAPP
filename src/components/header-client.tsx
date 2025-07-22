'use client';

import Link from 'next/link';
import { AuthNav } from './auth-nav';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';

export function HeaderClient() {
    return (
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="hidden md:flex md:items-center md:gap-4 text-sm">
                <Button variant="ghost" asChild>
                <Link href="/#featured-internships">Internships</Link>
                </Button>
                <AuthNav />
            </nav>
            <div className="flex items-center gap-2">
                <div className="md:hidden">
                <AuthNav />
                </div>
                <ThemeToggle />
            </div>
        </div>
    )
}
