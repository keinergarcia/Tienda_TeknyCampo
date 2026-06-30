import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getSessionId } from '@/lib/session';
import { useAuth } from '@/context/AuthContext';
import type { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      setError(null);
      const sessionId = getSessionId();

      let query = supabase
        .from('cart_items')
        .select('*, product:products(*)');

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar el carrito';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      setError(null);
      const sessionId = getSessionId();
      const existingItem = items.find((item) => item.product_id === product.id);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      const payload: Record<string, unknown> = {
        product_id: product.id,
        quantity,
      };

      if (user) {
        payload.user_id = user.id;
      } else {
        payload.session_id = sessionId;
      }

      const { error } = await supabase.from('cart_items').insert(payload);
      if (error) throw error;
      await fetchCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al agregar al carrito';
      setError(message);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setError(null);
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar cantidad';
      setError(message);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setError(null);
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) throw error;
      await fetchCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar del carrito';
      setError(message);
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      const sessionId = getSessionId();

      let query = supabase.from('cart_items').delete();

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { error } = await query;
      if (error) throw error;
      await fetchCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al vaciar el carrito';
      setError(message);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
