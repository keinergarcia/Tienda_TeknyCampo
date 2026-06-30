import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product, 1);
    } catch {
      // Error handled in CartContext
    }
  };

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const firstImage = product.images?.[0]?.url
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${product.images[0].url}`
    : product.image_url;

  return (
    <Link to={`/producto/${product.slug}`} className="group">
      <div className="card h-full flex flex-col">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-50">
              <Package className="w-16 h-16 text-primary-300" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_offer && discount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md">
                -{discount}%
              </span>
            )}
            {product.is_featured && !product.is_offer && (
              <span className="px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded-md">
                Destacado
              </span>
            )}
          </div>

          {user && (
            <button
              onClick={handleToggleWishlist}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
              aria-label={wishlistIds.has(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart
                className={`w-5 h-5 ${wishlistIds.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </button>
          )}

          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Agotado</span>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {product.category && (
            <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">
              {product.category.name}
            </span>
          )}
          <h3 className="font-display font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2 flex-1">
              {product.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xl font-bold text-primary-700">
              ${product.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-400 line-through">
                ${product.original_price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="mt-4 w-full btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label={product.stock > 0 ? `Agregar ${product.name} al carrito` : 'Producto agotado'}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
          </button>
        </div>
      </div>
    </Link>
  );
}
