import { Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="font-display font-bold text-6xl text-gray-900 mb-4">404</h1>
        <h2 className="font-display font-semibold text-2xl text-gray-700 mb-4">
          Pagina no encontrada
        </h2>
        <p className="text-gray-500 mb-8">
          La pagina que buscas no existe o ha sido movida.
          Verifica la URL o vuelve al inicio.
        </p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
