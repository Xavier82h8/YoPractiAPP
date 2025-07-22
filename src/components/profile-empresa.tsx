'use client';

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Building, Mail, Shield, Phone, Loader2, Globe, MapPin, UploadCloud, FileText, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/app/profile/page";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface EmpresaProfileProps {
    initialProfileData: UserProfile;
}

export default function EmpresaProfile({ initialProfileData }: EmpresaProfileProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfileData);
  const initialProfile = useRef<UserProfile>(initialProfileData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof UserProfile) => (value: string) => {
    setUserProfile(prev => ({...prev, [id]: value}));
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const changedData: Partial<UserProfile> = {};
    (Object.keys(userProfile) as Array<keyof UserProfile>).forEach(key => {
        if (userProfile[key] !== initialProfile.current[key]) {
            changedData[key] = userProfile[key];
        }
    });

    if (Object.keys(changedData).length === 0) {
        toast({ title: "Sin cambios", description: "No has modificado ningún dato." });
        setIsLoading(false);
        return;
    }

    const requestBody = { id: userProfile.id, ...changedData };
    
    // Si se cambia el nombre de la empresa, también lo enviamos como fullName
    if (requestBody.companyName) {
      requestBody.fullName = requestBody.companyName;
    }

    try {
        const response = await fetch('https://yopracticando.com/api/editar_usuario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (result.success) {
            toast({ title: "¡Éxito!", description: "El perfil de la empresa ha sido actualizado." });
            const updatedProfile = { ...userProfile };
            initialProfile.current = updatedProfile;

            // Actualizar localStorage con los nuevos datos
            Object.keys(changedData).forEach(key => {
              const aKey = key as keyof UserProfile;
              localStorage.setItem(`user${aKey.charAt(0).toUpperCase() + aKey.slice(1)}`, String(changedData[aKey]));
            });
            // Si el nombre de la empresa cambió, también actualizamos el fullName en localStorage
             if (changedData.companyName) {
                localStorage.setItem('userFullName', changedData.companyName);
            }
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
             <AvatarImage src={userProfile.logo || `https://logo.clearbit.com/${userProfile.website}`} alt={userProfile.companyName || ''} />
             <AvatarFallback><Building /></AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-3xl">{userProfile.companyName}</CardTitle>
            <CardDescription className="text-lg capitalize">{userProfile.userType}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSaveChanges} className="space-y-8">
            <div className="space-y-6">
                <h3 className="text-xl font-semibold font-headline border-b pb-2">Información de la Empresa</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="flex items-center gap-2"><Building className="w-4 h-4"/>Nombre de la Empresa</Label>
                        <Input id="companyName" value={userProfile.companyName || ''} onChange={handleInputChange} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website" className="flex items-center gap-2"><Globe className="w-4 h-4"/>Página Web</Label>
                        <Input id="website" value={userProfile.website || ''} onChange={handleInputChange} disabled={isLoading} placeholder="https://ejemplo.com"/>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="companyDescription" className="flex items-center gap-2"><FileText className="w-4 h-4"/>Acerca de la empresa</Label>
                    <Textarea id="companyDescription" value={userProfile.companyDescription || ''} onChange={handleInputChange} disabled={isLoading} placeholder="Describe tu empresa..."/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="category" className="flex items-center gap-2"><Users className="w-4 h-4"/>Categoría</Label>
                         <Select value={userProfile.category} onValueChange={handleSelectChange('category')}>
                            <SelectTrigger id="category" disabled={isLoading}>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tech">Tecnología</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="design">Diseño</SelectItem>
                                <SelectItem value="hr">Recursos Humanos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="foundedYear" className="flex items-center gap-2"><Calendar className="w-4 h-4"/>Año de Fundación</Label>
                        <Input id="foundedYear" type="number" value={userProfile.foundedYear || ''} onChange={handleInputChange} disabled={isLoading} placeholder="2024"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="companySize" className="flex items-center gap-2"><Users className="w-4 h-4"/>Tamaño</Label>
                        <Select value={userProfile.companySize} onValueChange={handleSelectChange('companySize')}>
                            <SelectTrigger id="companySize" disabled={isLoading}>
                                <SelectValue placeholder="Número de empleados" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-10">1-10</SelectItem>
                                <SelectItem value="11-50">11-50</SelectItem>
                                <SelectItem value="51-200">51-200</SelectItem>
                                <SelectItem value="201+">201+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />
            
            <div className="space-y-6">
                <h3 className="text-xl font-semibold font-headline border-b pb-2">Media</h3>
                <div className="space-y-2">
                    <Label htmlFor="logo">Logo</Label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                                <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" />
                        </label>
                    </div> 
                </div>
            </div>
            
            <Separator />

             <div className="space-y-6">
                 <h3 className="text-xl font-semibold font-headline border-b pb-2">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4"/>Email de Contacto</Label>
                        <Input id="email" type="email" value={userProfile.email} onChange={handleInputChange} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4"/>Número de Teléfono</Label>
                        <Input id="phone" type="tel" value={userProfile.phone} onChange={handleInputChange} placeholder="+51 987654321" disabled={isLoading} />
                    </div>
                </div>
             </div>
            
             <Separator />

            <div className="space-y-6">
                <h3 className="text-xl font-semibold font-headline border-b pb-2">Ubicación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="w-4 h-4"/>Ubicación</Label>
                         <Select value={userProfile.location} onValueChange={handleSelectChange('location')}>
                            <SelectTrigger id="location" disabled={isLoading}>
                                <SelectValue placeholder="Selecciona una ubicación" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lima">Lima, Perú</SelectItem>
                                <SelectItem value="arequipa">Arequipa, Perú</SelectItem>
                                <SelectItem value="bogota">Bogotá, Colombia</SelectItem>
                                <SelectItem value="remote">Remoto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="w-4 h-4"/>Dirección</Label>
                        <Input id="address" value={userProfile.address || ''} onChange={handleInputChange} disabled={isLoading} placeholder="Av. Principal 123"/>
                    </div>
                </div>
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
