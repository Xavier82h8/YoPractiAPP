'use client';

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { User, Mail, Briefcase, Code, Shield, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/app/profile/page";

interface AlumnoProfileProps {
    initialProfileData: UserProfile;
}

export default function AlumnoProfile({ initialProfileData }: AlumnoProfileProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfileData);
  const initialProfile = useRef<UserProfile>(initialProfileData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const changedData: Partial<UserProfile> = {};
    Object.keys(userProfile).forEach(key => {
      const aKey = key as keyof UserProfile;
      if (userProfile[aKey] !== initialProfile.current![aKey]) {
        // Mapear fullName a username para el backend
        if (aKey === 'fullName') {
            changedData['username' as keyof UserProfile] = userProfile[aKey];
        } else {
            changedData[aKey] = userProfile[aKey];
        }
      }
    });

    if (Object.keys(changedData).length === 0) {
      toast({ title: "Sin cambios", description: "No has modificado ningún dato." });
      setIsLoading(false);
      return;
    }

    const requestBody = { id: userProfile.id, ...changedData };

    try {
        const response = await fetch('https://yopracticando.com/api/editar_usuario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (result.success) {
            toast({ title: "¡Éxito!", description: "Tu perfil ha sido actualizado correctamente." });
            const updatedProfile = { ...userProfile };
            initialProfile.current = updatedProfile;
            Object.keys(requestBody).forEach(key => {
              const aKey = key as keyof UserProfile;
              const localKey = aKey === 'username' ? 'fullName' : aKey;
              localStorage.setItem(`user${localKey.charAt(0).toUpperCase() + localKey.slice(1)}`, String(requestBody[aKey]));
            });
            window.dispatchEvent(new Event("storage"));
        } else {
            throw new Error(result.message || "Error al actualizar el perfil.");
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "No se pudo conectar con el servidor.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="flex flex-col items-center text-center space-y-4 p-6 bg-secondary/30">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${userProfile.fullName.replace(' ','+')}&background=random`} alt={userProfile.fullName} />
            <AvatarFallback>{userProfile.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-3xl">{userProfile.fullName}</CardTitle>
            <CardDescription className="text-lg capitalize">{userProfile.userType}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSaveChanges} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2"><User className="w-4 h-4"/>Nombre Completo</Label>
                <Input id="fullName" value={userProfile.fullName} onChange={handleInputChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4"/>Dirección de Correo</Label>
                <Input id="email" type="email" value={userProfile.email} onChange={handleInputChange} disabled={isLoading} />
              </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4"/>Teléfono</Label>
                <Input id="phone" type="tel" value={userProfile.phone} onChange={handleInputChange} placeholder="+51 987654321" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="flex items-center gap-2"><Code className="w-4 h-4"/>Habilidades</Label>
              <Textarea
                id="skills"
                placeholder="e.g., React, TypeScript, Figma"
                value={userProfile.skills}
                onChange={handleInputChange}
                className="min-h-[100px]"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience" className="flex items-center gap-2"><Briefcase className="w-4 h-4"/>Experiencia</Label>
              <Textarea
                id="experience"
                placeholder="Describe tus roles y proyectos pasados..."
                className="min-h-[150px]"
                value={userProfile.experience}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
          </form>

          <Separator className="my-8" />
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-headline flex items-center gap-2"><Shield className="w-5 h-5"/>Seguridad de la Cuenta</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Contraseña</p>
                <p className="text-sm text-muted-foreground">Por tu seguridad, te recomendamos cambiar tu contraseña periódicamente.</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/profile/change-password">Cambiar Contraseña</Link>
              </Button>
            </div>
             <div className="flex items-center justify-between p-4 border rounded-lg mt-4 bg-destructive/10 border-destructive/20">
              <div>
                <p className="font-medium text-destructive">Eliminar Cuenta</p>
                <p className="text-sm text-destructive/80">Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.</p>
              </div>
              <Button variant="destructive">Eliminar Cuenta</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
