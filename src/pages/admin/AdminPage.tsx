import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Package, Layers, Percent, LayoutDashboard, ArrowLeft } from 'lucide-react';

const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Productos', path: '/admin/productos', icon: Package },
  { name: 'Categorias', path: '/admin/categorias', icon: Layers },
  { name: 'Ofertas', path: '/admin/ofertas', icon: Percent },
];

export function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const isDashboard = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-700 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LayoutDashboard className="w-8 h-8 text-white" />
              <div>
                <h1 className="font-display font-bold text-2xl text-white">Panel de Administracion</h1>
                <p className="text-primary-200 text-sm">Gestiona tu tienda</p>
              </div>
            </div>
            <Link to="/mi-cuenta" className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3 mb-8 lg:mb-0">
            <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
              {adminLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-6 py-4 transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="lg:col-span-9">
            {isDashboard ? (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Bienvenido al Panel de Administracion</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Link to="/admin/productos" className="p-6 bg-primary-50 rounded-xl hover:shadow-md transition-shadow">
                    <Package className="w-10 h-10 text-primary-600 mb-3" />
                    <h3 className="font-semibold text-gray-900">Productos</h3>
                    <p className="text-sm text-gray-500 mt-1">Administra tu catalogo de productos</p>
                  </Link>
                  <Link to="/admin/categorias" className="p-6 bg-primary-50 rounded-xl hover:shadow-md transition-shadow">
                    <Layers className="w-10 h-10 text-primary-600 mb-3" />
                    <h3 className="font-semibold text-gray-900">Categorias</h3>
                    <p className="text-sm text-gray-500 mt-1">Gestiona las categorias</p>
                  </Link>
                  <Link to="/admin/ofertas" className="p-6 bg-accent-50 rounded-xl hover:shadow-md transition-shadow">
                    <Percent className="w-10 h-10 text-accent-600 mb-3" />
                    <h3 className="font-semibold text-gray-900">Ofertas</h3>
                    <p className="text-sm text-gray-500 mt-1">Administra productos en oferta</p>
                  </Link>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
