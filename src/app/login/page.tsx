'use client';

import { useState } from "react";
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

const formSchema = z.object({
  email: z.string().email({ message: "El correo electrónico no es válido." }),
  password: z.string().min(3, { message: "La contraseña debe tener al menos 3 caracteres." }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
        throw new Error(`Error de red: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.usuario) {
        // En una aplicación web, es mejor manejar la sesión con cookies httpOnly desde el backend.
        // Como segunda opción, usamos localStorage.
        localStorage.setItem('userId', String(result.usuario.id));
        localStorage.setItem('userType', result.usuario.tipo_usuario);
        if (result.token) {
          localStorage.setItem('userToken', result.token);
        }
        
        toast({ title: "¡Éxito!", description: "Inicio de sesión exitoso." });
        router.push("/profile"); // Redirigir al perfil del usuario
      } else {
        toast({
          variant: "destructive",
          title: "Fallo en el inicio de sesión",
          description: result.message || "Credenciales inválidas. Por favor, intenta de nuevo.",
        });
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: error.message || "No se pudo conectar al servidor. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
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
