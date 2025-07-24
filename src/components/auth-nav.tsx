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

  const handleLogout = useCallback(() => {
    auth.signOut().then(() => {
      // Limpiar solo los datos relacionados con el usuario en localStorage
      Object.keys(localStorage).forEach(key => {
          if (key.startsWith('user') || key === 'userId') {
              localStorage.removeItem(key);
          }
      });
      setUser(null);
      toast({ title: 'Éxito', description: 'Sesión cerrada correctamente.' });
      window.dispatchEvent(new Event("storage"));
      router.push('/');
      router.refresh();
    });
  }, [router, toast]);

  useEffect(() => {
    const handleStorageChange = () => {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        const userEmail = localStorage.getItem('userEmail');
        const userType = localStorage.getItem('userType');
        const userFullName = localStorage.getItem('userFullName');
        setUser({ id: userId, email: userEmail || '', type: userType || '', fullName: userFullName || 'Usuario' });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    
    handleStorageChange(); // Llamada inicial para establecer el estado

    window.addEventListener('storage', handleStorageChange);
    
    // Escucha cambios en el estado de autenticación de Firebase
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        if (!firebaseUser && user) {
            // Si Firebase dice que no hay usuario pero localmente sí, cerramos sesión
            handleLogout();
        }
    });

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        unsubscribe(); // Limpiar el listener de Firebase
    };
  }, [handleLogout, user]); // Añadir 'user' como dependencia

  if (loading) {
    return <div className="h-10 w-10 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
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
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random&color=fff`;

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
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
