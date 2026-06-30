import { Package } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Package className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
