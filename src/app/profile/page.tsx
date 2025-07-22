'use client';

import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  skills: string;
  experience: string;
  userType: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        router.push('/login');
        return;
    }

    // Cargar datos del usuario desde localStorage
    const userEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType');
    const userFullName = localStorage.getItem('userFullName');
    
    // Aquí podrías hacer un fetch a tu API para obtener los datos más recientes.
    // Por ahora, usamos los de localStorage y valores por defecto.
    setUserProfile({
        id: userId,
        email: userEmail || '',
        userType: userType || 'alumno',
        fullName: userFullName || "Usuario",
        phone: "", // Deberías obtener esto de tu API
        skills: "", // Deberías obtener esto de tu API
        experience: "", // Deberías obtener esto de tu API
    });

  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!userProfile) return;
    const { id, value } = e.target;
    setUserProfile({ ...userProfile, [id]: value });
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setIsLoading(true);

    try {
        const response = await fetch('https://yopracticando.com/api/editar_usuario.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userProfile.id,
                fullName: userProfile.fullName,
                email: userProfile.email,
                phone: userProfile.phone,
                skills: userProfile.skills,
                experience: userProfile.experience,
            }),
        });

        const result = await response.json();

        if (result.success) {
            toast({
                title: "¡Éxito!",
                description: "Tu perfil ha sido actualizado correctamente.",
            });
            // Actualizar datos en localStorage si cambiaron
            localStorage.setItem('userEmail', userProfile.email);
            localStorage.setItem('userFullName', userProfile.fullName);
            window.dispatchEvent(new Event("storage")); // Notificar a otros componentes
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

  if (!userProfile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

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
