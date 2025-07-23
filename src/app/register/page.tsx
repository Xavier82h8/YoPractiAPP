'use client';

import { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { User, Building, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "La dirección de correo electrónico no es válida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  phone: z.string().min(9, { message: "El teléfono debe tener al menos 9 dígitos." }),
  userType: z.enum(["alumno", "empresa"], {
    required_error: "Debes seleccionar un tipo de usuario.",
  }),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.45,44,30.861,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    getRedirectResult(auth)
      .then(async (result) => {
        if (!isMounted) return;

        if (result) {
          const googleUser = result.user;
          const body = {
            email: googleUser.email,
            fullName: googleUser.displayName,
            googleId: googleUser.uid,
          };
          
          try {
            const response = await fetch('https://yopracticando.com/api/google-auth.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            const apiResult = await response.json();

            if (apiResult.success && apiResult.usuario) {
              localStorage.setItem('userId', String(apiResult.usuario.id));
              localStorage.setItem('userEmail', apiResult.usuario.email || '');
              localStorage.setItem('userFullName', apiResult.usuario.fullName || 'Usuario');
              localStorage.setItem('userType', apiResult.usuario.tipo_usuario);
              window.dispatchEvent(new Event("storage"));
              toast({ title: "¡Éxito!", description: "Registro con Google exitoso." });
              router.push("/profile");
            } else {
              throw new Error(apiResult.message || 'La API devolvió un error inesperado.');
            }
          } catch (error: any) {
            toast({ variant: "destructive", title: "Error de Servidor", description: error.message });
            setIsGoogleLoading(false);
          }
        } else {
          setIsGoogleLoading(false);
        }
      })
      .catch(async (error) => {
        if (!isMounted) return;
        toast({ variant: "destructive", title: "Error de Autenticación", description: `Hubo un problema al verificar con Google: ${error.message}` });
        setIsGoogleLoading(false);
      });

      return () => { isMounted = false; }
  }, [router, toast]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      userType: "alumno",
    },
  });

  async function handleGoogleRegister() {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider).catch(async (error) => {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo iniciar el proceso con Google.' });
        setIsGoogleLoading(false);
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        const requestData = {
            email: values.email.trim(),
            password: values.password,
            tipoUsuario: values.userType,
            username: values.fullName.trim(),
            empresa: values.userType === 'empresa' ? values.fullName.trim() : '',
            phone: values.phone,
            phonePrefix: '+51'
        };
      const response = await fetch('https://yopracticando.com/api/enviar_verificacion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => null);
        throw new Error(errorResult?.message || `Error del servidor: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        toast({ title: "¡Registro Exitoso!", description: "Te hemos enviado un correo para verificar tu cuenta." });
        router.push(`/verify-account?email=${encodeURIComponent(values.email)}`);
      } else {
         toast({
          variant: "destructive",
          title: "Error en el Registro",
          description: result.message || "No se pudo completar el registro. Intenta de nuevo.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: error.message || "No se pudo conectar al servidor.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (isGoogleLoading) {
    return (
     <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
       <Loader2 className="h-16 w-16 animate-spin" />
       <span className="ml-4 text-lg">Verificando con Google...</span>
     </div>
   );
 }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Crear una Cuenta</CardTitle>
          <CardDescription>Únete a YoPracticando para encontrar tu match perfecto.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Soy un...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                        disabled={isLoading || isGoogleLoading}
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="alumno" id="userType-alumno" className="sr-only" />
                          </FormControl>
                          <FormLabel
                            htmlFor="userType-alumno"
                            className={cn(
                              "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              field.value === 'alumno' && "border-primary"
                            )}
                          >
                            <User className="mb-3 h-6 w-6" />
                            Alumno
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="empresa" id="userType-empresa" className="sr-only" />
                          </FormControl>
                          <FormLabel
                            htmlFor="userType-empresa"
                            className={cn(
                              "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              field.value === 'empresa' && "border-primary"
                            )}
                          >
                            <Building className="mb-3 h-6 w-6" />
                            Empresa
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{form.watch("userType") === 'alumno' ? 'Nombre Completo' : 'Nombre de la Empresa'}</FormLabel>
                    <FormControl>
                      <Input placeholder={form.watch("userType") === 'alumno' ? 'John Doe' : 'Innovate Inc.'} {...field} disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre@ejemplo.com" {...field} disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="987654321" {...field} disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading || isGoogleLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cuenta
              </Button>
            </form>
          </Form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O regístrate con
              </span>
            </div>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleRegister} disabled={isLoading || isGoogleLoading}>
            <GoogleIcon className="mr-2" />
            Google
          </Button>
          <p className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline hover:text-primary">
              Inicia Sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
