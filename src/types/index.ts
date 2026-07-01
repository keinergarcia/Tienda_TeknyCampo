export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category_id: string | null;
  stock: number;
  is_featured: boolean;
  is_offer: boolean;
  created_at: string;
  category?: Category;
  images?: ProductImage[];
}

export interface CartItem {
  id: string;
  session_id: string | null;
  user_id: string | null;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping: number;
  total: number;
  full_name: string;
  email: string;
  phone: string | null;
  address: string;
  city: string;
  notes: string | null;
  first_name?: string;
  last_name?: string;
  neighborhood?: string;
  postal_code?: string;
  department?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  neighborhood: string;
  postal_code: string;
  city: string;
  department: string;
  notes: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}
