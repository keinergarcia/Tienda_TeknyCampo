import { Package, Truck, MapPin, CheckCircle, XCircle } from 'lucide-react';
import type { Order } from '@/types';

const steps = [
  { key: 'pending', label: 'Pendiente', icon: Package },
  { key: 'confirmed', label: 'Confirmado', icon: CheckCircle },
  { key: 'shipped', label: 'Enviado', icon: Truck },
  { key: 'delivered', label: 'Entregado', icon: MapPin },
];

const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];

export function OrderStatusBar({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="w-5 h-5 text-red-500" />
        <span className="text-sm font-medium text-red-700">Pedido Cancelado</span>
      </div>
    );
  }

  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = i <= currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-medium mt-2 whitespace-nowrap ${
                  isCompleted ? 'text-primary-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  i < currentIdx ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
