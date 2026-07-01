import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const CategoryDetailPage = lazy(() => import('@/pages/CategoryDetailPage').then(m => ({ default: m.CategoryDetailPage })));
const OffersPage = lazy(() => import('@/pages/OffersPage').then(m => ({ default: m.OffersPage })));
const CartPage = lazy(() => import('@/pages/CartPage').then(m => ({ default: m.CartPage })));
const AccountPage = lazy(() => import('@/pages/AccountPage').then(m => ({ default: m.AccountPage })));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const ProductsAdmin = lazy(() => import('@/pages/admin/ProductsAdmin').then(m => ({ default: m.ProductsAdmin })));
const CategoriesAdmin = lazy(() => import('@/pages/admin/CategoriesAdmin').then(m => ({ default: m.CategoriesAdmin })));
const OffersAdmin = lazy(() => import('@/pages/admin/OffersAdmin').then(m => ({ default: m.OffersAdmin })));
const OrdersAdmin = lazy(() => import('@/pages/admin/OrdersAdmin').then(m => ({ default: m.OrdersAdmin })));
const SalesDashboard = lazy(() => import('@/pages/admin/SalesDashboard').then(m => ({ default: m.SalesDashboard })));
const CustomersAdmin = lazy(() => import('@/pages/admin/CustomersAdmin').then(m => ({ default: m.CustomersAdmin })));
const TermsPage = lazy(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));

function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner text="Cargando..." />}>{children}</Suspense>;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<LazyRoute><HomePage /></LazyRoute>} />
                  <Route path="productos" element={<LazyRoute><ProductsPage /></LazyRoute>} />
                  <Route path="producto/:slug" element={<LazyRoute><ProductDetailPage /></LazyRoute>} />
                  <Route path="categorias" element={<LazyRoute><CategoriesPage /></LazyRoute>} />
                  <Route path="categoria/:slug" element={<LazyRoute><CategoryDetailPage /></LazyRoute>} />
                  <Route path="ofertas" element={<LazyRoute><OffersPage /></LazyRoute>} />
                  <Route path="carrito" element={<LazyRoute><CartPage /></LazyRoute>} />
                  <Route path="mi-cuenta" element={<LazyRoute><AccountPage /></LazyRoute>} />
                  <Route path="checkout" element={<LazyRoute><CheckoutPage /></LazyRoute>} />
                  <Route path="terminos" element={<LazyRoute><TermsPage /></LazyRoute>} />
                  <Route path="privacidad" element={<LazyRoute><PrivacyPage /></LazyRoute>} />
                  <Route path="*" element={<LazyRoute><NotFoundPage /></LazyRoute>} />
                </Route>
                <Route path="admin" element={<LazyRoute><AdminPage /></LazyRoute>}>
                  <Route index element={null} />
                  <Route path="productos" element={<LazyRoute><ProductsAdmin /></LazyRoute>} />
                  <Route path="categorias" element={<LazyRoute><CategoriesAdmin /></LazyRoute>} />
                  <Route path="ofertas" element={<LazyRoute><OffersAdmin /></LazyRoute>} />
                  <Route path="pedidos" element={<LazyRoute><OrdersAdmin /></LazyRoute>} />
                  <Route path="ventas" element={<LazyRoute><SalesDashboard /></LazyRoute>} />
                  <Route path="clientes" element={<LazyRoute><CustomersAdmin /></LazyRoute>} />
                </Route>
              </Routes>
            </Router>
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
