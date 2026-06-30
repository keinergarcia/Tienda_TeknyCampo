import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tractor, Droplets, Sprout, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryCard } from '@/components/products/CategoryCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { supabase } from '@/lib/supabase';

const features = [
  {
    icon: Truck,
    title: 'Envio Gratis',
    description: 'En compras mayores a $100',
  },
  {
    icon: Shield,
    title: 'Garantia de Calidad',
    description: 'Productos certificados',
  },
  {
    icon: HeadphonesIcon,
    title: 'Soporte 24/7',
    description: 'Atencion especializada',
  },
  {
    icon: Sprout,
    title: 'Productos Naturales',
    description: 'Para el campo responsable',
  },
];

const categoryIcons = [Tractor, Droplets, Sprout, Shield];

export function HomePage() {
  const { featuredProducts, offerProducts, categories, loading } = useProducts();
  const [heroImages, setHeroImages] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('hero_images').select('url').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        const urls = data.map((img) =>
          `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/hero-images/${img.url}`
        );
        setHeroImages(urls);
      }
    });
  }, []);

  if (loading) {
    return <LoadingSpinner text="Cargando productos..." />;
  }

  const heroBg = heroImages[0]
    ? { backgroundImage: `url(${heroImages[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div>
      {/* Hero Banner */}
      <section
        className={`relative overflow-hidden ${heroImages[0] ? '' : 'bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500'}`}
        style={heroImages[0] ? heroBg : {}}
      >
        {heroImages[0] && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/60" />
        )}
        {!heroImages[0] && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              Tu tienda agropecuaria de confianza
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              Todo para el campo<br />
              <span className="text-accent-300">en un solo lugar</span>
            </h1>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8">
              Descubre nuestra amplia seleccion de productos agropecuarios.
              Semillas, herramientas, fertilizantes y mas para potenciar tu produccion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/productos" className="btn-accent">
                Ver Productos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/ofertas" className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20">
                Ver Ofertas
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full fill-gray-50">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
                Categorias Principales
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explora nuestras categorias especializadas para encontrar exactamente lo que necesitas
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((category, index) => {
                const Icon = categoryIcons[index % categoryIcons.length];
                return (
                  <div key={category.id} className="relative">
                    <CategoryCard category={category} />
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center shadow-md">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                );
              })}
            </div>

            {categories.length > 4 && (
              <div className="text-center mt-8">
                <Link to="/categorias" className="btn-secondary">
                  Ver Todas las Categorias
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-2">
                  Productos Destacados
                </h2>
                <p className="text-gray-600">Seleccion especial de nuestros mejores productos</p>
              </div>
              <Link to="/productos?destacados=true" className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="sm:hidden text-center mt-8">
              <Link to="/productos?destacados=true" className="btn-secondary">
                Ver todos los destacados
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Offers */}
      {offerProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-accent-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    OFERTAS
                  </span>
                </div>
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-2">
                  Ofertas del Mes
                </h2>
                <p className="text-gray-600">Aprovecha las mejores ofertas en productos de calidad</p>
              </div>
              <Link to="/ofertas" className="hidden sm:flex items-center text-accent-600 hover:text-accent-700 font-medium">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {offerProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="sm:hidden text-center mt-8">
              <Link to="/ofertas" className="btn-accent">
                Ver todas las ofertas
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {featuredProducts.length === 0 && offerProducts.length === 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EmptyState
              title="Productos proximamente"
              description="Estamos preparando nuestro catalogo de productos. Vuelve pronto para descubrir nuestra seleccion."
              action={
                <Link to="/categorias" className="btn-primary">
                  Explorar Categorias
                </Link>
              }
            />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            Listo para potenciar tu campo?
          </h2>
          <p className="text-primary-100 max-w-2xl mx-auto mb-8">
            Explora nuestro catalogo completo y encuentra todo lo que necesitas
            para mejorar tu produccion agropecuaria.
          </p>
          <Link to="/productos" className="btn-accent">
            Ver Catalogo Completo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
