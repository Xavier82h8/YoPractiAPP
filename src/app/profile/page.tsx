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

  // Function to save user data to localStorage and state
  const setupUserSession = (userData: any, source: 'google' | 'local' = 'local') => {
    const profile: UserProfile = {
      id: String(userData.id),
      email: userData.email,
      fullName: userData.fullName || userData.nombre_usuario || userData.nombre_empresa || 'Usuario',
      userType: userData.tipo_usuario || userData.userType,
      phone: userData.phone || "",
      skills: userData.skills || "",
      experience: userData.experience || "",
      companyName: userData.companyName || "",
      companyDescription: userData.companyDescription || "",
      website: userData.website || "",
      category: userData.category || "",
      foundedYear: userData.foundedYear || "",
      companySize: userData.companySize || "",
      logo: userData.logo || "",
      location: userData.location || "",
      address: userData.address || "",
    };

    localStorage.setItem('userId', profile.id);
    localStorage.setItem('userEmail', profile.email);
    localStorage.setItem('userFullName', profile.fullName);
    localStorage.setItem('userType', profile.userType);
    
    window.dispatchEvent(new Event("storage"));
    
    if (source === 'google') {
        toast({ title: "¡Éxito!", description: "Inicio de sesión con Google exitoso." });
    }
    
    setUserProfile(profile);
  };


  useEffect(() => {
    const processAuth = async () => {
        setIsLoading(true);
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                // User has just signed in via redirect.
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
                    setupUserSession({ ...apiResult.usuario, email: body.email }, 'google');
                } else {
                    throw new Error(apiResult.message || 'La API de Google devolvió un error.');
                }
            } else {
                // No redirect result, check for existing session in localStorage
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
                    // No user found, redirect to login
                    toast({
                        variant: "destructive",
                        title: "Acceso Denegado",
                        description: "Por favor, inicia sesión para continuar.",
                    });
                    router.push('/login');
                    return; // Stop execution to avoid setting loading to false
                }
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error de Autenticación',
                description: `Error: ${error.message}. Code: ${error.code}`,
            });
            // Redirect to login even on error
            if (router.pathname !== '/login') {
                 router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    processAuth();
}, [router, toast]);


  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }
  
  if (!userProfile) {
    // This case can be hit if the user is redirected to login.
    // Showing a loader is a good fallback.
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
