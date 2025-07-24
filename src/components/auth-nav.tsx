'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LayoutDashboard, LogOut, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  type: string;
}

export function AuthNav() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = useCallback((silent = false) => {
    auth.signOut().then(() => {
      Object.keys(localStorage).forEach(key => {
          if (key.startsWith('user')) {
              localStorage.removeItem(key);
          }
      });
      localStorage.removeItem('userId');
      
      setUser(null);
      if (!silent) {
         toast({ title: 'Éxito', description: 'Sesión cerrada correctamente.' });
      }
      
      window.dispatchEvent(new Event("storage"));
      router.push('/');
      router.refresh();
    });
  }, [router, toast]);

  useEffect(() => {
    const handleStorageChange = () => {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userType = localStorage.getItem('userType');
      const userFullName = localStorage.getItem('userFullName');

      if (userId && userEmail && userType && userFullName) {
        setUser({ id: userId, email: userEmail, type: userType, fullName: userFullName });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        if (!firebaseUser && localStorage.getItem('userId')) {
             handleLogout(true); // Call logout if firebase is signed out but localstorage persists
        } else if (firebaseUser && !localStorage.getItem('userId')) {
             // Firebase has a user, but local storage is empty.
             // This can happen on a new tab. We need to fetch user data.
             // For now, we rely on the profile page to set the local storage.
             // A more advanced implementation might fetch profile data here.
        }
    });

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        unsubscribe();
    };
  }, [handleLogout]);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

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
  const avatarUrl = user.fullName 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random`;

  return (
     <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
           <Avatar className="h-9 w-9">
              <AvatarImage src={avatarUrl} alt={user.fullName} />
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
        <DropdownMenuItem onClick={() => handleLogout(false)}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
