import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, ChevronDown, Loader2, CheckCircle, ArrowLeft, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AddressForm } from '@/components/address/AddressForm';
import type { Address } from '@/types';

export function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, loading: cartLoading, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const shipping = subtotal >= 100 ? 0 : 15;
  const total = subtotal + shipping;

  useEffect(() => {
    if (authLoading || !user) return;
    loadAddresses();
  }, [user, authLoading]);

  const loadAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) {
      setAddresses(data);
      const defaultAddr = data.find((a) => a.is_default) || data[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || items.length === 0) return;
    setPlacing(true);
    setError('');

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          subtotal,
          shipping,
          total,
          full_name: `${selectedAddress.first_name} ${selectedAddress.last_name}`,
          email: user.email,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          notes: selectedAddress.notes || null,
          first_name: selectedAddress.first_name,
          last_name: selectedAddress.last_name,
          neighborhood: selectedAddress.neighborhood,
          postal_code: selectedAddress.postal_code,
          department: selectedAddress.department,
        })
        .select('id')
        .single();

      if (orderError) throw new Error(orderError.message);

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || '',
        product_price: item.product?.price || 0,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw new Error(itemsError.message);

      await clearCart();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el pedido');
    } finally {
      setPlacing(false);
    }
  };

  if (authLoading || cartLoading) {
    return <LoadingSpinner text="Cargando..." />;
  }

  if (!user) {
    navigate('/mi-cuenta');
    return null;
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">
            Pedido Confirmado
          </h1>
          <p className="text-gray-600 mb-8">
            Recibiras un correo con los detalles de tu compra.
          </p>
          <button onClick={() => navigate('/mi-cuenta')} className="btn-primary">
            Ir a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Left: Address */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                Direccion de Envio
              </h2>

              {showForm ? (
                <AddressForm
                  onSave={() => { setShowForm(false); loadAddresses(); }}
                  onCancel={() => setShowForm(false)}
                />
              ) : (
                <>
                  {addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm mb-4">No tienes direcciones guardadas.</p>
                      <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
                        Agregar Direccion
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAddress?.id === addr.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddress?.id === addr.id}
                              onChange={() => setSelectedAddress(addr)}
                              className="mt-1 accent-primary-600"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{addr.first_name} {addr.last_name}</p>
                              <p className="text-sm text-gray-500">{addr.phone}</p>
                              <p className="text-sm text-gray-700 mt-1">{addr.address}</p>
                              <p className="text-sm text-gray-500">{addr.neighborhood}, {addr.city}, {addr.department}</p>
                              <p className="text-sm text-gray-400">CP {addr.postal_code}</p>
                              {addr.is_default && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                      <button onClick={() => setShowForm(true)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        + Agregar otra direccion
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" />
                Resumen del Pedido
              </h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.product?.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${((item.product?.price || 0) * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-2 text-sm">
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
                <div className="pt-2 border-t flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-700">${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || placing}
                className="w-full btn-primary mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Confirmar Pedido'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
