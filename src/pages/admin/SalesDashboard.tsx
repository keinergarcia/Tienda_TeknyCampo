import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, BarChart3, Crown, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import type { Order } from '@/types';

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

interface DailyRow {
  date: string;
  total: number;
}

export function SalesDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOrders = async (sd: string, ed: string) => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true });

    if (sd) query = query.gte('created_at', `${sd}T00:00:00`);
    if (ed) query = query.lte('created_at', `${ed}T23:59:59`);

    const { data } = await query;
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(startDate, endDate);
  }, [startDate, endDate]);

  const totalVentas = orders.reduce((s, o) => s + o.total, 0);
  const totalPedidos = orders.length;
  const pedidoPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;
  const productosVendidos = orders.reduce((s, o) => {
    if (!o.items) return s;
    return s + o.items.reduce((si, i) => si + i.quantity, 0);
  }, 0);

  const dailyMap = new Map<string, number>();
  for (const o of orders) {
    const day = o.created_at.slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) || 0) + o.total);
  }
  const dailySales: DailyRow[] = Array.from(dailyMap, ([date, total]) => ({ date, total }));

  let cumulative = 0;
  const cumulativeData = dailySales.map((d) => {
    cumulative += d.total;
    return { date: d.date, cumulative };
  });

  const bestDay = dailySales.reduce(
    (best, d) => (d.total > best.total ? d : best),
    { date: '', total: 0 },
  );

  const topSellersMap = new Map<string, { qty: number; revenue: number }>();
  for (const o of orders) {
    if (!o.items) continue;
    for (const item of o.items) {
      const prev = topSellersMap.get(item.product_name) || { qty: 0, revenue: 0 };
      topSellersMap.set(item.product_name, {
        qty: prev.qty + item.quantity,
        revenue: prev.revenue + item.product_price * item.quantity,
      });
    }
  }
  const topSellers = Array.from(topSellersMap, ([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Dashboard de Ventas</h2>

      <div className="flex items-center gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando ventas..." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard icon={DollarSign} label="Total Ventas" value={`$${fmt(totalVentas)}`} />
            <SummaryCard icon={ShoppingBag} label="Total Pedidos" value={totalPedidos.toString()} />
            <SummaryCard icon={TrendingUp} label="Pedido Promedio" value={`$${fmt(pedidoPromedio)}`} />
            <SummaryCard icon={BarChart3} label="Productos Vendidos" value={productosVendidos.toString()} />
          </div>

          {dailySales.length > 0 && bestDay.total > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border-l-4 border-yellow-400">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Día de Mayor Venta</p>
                  <p className="text-xl font-bold text-gray-900">
                    {fmtDate(bestDay.date)} — <span className="text-primary-600">${fmt(bestDay.total)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-display font-semibold text-gray-900 mb-4">Ventas Diarias</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySales}>
                  <XAxis dataKey="date" tickFormatter={(d) => fmtDate(d)} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip
                    labelFormatter={(d) => fmtDate(d)}
                    formatter={(value: number) => [`$${fmt(value)}`, 'Total']}
                  />
                  <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-display font-semibold text-gray-900 mb-4">Ventas Acumuladas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => fmtDate(d)} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip
                    labelFormatter={(d) => fmtDate(d)}
                    formatter={(value: number) => [`$${fmt(value)}`, 'Acumulado']}
                  />
                  <Line type="monotone" dataKey="cumulative" stroke="#7c3aed" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary-600" />
              <h3 className="font-display font-semibold text-gray-900">Top Vendedores</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">#</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Producto</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Cantidad Vendida</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topSellers.map((item, i) => (
                    <tr key={item.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">{item.qty}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        ${fmt(item.revenue)}
                      </td>
                    </tr>
                  ))}
                  {topSellers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        No hay datos de ventas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
