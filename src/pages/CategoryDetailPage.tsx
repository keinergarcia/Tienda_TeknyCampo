import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { ProductCard } from '@/components/products/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Category, Product } from '@/types';

const DEFAULT_CATEGORY_IMAGE = 'https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=1200';

const categoryImages: Record<string, string> = {
  semillas: DEFAULT_CATEGORY_IMAGE,
  herramientas: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=1200',
  fertilizantes: 'https://images.pexels.com/photos/2165759/pexels-photo-2165759.jpeg?auto=compress&cs=tinysrgb&w=1200',
  maquinaria: 'https://images.pexels.com/photos/1595103/pexels-photo-1595103.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

function getCategoryImage(category: Category): string {
  if (category.image_url) return category.image_url;
  return categoryImages[category.slug] || DEFAULT_CATEGORY_IMAGE;
}

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getCategoryBySlug, getProductsByCategory, loading: productsLoading } = useProducts();
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategoryData() {
      if (!slug) return;
      setLoading(true);
      const categoryData = await getCategoryBySlug(slug);
      if (categoryData) {
        setCategory(categoryData);
        const productsData = await getProductsByCategory(categoryData.id);
        setCategoryProducts(productsData);
      }
      setLoading(false);
    }
    fetchCategoryData();
  }, [slug, getCategoryBySlug, getProductsByCategory]);

  if (loading || productsLoading) {
    return <LoadingSpinner text="Cargando categoria..." />;
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Categoria no encontrada</h1>
          <Link to="/categorias" className="btn-primary">
            Ver todas las categorias
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getCategoryImage(category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src={imageUrl}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Link
              to="/categorias"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a categorias
            </Link>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-white/80 text-lg max-w-2xl">{category.description}</p>
            )}
            <p className="text-primary-300 mt-2">
              {categoryProducts.length} producto{categoryProducts.length !== 1 ? 's' : ''} en esta categoria
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin productos"
            description="Esta categoria aun no tiene productos. Explora otras categorias o todos nuestros productos."
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
