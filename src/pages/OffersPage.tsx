import { Link } from 'react-router-dom';
import { ArrowRight, Percent } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { ProductCard } from '@/components/products/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

export function OffersPage() {
  const { offerProducts, loading } = useProducts();

  if (loading) {
    return <LoadingSpinner text="Cargando ofertas..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-accent-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Percent className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
            Ofertas Especiales
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Aprovecha las mejores ofertas en productos agropecuarios de calidad.
            Precios reducidos por tiempo limitado.
          </p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full fill-gray-50">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-accent-50 border-b border-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-accent-800">
              <span className="font-semibold">{offerProducts.length}</span> productos en oferta disponibles
            </p>
            <Link to="/productos" className="flex items-center text-accent-600 hover:text-accent-700 font-medium">
              Ver todos los productos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {offerProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin ofertas activas"
            description="No hay ofertas disponibles en este momento. Vuelve pronto para descubrir nuevas promociones."
            action={
              <Link to="/productos" className="btn-primary">
                Ver todos los productos
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
