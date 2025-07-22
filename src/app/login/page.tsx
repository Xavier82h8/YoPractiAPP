'use client';

import { useState, useEffect } from "react";
import { getRedirectResult, GoogleAuthProvider, signInWithRedirect, User as FirebaseUser } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  email: z.string().email({ message: "El correo electrónico no es válido." }),
  password: z.string().min(3, { message: "La contraseña debe tener al menos 3 caracteres." }),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.45,44,30.861,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(true);

  const handleGoogleAuth = async (googleUser: FirebaseUser) => {
    try {
      const response = await fetch('https://yopracticando.com/api/google-auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUser.email,
          fullName: googleUser.displayName,
          googleId: googleUser.uid,
        }),
      });

      const result = await response.json();

      if (result.success && result.usuario) {
        localStorage.setItem('userId', String(result.usuario.id));
        localStorage.setItem('userEmail', googleUser.email || '');
        localStorage.setItem('userFullName', googleUser.displayName || 'Usuario');
        localStorage.setItem('userType', result.usuario.tipo_usuario);
        window.dispatchEvent(new Event("storage"));
        toast({ title: "¡Éxito!", description: "Inicio de sesión con Google exitoso." });
        router.push("/profile");
      } else {
        throw new Error(result.message || 'Error al procesar el inicio de sesión con Google.');
      }
    } catch (error: any) {
      console.error("Error en handleGoogleAuth:", error);
      toast({
        variant: "destructive",
        title: "Error de Servidor",
        description: error.message,
      });
    } finally {
        setIsGoogleLoading(false);
    }
  };


  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // Usuario ha iniciado sesión o se ha registrado con Google.
          handleGoogleAuth(result.user);
        } else {
          setIsGoogleLoading(false);
        }
      })
      .catch((error) => {
        console.error("Google Sign-in Error:", error);
        toast({
          variant: "destructive",
          title: "Error de Google",
          description: error.message,
        });
        setIsGoogleLoading(false);
      });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const body = new FormData();
      body.append('email', values.email.trim());
      body.append('password', values.password);

      const response = await fetch('https://yopracticando.com/api/login_movil.php', {
        method: 'POST',
        body,
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null);
        throw new Error(errorResult?.message || `Error de red: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.usuario) {
        localStorage.setItem('userId', String(result.usuario.id));
        localStorage.setItem('userEmail', values.email.trim());
        localStorage.setItem('userType', result.usuario.tipo_usuario);
        if (result.token) {
          localStorage.setItem('userToken', result.token);
        }
        
        // Es importante obtener y guardar el nombre completo si la API lo devuelve.
        // Asumiendo que la API devuelve 'nombre_usuario' o 'nombre_empresa'
        const fullName = result.usuario.nombre_usuario || result.usuario.nombre_empresa || 'Usuario';
        localStorage.setItem('userFullName', fullName);
        
        window.dispatchEvent(new Event("storage"));
        
        toast({ title: "¡Éxito!", description: "Inicio de sesión exitoso." });
        router.push("/profile");
      } else {
        toast({
          variant: "destructive",
          title: "Fallo en el inicio de sesión",
          description: result.message || "Credenciales inválidas. Por favor, intenta de nuevo.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: error.message || "No se pudo conectar al servidor. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isGoogleLoading && !isLoading) {
     return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Bienvenido de Vuelta</CardTitle>
          <CardDescription>Inicia sesión para continuar en YoPracticando</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre@ejemplo.com" {...field} disabled={isLoading} />
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
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </form>
          </Form>
           <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2" />}
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm">
          <Link href="#" className="underline hover:text-primary">
            ¿Olvidaste tu contraseña?
          </Link>
          <p>
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline hover:text-primary">
              Regístrate aquí
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
