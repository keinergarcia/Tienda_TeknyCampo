import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function CartPage() {
  const { items, loading, error, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner text="Cargando carrito..." />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">
              Tu carrito esta vacio
            </h1>
            <p className="text-gray-600 mb-8">
              Parece que aun no has agregado ningun producto a tu carrito.
            </p>
            <Link to="/productos" className="btn-primary">
              Explorar productos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= 100 ? 0 : 15;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      navigate('/mi-cuenta');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-3xl text-gray-900">
                Carrito de Compras
              </h1>
              <p className="text-gray-600 mt-1">
                {items.length} producto{items.length !== 1 ? 's' : ''} en tu carrito
              </p>
            </div>
            <button
              onClick={clearCart}
              className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  return (
                    <li key={item.id} className="p-6">
                      <div className="flex gap-6">
                        <Link to={`/producto/${product.slug}`} className="flex-shrink-0">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-50">
                                <Package className="w-10 h-10 text-primary-300" />
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link to={`/producto/${product.slug}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          {product.category && (
                            <p className="text-sm text-primary-600 mt-1">
                              {product.category.name}
                            </p>
                          )}
                          <p className="text-lg font-bold text-primary-700 mt-2">
                            ${product.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </p>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 transition-colors"
                                aria-label="Reducir cantidad"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 font-medium min-w-[50px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= product.stock}
                                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="hidden sm:block text-right">
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${(product.price * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Link
              to="/productos"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mt-6"
            >
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
              Continuar comprando
            </Link>
          </div>

          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="font-display font-semibold text-lg text-gray-900 mb-4">
                Resumen del Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envio</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Gratis</span>
                  ) : (
                    <span>${shipping.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-gray-500">
                    Envio gratis en compras mayores a $100
                  </p>
                )}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-primary-700">
                      ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary text-lg py-4"
              >
                {user ? 'Proceder al Pago' : 'Inicia Sesion para Comprar'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {user
                  ? 'Los impuestos y el envio se calcularan en el checkout'
                  : 'Necesitas una cuenta para completar la compra'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
