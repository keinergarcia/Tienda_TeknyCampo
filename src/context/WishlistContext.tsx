import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setWishlistIds(new Set(data?.map((w) => w.product_id) || []));
        setLoading(false);
      });
  }, [user]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) return;

    const isInWishlist = wishlistIds.has(productId);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isInWishlist) next.delete(productId);
      else next.add(productId);
      return next;
    });

    if (isInWishlist) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId });
    }
  }, [user, wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
