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
import { Building, Mail, Globe, Tag, Calendar, Users, Shield, Phone, Loader2, Workflow, CloudUpload, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/app/profile/page";

interface EmpresaProfileProps {
    initialProfileData: UserProfile;
}

// Opciones para los campos de selección
const categories = ["Tecnología", "Marketing", "Recursos Humanos", "Diseño", "Ventas", "Finanzas"];
const companySizes = ["1-10 empleados", "11-50 empleados", "51-200 empleados", "201-500 empleados", "501+ empleados"];
const locations = ["Lima", "Arequipa", "Trujillo", "Cusco", "Otra"];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => String(currentYear - i));


export default function EmpresaProfile({ initialProfileData }: EmpresaProfileProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfileData);
  const initialProfile = useRef<UserProfile>(initialProfileData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Por ahora, guardaremos el nombre del archivo.
      // En una implementación real, aquí se subiría el archivo a un servicio de almacenamiento
      // y se guardaría la URL resultante.
      setUserProfile(prev => ({ ...prev, logo: file.name }));
    }
  };
  
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const changedData: Partial<UserProfile> = {};
    Object.keys(userProfile).forEach(key => {
        const aKey = key as keyof UserProfile;
        if (userProfile[aKey] !== initialProfile.current![aKey]) {
            // Mapear companyName a username para el backend
            if (aKey === 'companyName') {
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
            toast({ title: "¡Éxito!", description: "El perfil de la empresa ha sido actualizado." });
            const updatedProfile = { ...userProfile };
            initialProfile.current = updatedProfile;

            // Actualizar localStorage con los nuevos datos
            Object.keys(requestBody).forEach(key => {
              const aKey = key as keyof UserProfile;
              // Mapear username de vuelta a companyName y fullName para consistencia
              if (aKey === 'username') {
                localStorage.setItem('userCompanyName', String(requestBody[aKey]));
                localStorage.setItem('userFullName', String(requestBody[aKey]));
              } else {
                 localStorage.setItem(`user${aKey.charAt(0).toUpperCase() + aKey.slice(1)}`, String(requestBody[aKey]));
              }
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
             <AvatarImage src={`https://logo.clearbit.com/${userProfile.website}`} alt={userProfile.companyName || ''} />
             <AvatarFallback><Building /></AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-3xl">{userProfile.companyName}</CardTitle>
            <CardDescription className="text-lg capitalize">{userProfile.userType}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSaveChanges} className="space-y-8">
            <h3 className="text-xl font-semibold font-headline border-b pb-2">Información General</h3>
            {/* Fila 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2"><Building className="w-4 h-4"/>Nombre de la Empresa</Label>
                <Input id="companyName" value={userProfile.companyName || ''} onChange={handleInputChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2"><Tag className="w-4 h-4"/>Categoría</Label>
                <Select value={userProfile.category} onValueChange={(value) => handleSelectChange('category', value)} disabled={isLoading}>
                    <SelectTrigger id="category"><SelectValue placeholder="Seleccione una categoría" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fila 2 */}
            <div className="space-y-2">
              <Label htmlFor="companyDescription" className="flex items-center gap-2"><Workflow className="w-4 h-4"/>Acerca de la Empresa</Label>
              <Textarea
                id="companyDescription"
                placeholder="Describe tu empresa, su misión y visión..."
                value={userProfile.companyDescription}
                onChange={handleInputChange}
                className="min-h-[150px]"
                disabled={isLoading}
              />
            </div>
            
             {/* Fila 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2"><Globe className="w-4 h-4"/>Página Web</Label>
                <Input id="website" value={userProfile.website || ''} onChange={handleInputChange} placeholder="www.ejemplo.com" disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4"/>Número de Teléfono</Label>
                <Input id="phone" type="tel" value={userProfile.phone} onChange={handleInputChange} placeholder="+51 987654321" disabled={isLoading} />
              </div>
            </div>

             {/* Fila 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4"/>Email de Contacto</Label>
                    <Input id="email" type="email" value={userProfile.email} onChange={handleInputChange} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="foundedYear" className="flex items-center gap-2"><Calendar className="w-4 h-4"/>Fundada en</Label>
                     <Select value={userProfile.foundedYear} onValueChange={(value) => handleSelectChange('foundedYear', value)} disabled={isLoading}>
                        <SelectTrigger id="foundedYear"><SelectValue placeholder="Seleccione el año" /></SelectTrigger>
                        <SelectContent>
                            {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Fila 5 */}
             <div className="space-y-2">
                <Label htmlFor="companySize" className="flex items-center gap-2"><Users className="w-4 h-4"/>Tamaño de la Empresa</Label>
                <Select value={userProfile.companySize} onValueChange={(value) => handleSelectChange('companySize', value)} disabled={isLoading}>
                    <SelectTrigger id="companySize"><SelectValue placeholder="Seleccione una opción" /></SelectTrigger>
                    <SelectContent>
                        {companySizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <Separator className="my-8" />
            
            <h3 className="text-xl font-semibold font-headline border-b pb-2">Media</h3>
            <div className="space-y-2">
                <Label htmlFor="logo" className="flex items-center gap-2">Logo <span className="text-red-500">*</span></Label>
                <div className="flex items-center justify-center w-full">
                    <Label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <CloudUpload className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haga clic aquí</span> o arrastre su archivo para cargar</p>
                            <p className="text-xs text-muted-foreground">Tamaño máximo: 1000kb | Formatos: JPG, PNG, SVG</p>
                        </div>
                        <Input id="logo-upload" type="file" className="hidden" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.svg" />
                    </Label>
                </div>
                {userProfile.logo && <p className="text-sm text-muted-foreground">Archivo seleccionado: {userProfile.logo}</p>}
            </div>

            <Separator className="my-8" />

            <h3 className="text-xl font-semibold font-headline border-b pb-2">Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="w-4 h-4"/>Ubicación</Label>
                <Select value={userProfile.location} onValueChange={(value) => handleSelectChange('location', value)} disabled={isLoading}>
                    <SelectTrigger id="location"><SelectValue placeholder="Seleccione una ubicación" /></SelectTrigger>
                    <SelectContent>
                        {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">Dirección</Label>
                <Input id="address" value={userProfile.address || ''} onChange={handleInputChange} placeholder="Ingrese la dirección completa" disabled={isLoading} />
              </div>
            </div>


            <Separator className="my-8" />


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
