import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShoppingBag, Heart, LogOut, Settings, Package, Save, Trash2, ArrowLeft, Key, CheckCircle, AlertCircle, Layers, Percent, ShoppingCart, Image, MapPin, Plus, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProductsAdmin } from '@/pages/admin/ProductsAdmin';
import { CategoriesAdmin } from '@/pages/admin/CategoriesAdmin';
import { OffersAdmin } from '@/pages/admin/OffersAdmin';
import { HeroImagesAdmin } from '@/pages/admin/HeroImagesAdmin';
import { AddressForm } from '@/components/address/AddressForm';
import type { Order, WishlistItem, Address } from '@/types';

function CheckoutView() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-display font-bold text-3xl text-white">Checkout</h1>
          <p className="text-primary-100 mt-2">Completa tu pedido</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-display font-semibold text-xl text-gray-900 mb-2">Proximamente</h2>
          <p className="text-gray-500 mb-6">El sistema de pagos estara disponible pronto.</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Volver</button>
        </div>
      </div>
    </div>
  );
}

export function AccountPage() {
  const { user, isAdmin, loading, signIn, signUp, signOut } = useAuth();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const isCheckoutFlow = searchParams.get('checkout') === 'true';
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<'dashboard' | 'profile' | 'orders' | 'wishlist' | 'addresses' | 'admin-products' | 'admin-categories' | 'admin-offers' | 'admin-hero'>('dashboard');
  const [profileName, setProfileName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const loadAddresses = useCallback(async () => {
    if (!user) return;
    setAddressesLoading(true);
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setAddresses(data);
    setAddressesLoading(false);
  }, [user]);

  useEffect(() => {
    if (user && view === 'addresses') loadAddresses();
  }, [user, view, loadAddresses]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

  useEffect(() => {
    if (user && view === 'orders') {
      setOrdersLoading(true);
      supabase.from('orders').select('*, items:order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
        if (data) setOrders(data);
        setOrdersLoading(false);
      });
    }
  }, [user, view]);

  useEffect(() => {
    if (user && view === 'wishlist') {
      setWishlistLoading(true);
      supabase.from('wishlists').select('*, product:products(*, images:product_images(*))').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
        if (data) setWishlist(data);
        setWishlistLoading(false);
      });
    }
  }, [user, view]);

  const saveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileMessage(null);

    const needsPassword = newEmail || newPassword;
    if (needsPassword && !currentPassword) {
      setProfileMessage({ type: 'error', text: 'Ingresa tu contrasena actual para hacer cambios de seguridad.' });
      setProfileSaving(false);
      return;
    }

    try {
      if (needsPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: currentPassword,
        });
        if (signInError) {
          setProfileMessage({ type: 'error', text: 'Contrasena actual incorrecta. No se realizaron cambios.' });
          setProfileSaving(false);
          return;
        }
      }

      if (profileName.trim() && profileName !== (user.user_metadata?.full_name || '')) {
        await supabase.auth.updateUser({ data: { full_name: profileName } });
      }

      if (newEmail && newEmail !== user.email) {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw new Error(error.message);
        setProfileMessage({ type: 'success', text: 'Se envio un correo de confirmacion a ' + newEmail + '. Revisa tu bandeja de entrada.' });
      }

      if (newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw new Error(error.message);
        setProfileMessage({ type: 'success', text: 'Contrasena actualizada correctamente.' });
      }

      if (!newEmail && !newPassword) {
        setProfileMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al actualizar' });
    }

    setProfileSaving(false);
    setCurrentPassword('');
    if (!newEmail) setView('dashboard');
    setNewPassword('');
  };

  const removeFromWishlist = async (id: string) => {
    await supabase.from('wishlists').delete().eq('id', id);
    setWishlist(wishlist.filter((w) => w.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message === 'Invalid login credentials' ? 'Credenciales incorrectas.' : error.message);
    } else {
      const { error } = await signUp(email, password, name);
      if (error) setError(error.message.includes('already registered') ? 'Este correo ya esta registrado.' : error.message);
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner text="Cargando..." />;
  if (isCheckoutFlow) return <CheckoutView />;

  if (user) {
    if (view !== 'dashboard') {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Volver a Mi Cuenta
              </button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {view === 'profile' && (
              <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-8">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Editar Perfil</h2>

                {profileMessage && (
                  <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 text-sm ${
                    profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {profileMessage.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                    {profileMessage.text}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <User className="w-4 h-4" /> Nombre Completo
                    </label>
                    <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="input-field" placeholder="Tu nombre" />
                  </div>

                  <div className="p-4 bg-primary-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Cambiar Correo Electronico
                    </label>
                    <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="input-field" placeholder={user.email || 'nuevo@email.com'} />
                    <p className="text-xs text-gray-400 mt-1">Te llegara un correo de confirmacion a la nueva direccion</p>
                  </div>

                  <div className="p-4 bg-primary-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Key className="w-4 h-4" /> Cambiar Contrasena
                    </label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="Nueva contrasena (min 6 caracteres)" minLength={6} />
                    <p className="text-xs text-gray-400 mt-1">Minimo 6 caracteres</p>
                  </div>

                  {(newEmail || newPassword) && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-600" /> Verificar identidad
                      </label>
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" placeholder="Tu contrasena actual" required />
                      <p className="text-xs text-yellow-600 mt-1">Ingresa tu contrasena actual para autorizar estos cambios</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button onClick={() => setView('dashboard')} className="btn-secondary text-sm">Cancelar</button>
                  <button onClick={saveProfile} disabled={profileSaving} className="btn-primary text-sm">
                    <Save className="w-4 h-4 mr-2" />
                    {profileSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            )}

            {view === 'orders' && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Mis Pedidos</h2>
                {ordersLoading ? <LoadingSpinner text="Cargando pedidos..." /> : orders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tienes pedidos aun.</p>
                    <Link to="/productos" className="btn-primary mt-4 inline-flex">Explorar Productos</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Pedido #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('es-ES')}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'confirmed' ? 'bg-primary-100 text-primary-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status === 'pending' ? 'Pendiente' :
                             order.status === 'confirmed' ? 'Confirmado' :
                             order.status === 'shipped' ? 'Enviado' :
                             order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                          </span>
                        </div>
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-2 border-t border-gray-100">
                            <span className="text-sm text-gray-900">{item.product_name} x{item.quantity}</span>
                            <span className="text-sm font-medium">${(item.product_price * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-3 mt-2 border-t border-gray-200 font-semibold">
                          <span>Total</span>
                          <span className="text-primary-700">${order.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'admin-products' && isAdmin && (
              <ProductsAdmin />
            )}
            {view === 'admin-categories' && isAdmin && (
              <CategoriesAdmin />
            )}
            {view === 'admin-offers' && isAdmin && (
              <OffersAdmin />
            )}
            {view === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-xl text-gray-900">Mis Direcciones</h2>
                  <button onClick={() => { setEditingAddress(null); setShowAddressForm(true); }} className="btn-primary text-sm">
                    <Plus className="w-4 h-4 mr-2" />Agregar Direccion
                  </button>
                </div>

                {showAddressForm && (
                  <div className="mb-6">
                    <AddressForm
                      address={editingAddress || undefined}
                      onSave={() => { setShowAddressForm(false); setEditingAddress(null); loadAddresses(); }}
                      onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }}
                    />
                  </div>
                )}

                {addressesLoading ? <LoadingSpinner text="Cargando direcciones..." /> : addresses.length === 0 && !showAddressForm ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No has agregado direcciones aun.</p>
                    <button onClick={() => { setEditingAddress(null); setShowAddressForm(true); }} className="btn-primary mt-4 inline-flex">
                      <Plus className="w-4 h-4 mr-2" />Agregar Direccion
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-white rounded-xl shadow-sm p-5 relative">
                        {addr.is_default && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                            Predeterminada
                          </span>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <MapPin className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{addr.first_name} {addr.last_name}</p>
                            <p className="text-sm text-gray-500">{addr.phone}</p>
                            <p className="text-sm text-gray-700 mt-2">{addr.address}</p>
                            <p className="text-sm text-gray-500">{addr.neighborhood}, {addr.city}</p>
                            <p className="text-sm text-gray-500">{addr.department} - CP {addr.postal_code}</p>
                            {addr.notes && <p className="text-sm text-gray-400 mt-1 italic">{addr.notes}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }}
                          className="mt-3 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {view === 'admin-hero' && isAdmin && (
              <HeroImagesAdmin />
            )}
            {view === 'wishlist' && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Lista de Deseos</h2>
                {wishlistLoading ? <LoadingSpinner text="Cargando lista..." /> : wishlist.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No has guardado productos aun.</p>
                    <Link to="/productos" className="btn-primary mt-4 inline-flex">Explorar Productos</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((w) => {
                      const p = w.product;
                      if (!p) return null;
                      const firstImage = p.images?.[0]?.url
                        ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0].url}`
                        : p.image_url;
                      return (
                        <div key={w.id} className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                          <Link to={`/producto/${p.slug}`} className="block">
                            <div className="aspect-square bg-gray-100 relative">
                              {firstImage ? (
                                <img src={firstImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary-50">
                                  <Package className="w-12 h-12 text-primary-300" />
                                </div>
                              )}
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(w.id); }}
                                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                                aria-label="Quitar de favoritos"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </Link>
                          <div className="p-4">
                            <p className="font-medium text-gray-900 truncate">{p.name}</p>
                            <p className="text-lg font-bold text-primary-700 mt-1">
                              ${p.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </p>
                            <button
                              onClick={() => addToCart(p, 1)}
                              className="mt-3 w-full btn-primary text-sm"
                              aria-label={`Agregar ${p.name} al carrito`}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Agregar al Carrito
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-white">Hola, {userName}</h1>
                <p className="text-primary-100">{user.email}{isAdmin && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">Admin</span>}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => { setProfileName(user.user_metadata?.full_name || ''); setView('profile'); }} className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Mi Perfil</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">Gestiona tu informacion personal y preferencias.</p>
              <span className="inline-flex items-center gap-2 text-primary-600 text-sm font-medium">
                <Settings className="w-4 h-4" />Editar Perfil
              </span>
            </button>

            <button onClick={() => { setView('addresses'); loadAddresses(); }} className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Mis Direcciones</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">Administra tus direcciones de envio.</p>
              <span className="inline-flex items-center gap-2 text-primary-600 text-sm font-medium">
                <MapPin className="w-4 h-4" />Ver Direcciones
              </span>
            </button>

            <button onClick={() => setView('orders')} className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Mis Pedidos</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">Revisa el historial de tus compras y su estado.</p>
              <span className="inline-flex items-center gap-2 text-primary-600 text-sm font-medium">
                <Package className="w-4 h-4" />Ver Pedidos
              </span>
            </button>

            <button onClick={() => setView('wishlist')} className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Lista de Deseos</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">Productos que has guardado para despues.</p>
              <span className="inline-flex items-center gap-2 text-primary-600 text-sm font-medium">
                <Heart className="w-4 h-4" />Ver Lista
              </span>
            </button>
          </div>

          {isAdmin && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Administrar Tienda</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onClick={() => setView('admin-products')} className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow border border-primary-100 hover:border-primary-300">
                  <Package className="w-8 h-8 text-primary-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Productos</h3>
                  <p className="text-sm text-gray-500">Crear, editar y eliminar productos</p>
                </button>
                <button onClick={() => setView('admin-categories')} className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow border border-primary-100 hover:border-primary-300">
                  <Layers className="w-8 h-8 text-primary-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Categorias</h3>
                  <p className="text-sm text-gray-500">Gestionar categorias del catalogo</p>
                </button>
                <button onClick={() => setView('admin-offers')} className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow border border-accent-100 hover:border-accent-300">
                  <Percent className="w-8 h-8 text-accent-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Ofertas</h3>
                  <p className="text-sm text-gray-500">Activar descuentos y destacados</p>
                </button>
                <button onClick={() => setView('admin-hero')} className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow border border-primary-100 hover:border-primary-300">
                  <Image className="w-8 h-8 text-primary-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Hero Banner</h3>
                  <p className="text-sm text-gray-500">Gestionar imagenes del banner principal</p>
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button onClick={signOut} className="inline-flex items-center gap-2 text-gray-500 hover:text-red-500 font-medium transition-colors">
              <LogOut className="w-4 h-4" />Cerrar Sesion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">Mi Cuenta</h1>
              <p className="text-primary-100">Inicia sesion o crea una cuenta</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button onClick={() => { setIsLogin(true); setError(null); }} className={`flex-1 py-4 text-center font-medium transition-colors ${isLogin ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'}`}>Iniciar Sesion</button>
              <button onClick={() => { setIsLogin(false); setError(null); }} className={`flex-1 py-4 text-center font-medium transition-colors ${!isLogin ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'}`}>Registrarse</button>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" required={!isLogin} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electronico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contrasena</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" placeholder={isLogin ? "Tu contrasena" : "Crear contrasena (min 6 caracteres)"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" required minLength={6} />
                  </div>
                </div>
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={submitting} className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Procesando...' : isLogin ? 'Iniciar Sesion' : 'Crear Cuenta'}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-500 text-sm mb-4">O continua como invitado</p>
                <Link to="/productos" className="w-full btn-secondary flex items-center justify-center">Explorar Productos</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
