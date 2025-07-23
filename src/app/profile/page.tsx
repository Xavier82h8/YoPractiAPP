'use client';

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AlumnoProfile from "@/components/profile-alumno";
import EmpresaProfile from "@/components/profile-empresa";
import { getRedirectResult, GoogleAuthProvider } from "firebase/auth";
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

  const handleSuccessfulLogin = (userData: any) => {
    localStorage.setItem('userId', String(userData.id));
    localStorage.setItem('userEmail', userData.email || '');
    localStorage.setItem('userFullName', userData.fullName || 'Usuario');
    localStorage.setItem('userType', userData.tipo_usuario);
    if (userData.token) localStorage.setItem('userToken', userData.token);
    
    window.dispatchEvent(new Event("storage"));
    
    toast({ title: "¡Éxito!", description: "Inicio de sesión exitoso." });
  };

  useEffect(() => {
    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Usuario ha regresado de la redirección de Google
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
            handleSuccessfulLogin({ ...apiResult.usuario, email: body.email });
            // Cargar perfil inmediatamente
            const profile: UserProfile = {
              id: apiResult.usuario.id,
              userType: apiResult.usuario.tipo_usuario,
              email: apiResult.usuario.email || '',
              fullName: apiResult.usuario.fullName || 'Usuario',
              phone: '',
              skills: '',
              experience: '',
            };
            setUserProfile(profile);
          } else {
            throw new Error(apiResult.message || 'La API de Google devolvió un error.');
          }
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error de Google',
          description: error.message || 'No se pudo completar el inicio de sesión con Google.',
        });
        // Si hay error, intentar cargar desde localStorage o redirigir
        const userId = localStorage.getItem('userId');
        if (!userId) {
          router.push('/login');
        }
      } finally {
        // Una vez procesado el resultado (o si no había ninguno), cargar desde localStorage
        if (!userProfile) {
            const userId = localStorage.getItem('userId');
            const userType = localStorage.getItem('userType');

            if (!userId || !userType) {
                router.push('/login');
                return;
            }
            
            const profile: UserProfile = {
                id: userId,
                userType: userType,
                email: localStorage.getItem('userEmail') || '',
                fullName: localStorage.getItem('userFullName') || "Usuario",
                phone: localStorage.getItem('userPhone') || "",
                skills: localStorage.getItem('userSkills') || "",
                experience: localStorage.getItem('userExperience') || "",
                companyName: localStorage.getItem('userCompanyName') || (userType === 'empresa' ? (localStorage.getItem('userFullName') || '') : ''),
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
        }
        setIsLoading(false);
      }
    };

    processRedirectResult();
  }, [router, toast, userProfile]);

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
      <p>Tipo de usuario no reconocido.</p>
    </div>
  );
}
