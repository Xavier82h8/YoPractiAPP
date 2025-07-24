'use client';

import { useEffect, useState } from 'react';
import { getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const GoogleRedirectHandler = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processRedirect = async () => {
      console.log("GoogleRedirectHandler: Iniciando proceso de redirección...");
      try {
        const result = await getRedirectResult(auth);
        console.log("GoogleRedirectHandler: Resultado de getRedirectResult:", result);

        if (result && result.user) {
          const user = result.user;
          console.log("GoogleRedirectHandler: Usuario obtenido de Firebase:", user);

          const payload = {
            email: user.email,
            fullName: user.displayName,
            googleId: user.uid
          };
          console.log("GoogleRedirectHandler: Enviando payload a la API:", payload);

          try {
            const response = await fetch('https://yopracticando.com/api/google-auth.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            console.log("GoogleRedirectHandler: Respuesta de la API (status):", response.status);
            const apiResult = await response.json();
            console.log("GoogleRedirectHandler: Respuesta de la API (JSON):", apiResult);

            if (apiResult.success && apiResult.usuario) {
              localStorage.setItem('userId', String(apiResult.usuario.id));
              localStorage.setItem('userEmail', apiResult.usuario.email || '');
              localStorage.setItem('userFullName', apiResult.usuario.fullName || 'Usuario');
              localStorage.setItem('userType', apiResult.usuario.tipo_usuario);
              if (apiResult.usuario.token) {
                  localStorage.setItem('userToken', apiResult.usuario.token);
              }

              window.dispatchEvent(new Event("storage"));

              toast({ title: "¡Éxito!", description: apiResult.message });
              router.push('/profile');
            } else {
              throw new Error(apiResult.message || "Error al procesar el inicio de sesión con Google.");
            }
          } catch (fetchError: any) {
            console.error("GoogleRedirectHandler: Error en el fetch a la API:", fetchError);
            toast({
              variant: 'destructive',
              title: 'Error de Conexión con el Servidor',
              description: fetchError.message || 'No se pudo conectar con el servidor para la autenticación.',
            });
            setIsProcessing(false);
            router.push('/login');
          }
        } else {
          console.log("GoogleRedirectHandler: No se encontró resultado de redirección. Deteniendo el procesamiento.");
          setIsProcessing(false);
        }
      } catch (error: any) {
        console.error("GoogleRedirectHandler: Error general en processRedirect:", error);
        toast({
          variant: 'destructive',
          title: 'Error en el inicio de sesión con Google',
          description: error.message || 'Ocurrió un error inesperado.',
        });
        setIsProcessing(false);
        router.push('/login');
      }
    };

    processRedirect();
  }, [router, toast]);

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-xl font-semibold">Procesando inicio de sesión con Google...</p>
          <p className="text-muted-foreground">Por favor, espera un momento.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleRedirectHandler;
