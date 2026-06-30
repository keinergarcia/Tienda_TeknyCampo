import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Product } from '@/types';

export function OffersAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('name');
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggleOffer = async (product: Product) => {
    await supabase.from('products').update({ is_offer: !product.is_offer }).eq('id', product.id);
    setProducts(products.map((p) => (p.id === product.id ? { ...p, is_offer: !p.is_offer } : p)));
  };

  const toggleFeatured = async (product: Product) => {
    await supabase.from('products').update({ is_featured: !product.is_featured }).eq('id', product.id);
    setProducts(products.map((p) => (p.id === product.id ? { ...p, is_featured: !p.is_featured } : p)));
  };

  if (loading) return <LoadingSpinner text="Cargando productos..." />;

  const offerCount = products.filter((p) => p.is_offer).length;
  const featuredCount = products.filter((p) => p.is_featured).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900">Ofertas y Destacados</h2>
          <p className="text-sm text-gray-500 mt-1">
            {offerCount} producto{offerCount !== 1 ? 's' : ''} en oferta | {featuredCount} destacado{featuredCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay productos para gestionar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Producto</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Precio</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Oferta</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Destacado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category?.name}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    ${p.price.toLocaleString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleOffer(p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        p.is_offer ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          p.is_offer ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleFeatured(p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        p.is_featured ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          p.is_featured ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
