'use client';

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AlumnoProfile from "@/components/profile-alumno";
import EmpresaProfile from "@/components/profile-empresa";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  skills: string;
  experience: string;
  userType: string;
  // Campos de empresa
  companyName?: string;
  companyDescription?: string;
  website?: string;
  category?: string;
  foundedYear?: string;
  companySize?: string;
  logo?: string;
  location?: string;
  address?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSuccessfulLogin = (userData: any, source: 'google' | 'local' = 'local') => {
    const profile = {
      id: String(userData.id),
      email: userData.email || '',
      fullName: userData.fullName || 'Usuario',
      userType: userData.tipo_usuario || userData.userType,
    }
    
    localStorage.setItem('userId', profile.id);
    localStorage.setItem('userEmail', profile.email);
    localStorage.setItem('userFullName', profile.fullName);
    localStorage.setItem('userType', profile.userType);
    
    window.dispatchEvent(new Event("storage"));

    if (source === 'google') {
        toast({ title: "¡Éxito!", description: "Inicio de sesión con Google exitoso." });
    }
  };

  useEffect(() => {
    const processAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        
        if (result) {
          // --- Proceso de redirección de Google ---
          setIsLoading(true);
          const googleUser = result.user;
          const body = {
            email: googleUser.email,
            fullName: googleUser.displayName,
            googleId: googleUser.uid,
          };
          
          const response = await fetch('https://yopracticando.com/api/google-auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          const apiResult = await response.json();

          if (apiResult.success && apiResult.usuario) {
            handleSuccessfulLogin({ ...apiResult.usuario, email: body.email }, 'google');
            // Cargar el perfil inmediatamente después de un inicio de sesión exitoso con Google
            // El resto del perfil se cargará desde el localStorage abajo
          } else {
            throw new Error(apiResult.message || 'La API de Google devolvió un error.');
          }
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error de Autenticación',
          description: error.message || 'No se pudo completar el inicio de sesión.',
        });
        // Si hay un error, es posible que el usuario deba iniciar sesión de nuevo
        router.push('/login');
        return; // Detener la ejecución si la autenticación falla
      }

      // --- Cargar desde LocalStorage ---
      // Esto se ejecutará siempre, después de intentar procesar la redirección
      const localUserId = localStorage.getItem('userId');
      if (localUserId) {
        const profile: UserProfile = {
            id: localUserId,
            userType: localStorage.getItem('userType') || 'alumno',
            email: localStorage.getItem('userEmail') || '',
            fullName: localStorage.getItem('userFullName') || "Usuario",
            phone: localStorage.getItem('userPhone') || "",
            skills: localStorage.getItem('userSkills') || "",
            experience: localStorage.getItem('userExperience') || "",
            companyName: localStorage.getItem('userCompanyName') || (localStorage.getItem('userType') === 'empresa' ? (localStorage.getItem('userFullName') || '') : ''),
            companyDescription: localStorage.getItem('userCompanyDescription') || "",
            website: localStorage.getItem('userWebsite') || "",
            category: localStorage.getItem('userCategory') || "",
            foundedYear: localStorage.getItem('userFoundedYear') || "",
            companySize: localStorage.getItem('userCompanySize') || "",
            logo: localStorage.getItem('userLogo') || "",
            location: localStorage.getItem('userLocation') || "",
            address: localStorage.getItem('userAddress') || "",
        };
        setUserProfile(profile);
      } else {
        // Si no hay redirección y no hay usuario en localStorage, redirigir a login
        toast({
            variant: "destructive",
            title: "Acceso Denegado",
            description: "Por favor, inicia sesión para continuar.",
        });
        router.push('/login');
        return;
      }
      setIsLoading(false);
    };

    processAuth();
  }, [router, toast]);

  if (isLoading || !userProfile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (userProfile.userType === 'alumno') {
    return <AlumnoProfile initialProfileData={userProfile} />;
  }
  
  if (userProfile.userType === 'empresa') {
    return <EmpresaProfile initialProfileData={userProfile} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <p>Tipo de usuario no reconocido. Por favor, contacta a soporte.</p>
    </div>
  );
}
