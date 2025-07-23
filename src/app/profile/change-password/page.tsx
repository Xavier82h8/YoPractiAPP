'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { Suspense } from "react";

function VerifyAccountContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent mb-4">
            <MailCheck className="h-10 w-10 text-accent-foreground" />
          </div>
          <CardTitle className="font-headline text-3xl">Verifica tu Correo Electrónico</CardTitle>
          <CardDescription>
            Hemos enviado un enlace de verificación a{' '}
            <span className="font-semibold text-foreground">{email || 'tu correo'}</span>.
            Por favor, haz clic en el enlace para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Una vez verificado, podrás iniciar sesión.
          </p>
           <Button asChild className="w-full mt-4">
            <Link href="/login">
              Ir a Iniciar Sesión
            </Link>
           </Button>
           <p className="mt-4 text-sm text-muted-foreground">
              ¿No recibiste el correo? Revisa tu carpeta de spam o intenta registrarte de nuevo.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}


export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyAccountContent />
    </Suspense>
  )
}