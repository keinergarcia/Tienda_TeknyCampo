import { useState, useEffect } from 'react';
import { Users, Search, Crown, AlertTriangle, ChevronDown, ChevronUp, DollarSign, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Order } from '@/types';

interface Customer {
  user_id: string;
  email: string;
  full_name: string;
  orders: Order[];
  totalSpent: number;
  lastOrderDate: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Order[]>();
  for (const o of orders) {
    const arr = map.get(o.user_id);
    if (arr) arr.push(o);
    else map.set(o.user_id, [o]);
  }

  const customers: Customer[] = [];
  for (const [user_id, userOrders] of map) {
    const sorted = [...userOrders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latest = sorted[0];
    customers.push({
      user_id,
      email: latest.email,
      full_name: latest.full_name,
      orders: sorted,
      totalSpent: userOrders.reduce((sum, o) => sum + o.total, 0),
      lastOrderDate: latest.created_at,
    });
  }

  return customers.sort(
    (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
  );
}

export function CustomersAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setCustomers(buildCustomers(data));
      setLoading(false);
    })();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const vip = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const inactive = customers.filter(
    (c) => new Date(c.lastOrderDate) < threeMonthsAgo
  );

  if (loading) return <LoadingSpinner text="Cargando clientes..." />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-primary-600" />
        <h2 className="font-display font-bold text-xl text-gray-900">
          Clientes ({customers.length})
        </h2>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="input-field pl-10"
        />
      </div>

      {vip.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="font-display font-semibold text-lg text-gray-900">Clientes VIP</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {vip.map((c) => (
              <div key={c.user_id} className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">VIP</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate">{c.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{c.email}</p>
                <p className="text-sm font-bold text-primary-600 mt-2">{formatCurrency(c.totalSpent)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="font-display font-semibold text-lg text-gray-900">Clientes Inactivos</h3>
            <span className="text-xs text-gray-400">(&gt;3 meses sin comprar)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {inactive.map((c) => (
              <div key={c.user_id} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Inactivo</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate">{c.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{c.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Ultima compra: {formatDate(c.lastOrderDate)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron clientes.</p>
          </div>
        ) : (
          filtered.map((c) => {
            const isExpanded = expandedId === c.user_id;
            return (
              <div key={c.user_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : c.user_id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{c.full_name}</p>
                    <p className="text-sm text-gray-500 truncate">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-6 mx-4 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Pedidos</p>
                      <p className="font-semibold text-gray-900">{c.orders.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Gasto total</p>
                      <p className="font-semibold text-primary-600">{formatCurrency(c.totalSpent)}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400">Ultimo pedido</p>
                      <p className="text-sm text-gray-600">{formatDate(c.lastOrderDate)}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-primary-600" />
                        <span>
                          Gasto total: <strong className="text-primary-600">{formatCurrency(c.totalSpent)}</strong>
                        </span>
                        <span className="text-gray-300 mx-2">|</span>
                        <ShoppingBag className="w-4 h-4 text-primary-600" />
                        <span>
                          Pedidos: <strong>{c.orders.length}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {c.orders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <p className="font-medium text-gray-900 text-sm">
                              #{o.order_number || o.id.slice(0, 8)}
                            </p>
                            <span className="text-xs text-gray-400">{formatDate(o.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                              {statusLabels[o.status] || o.status}
                            </span>
                            <span className="font-semibold text-sm text-gray-900">{formatCurrency(o.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
