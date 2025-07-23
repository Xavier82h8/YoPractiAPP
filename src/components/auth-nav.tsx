'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LayoutDashboard, LogOut } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  type: string;
}

export function AuthNav() {
  const [user, setUser] = useState<UserData | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = () => {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const userType = localStorage.getItem('userType');
        const userFullName = localStorage.getItem('userFullName');

        if (userId && userEmail && userType && userFullName) {
          setUser({ id: userId, email: userEmail, type: userType, fullName: userFullName });
        } else {
          setUser(null);
        }
    };
    
    // Initial check
    handleStorageChange();

    // Listen for storage changes to sync across tabs
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange)
    };
  }, []);

  const handleLogout = () => {
    // Clear all user data from localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user')) {
            localStorage.removeItem(key);
        }
    });
    
    // Update state and notify user
    setUser(null);
    toast({ title: 'Éxito', description: 'Sesión cerrada correctamente.' });
    
    // Dispatch storage event to notify other tabs
    window.dispatchEvent(new Event("storage"));

    // Redirect and refresh
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Registrarse</Link>
        </Button>
      </div>
    );
  }

  const userInitial = user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  return (
     <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
           <Avatar className="h-9 w-9">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user.fullName.replace(/\s/g, '+')}&background=random`} alt={user.fullName} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    