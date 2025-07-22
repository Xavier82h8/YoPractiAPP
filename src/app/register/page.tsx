'use client';

import { useState } from "react";
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

const formSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "La dirección de correo electrónico no es válida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  userType: z.enum(["alumno", "empresa"], {
    required_error: "Debes seleccionar un tipo de usuario.",
  }),
});

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      userType: "alumno",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch('https://yopracticando.com/api/enviar_verificacion.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
          tipoUsuario: values.userType,
          username: values.fullName.trim(),
          // Puedes agregar otros campos como 'empresa' si es necesario
          empresa: values.userType === 'empresa' ? values.fullName.trim() : '',
        }),
      });

      if (!response.ok) {
        // Si el servidor responde con un error, intenta leer el JSON del cuerpo
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
        description: error.message || "No se pudo conectar al servidor. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
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
                        disabled={isLoading}
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="alumno" className="sr-only" />
                          </FormControl>
                          <FormLabel
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
                            <RadioGroupItem value="empresa" className="sr-only" />
                          </FormControl>
                          <FormLabel
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
                    <FormLabel>{form.getValues("userType") === 'alumno' ? 'Nombre Completo' : 'Nombre de la Empresa'}</FormLabel>
                    <FormControl>
                      <Input placeholder={form.getValues("userType") === 'alumno' ? 'John Doe' : 'Innovate Inc.'} {...field} disabled={isLoading}/>
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
                      <Input placeholder="nombre@ejemplo.com" {...field} disabled={isLoading}/>
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
                Crear Cuenta
              </Button>
            </form>
          </Form>
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
