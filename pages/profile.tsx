
'use client';

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AlumnoProfile from "@/components/profile-alumno";
import EmpresaProfile from "@/components/profile-empresa";
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
  
  useEffect(() => {
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
      toast({
        variant: 'destructive',
        title: 'Acceso Denegado',
        description: 'Debes iniciar sesión para ver tu perfil.',
      });
      router.push('/login');
    }
    
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }
  
  if (!userProfile) {
     return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p>No se pudieron cargar los datos del perfil. Por favor, intenta iniciar sesión de nuevo.</p>
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
