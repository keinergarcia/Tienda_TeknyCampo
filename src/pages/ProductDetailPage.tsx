import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, Check } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types';

function getImageUrl(path: string) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getProductBySlug, products, loading: productsLoading } = useProducts();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setLoading(true);
      const data = await getProductBySlug(slug);
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [slug, getProductBySlug]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = products
    .filter((p) => p.category_id === product?.category_id && p.id !== product?.id)
    .slice(0, 4);

  if (loading || productsLoading) {
    return <LoadingSpinner text="Cargando producto..." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <Link to="/productos" className="btn-primary">
            Ver todos los productos
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Image Gallery */}
          <div className="lg:max-w-lg lg:self-start">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
              {(product.images && product.images.length > 0) ? (
                <img
                  src={getImageUrl(product.images[selectedImage]?.url || product.images[0].url)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                  <Package className="w-32 h-32 text-primary-300" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_offer && discount > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    -{discount}% OFF
                  </span>
                )}
                {product.is_featured && (
                  <span className="px-3 py-1 bg-primary-500 text-white text-sm font-bold rounded-full">
                    Destacado
                  </span>
                )}
              </div>

              {/* Stock */}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Agotado</span>
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === selectedImage
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(img.url)}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            {product.category && (
              <Link
                to={`/categoria/${product.category.slug}`}
                className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display font-bold text-3xl text-gray-900 mt-2 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-primary-700">
                ${product.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  ${product.original_price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  En stock ({product.stock} disponibles)
                </span>
              ) : (
                <span className="text-red-600 font-medium">Agotado</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="font-semibold text-gray-900 mb-2">Descripcion</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                  aria-label="Reducir cantidad"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 font-medium text-center min-w-[80px]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.stock}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || added}
                className={`flex-1 btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed ${added ? 'bg-green-600 hover:bg-green-600' : ''}`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Agregado
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Agregar al Carrito
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-200">
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-8">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
