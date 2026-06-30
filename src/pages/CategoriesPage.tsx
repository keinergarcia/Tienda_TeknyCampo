import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

const categoryImages = [
  'https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2165759/pexels-photo-2165759.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1595103/pexels-photo-1595103.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2343467/pexels-photo-2343467.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2611478/pexels-photo-2611478.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export function CategoriesPage() {
  const { categories, products, loading } = useProducts();

  const getCategoryProductCount = (categoryId: string) => {
    return products.filter((p) => p.category_id === categoryId).length;
  };

  if (loading) {
    return <LoadingSpinner text="Cargando categorias..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-display font-bold text-4xl text-white mb-4">
            Categorias
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl">
            Explora nuestra amplia variedad de productos organizados por categorias.
            Encuentra exactamente lo que necesitas para tu campo.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const productCount = getCategoryProductCount(category.id);
              const imageUrl = category.image_url || categoryImages[index % categoryImages.length];

              return (
                <Link
                  key={category.id}
                  to={`/categoria/${category.slug}`}
                  className="group"
                >
                  <div className="card overflow-hidden">
                    <div className="relative aspect-[16/11] overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                      {/* Icon */}
                      <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="w-6 h-6 text-primary-600" />
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="font-display font-bold text-2xl text-white mb-1">
                          {category.name}
                        </h2>
                        <div className="flex items-center justify-between">
                          <span className="text-primary-200 text-sm">
                            {productCount} producto{productCount !== 1 ? 's' : ''}
                          </span>
                          <div className="flex items-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm font-medium">Ver</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {category.description && (
                      <div className="p-4 bg-white">
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Categorias proximamente"
            description="Estamos organizando nuestro catalogo. Vuelve pronto para explorar nuestras categorias de productos agropecuarios."
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
