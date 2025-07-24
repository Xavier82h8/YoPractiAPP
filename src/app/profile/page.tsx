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

  // Mueve la función de login exitoso fuera del useEffect para que sea reutilizable
  const setupUserSession = (userData: any, source: 'google' | 'local' = 'local') => {
    const profile: UserProfile = {
      id: String(userData.id),
      email: userData.email,
      fullName: userData.fullName || userData.nombre_usuario || userData.nombre_empresa || 'Usuario',
      userType: userData.tipo_usuario || userData.userType,
      phone: userData.phone || userData.telefono || "",
      skills: userData.skills || userData.habilidades || "",
      experience: userData.experience || "",
      companyName: userData.companyName || userData.nombre_empresa || (userData.tipo_usuario === 'empresa' ? (userData.fullName || userData.nombre_usuario) : ''),
      companyDescription: userData.companyDescription || userData.descripcion_empresa || "",
      website: userData.website || "",
      category: userData.category || userData.categoria || "",
      foundedYear: userData.foundedYear || userData.ano_fundacion || "",
      companySize: userData.companySize || userData.tamano_empresa || "",
      logo: userData.logo || "",
      location: userData.location || userData.ubicacion || "",
      address: userData.address || userData.direccion || "",
    };

    localStorage.setItem('userId', profile.id);
    localStorage.setItem('userEmail', profile.email);
    localStorage.setItem('userFullName', profile.fullName);
    localStorage.setItem('userType', profile.userType);
    
    // Guardar también los campos adicionales para que estén disponibles al recargar
    localStorage.setItem('userPhone', profile.phone || '');
    localStorage.setItem('userSkills', profile.skills || '');
    localStorage.setItem('userExperience', profile.experience || '');
    localStorage.setItem('userCompanyDescription', profile.companyDescription || '');
    localStorage.setItem('userWebsite', profile.website || '');
    localStorage.setItem('userCategory', profile.category || '');
    localStorage.setItem('userFoundedYear', profile.foundedYear || '');
    localStorage.setItem('userCompanySize', profile.companySize || '');
    localStorage.setItem('userLogo', profile.logo || '');
    localStorage.setItem('userLocation', profile.location || '');
    localStorage.setItem('userAddress', profile.address || '');

    window.dispatchEvent(new Event("storage"));
    
    if (source === 'google') {
        toast({ title: "¡Éxito!", description: "Inicio de sesión con Google exitoso." });
    }
    
    setUserProfile(profile);
  };
  
  useEffect(() => {
    const handleAuthRedirect = async () => {
      setIsLoading(true);
      try {
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          // Si hay resultado, el usuario acaba de iniciar sesión/registrarse vía Google.
          const googleUser = result.user;
          const response = await fetch('https://yopracticando.com/api/google-auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: googleUser.email,
              fullName: googleUser.displayName,
              googleId: googleUser.uid,
            }),
          });

          const apiResult = await response.json();
          if (response.ok && apiResult.success && apiResult.usuario) {
            setupUserSession({ ...apiResult.usuario, email: googleUser.email }, 'google');
          } else {
            throw new Error(apiResult.message || 'La API de Google devolvió un error.');
          }
        } else {
          // No hay resultado de redirección, verificar si hay sesión local
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
                  companyName: localStorage.getItem('userFullName') || '',
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
            // No hay sesión activa, redirigir a login
            router.push('/login');
            return; // Detener ejecución para evitar más renderizados
          }
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error de Autenticación',
          description: error.message || 'No se pudo completar el inicio de sesión.',
        });
        localStorage.clear();
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencias vacías para que se ejecute solo una vez al montar


  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="ml-4 text-lg">Verificando sesión...</p>
      </div>
    );
  }
  
  if (!userProfile) {
     // Esto puede mostrarse brevemente antes de la redirección si no hay sesión
     return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p>No hay sesión de usuario activa. Redirigiendo a inicio de sesión...</p>
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
      <p>Tipo de usuario no reconocido: {userProfile.userType}. Por favor, contacta a soporte.</p>
    </div>
  );
}
