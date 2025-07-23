
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404 - Página No Encontrada</h1>
        <p className="mt-4">La página que buscas no existe.</p>
        <Link href="/" className="text-primary underline">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
