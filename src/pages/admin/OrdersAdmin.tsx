import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Order } from '@/types';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

function getPeriodStart(period: Period): string | null {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'today') return start.toISOString();

  if (period === 'week') {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    return start.toISOString();
  }

  if (period === 'month') {
    start.setDate(1);
    return start.toISOString();
  }

  if (period === 'year') {
    start.setMonth(0, 1);
    return start.toISOString();
  }

  return null;
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

const validTransitions: Record<string, string[]> = {
  pending: ['confirmed'],
  confirmed: ['shipped'],
  shipped: ['delivered'],
};

export function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    const periodStart = getPeriodStart(period);
    if (periodStart) {
      query = query.gte('created_at', periodStart);
    }

    const { data } = await query;
    if (data) setOrders(data as Order[]);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (order.order_number && order.order_number.toLowerCase().includes(q)) ||
      (order.full_name && order.full_name.toLowerCase().includes(q)) ||
      (order.email && order.email.toLowerCase().includes(q))
    );
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
      )
    );
    setUpdatingId(null);
  };

  if (loading) return <LoadingSpinner text="Cargando pedidos..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-gray-900">Pedidos</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        {(['today', 'week', 'month', 'year', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              period === p
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {p === 'today' ? 'Hoy' : p === 'week' ? 'Esta Semana' : p === 'month' ? 'Este Mes' : p === 'year' ? 'Este Año' : 'Todo'}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido..."
            className="input-field pl-9 py-1.5 text-sm w-64"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay pedidos.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">N° Pedido</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fecha</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Productos</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <>
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium text-sm"
                      >
                        {expanded[order.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {order.order_number || order.id.slice(0, 8)}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.full_name}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${order.total.toLocaleString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusColors[order.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                        {order.status !== 'cancelled' &&
                          order.status !== 'delivered' &&
                          validTransitions[order.status] && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) handleStatusChange(order.id, e.target.value);
                              }}
                              disabled={updatingId === order.id}
                              className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-500 bg-white cursor-pointer hover:border-gray-300"
                            >
                              <option value="" disabled>
                                Cambiar
                              </option>
                              {validTransitions[order.status].map((next) => (
                                <option key={next} value={next}>
                                  {statusLabels[next]}
                                </option>
                              ))}
                            </select>
                          )}
                      </div>
                    </td>
                  </tr>
                  {expanded[order.id] && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-6 text-sm">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Informacion de Envio</h4>
                            <div className="space-y-1 text-gray-600">
                              <p>
                                <span className="text-gray-500">Direccion:</span> {order.address}
                              </p>
                              {order.neighborhood && (
                                <p>
                                  <span className="text-gray-500">Barrio:</span> {order.neighborhood}
                                </p>
                              )}
                              <p>
                                <span className="text-gray-500">Ciudad:</span> {order.city}
                              </p>
                              {order.department && (
                                <p>
                                  <span className="text-gray-500">Depto:</span> {order.department}
                                </p>
                              )}
                              {order.postal_code && (
                                <p>
                                  <span className="text-gray-500">CP:</span> {order.postal_code}
                                </p>
                              )}
                              {order.phone && (
                                <p>
                                  <span className="text-gray-500">Telefono:</span> {order.phone}
                                </p>
                              )}
                              {order.notes && (
                                <p>
                                  <span className="text-gray-500">Notas:</span> {order.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Productos</h4>
                            {order.items && order.items.length > 0 ? (
                              <ul className="space-y-2">
                                {order.items.map((item) => (
                                  <li key={item.id} className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                      {item.product_name} x{item.quantity}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      ${(item.product_price * item.quantity).toLocaleString('es-ES')}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-400">Sin productos</p>
                            )}
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span>${order.subtotal.toLocaleString('es-ES')}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Envio</span>
                                <span>${order.shipping.toLocaleString('es-ES')}</span>
                              </div>
                              <div className="flex justify-between text-sm font-semibold text-gray-900">
                                <span>Total</span>
                                <span>${order.total.toLocaleString('es-ES')}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-400 space-y-1">
                              <p>
                                Creado:{' '}
                                {new Date(order.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}{' '}
                                {new Date(order.created_at).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
