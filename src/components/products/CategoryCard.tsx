import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/categoria/${category.slug}`} className="group">
      <div className="card aspect-square relative overflow-hidden">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <Package className="w-16 h-16 text-primary-400" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-display font-bold text-xl text-white mb-1">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-200 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
