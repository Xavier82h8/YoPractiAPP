'use client';

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AlumnoProfile from "@/components/profile-alumno";
import EmpresaProfile from "@/components/profile-empresa";

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
}


export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');

    if (!userId || !userType) {
        router.push('/login');
        return;
    }
    
    // Cargar perfil desde localStorage
    const profile: UserProfile = {
        id: userId,
        userType: userType,
        email: localStorage.getItem('userEmail') || '',
        fullName: localStorage.getItem('userFullName') || "Usuario",
        phone: localStorage.getItem('userPhone') || "",
        skills: localStorage.getItem('userSkills') || "",
        experience: localStorage.getItem('userExperience') || "",
        // Cargar datos de empresa si existen
        companyName: localStorage.getItem('userCompanyName') || (userType === 'empresa' ? (localStorage.getItem('userFullName') || '') : ''),
        companyDescription: localStorage.getItem('userCompanyDescription') || "",
        website: localStorage.getItem('userWebsite') || "",
        category: localStorage.getItem('userCategory') || "",
        foundedYear: localStorage.getItem('userFoundedYear') || "",
        companySize: localStorage.getItem('userCompanySize') || "",
    };

    setUserProfile(profile);
    setIsLoading(false);
  }, [router]);

  if (isLoading || !userProfile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  // Renderizar el componente de perfil correcto basado en el tipo de usuario
  if (userProfile.userType === 'alumno') {
    return <AlumnoProfile initialProfileData={userProfile} />;
  }
  
  if (userProfile.userType === 'empresa') {
    return <EmpresaProfile initialProfileData={userProfile} />;
  }

  // Fallback por si el tipo de usuario no es ni alumno ni empresa
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <p>Tipo de usuario no reconocido.</p>
    </div>
  );
}
