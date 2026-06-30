import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  featuredProducts: Product[];
  offerProducts: Product[];
  loading: boolean;
  error: string | null;
  searchProducts: (query: string) => Promise<Product[]>;
  getProductsByCategory: (categoryId: string) => Promise<Product[]>;
  getProductBySlug: (slug: string) => Promise<Product | null>;
  getCategoryBySlug: (slug: string) => Promise<Category | null>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*), images:product_images(*)')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('categories').select('*').order('display_order'),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar datos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const featuredProducts = products.filter((p) => p.is_featured);
  const offerProducts = products.filter((p) => p.is_offer);

  const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) throw error;
    return data || [];
  }, []);

  const getProductsByCategory = useCallback(async (categoryId: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('category_id', categoryId);

    if (error) throw error;
    return data || [];
  }, []);

  const getProductBySlug = useCallback(async (slug: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }, []);

  const getCategoryBySlug = useCallback(async (slug: string): Promise<Category | null> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        featuredProducts,
        offerProducts,
        loading,
        error,
        searchProducts,
        getProductsByCategory,
        getProductBySlug,
        getCategoryBySlug,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
