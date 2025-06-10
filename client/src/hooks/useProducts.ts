
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Use the Supabase database types directly
type ProductRow = Database['public']['Tables']['products']['Row'];

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  category: string;
  brand: string;
  rating: number;
  featured: boolean;
  specs: string[];
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
}

// Helper function to transform Supabase row to Product
const transformProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name || '',
  description: row.description,
  price: Number(row.price) || 0,
  image_url: row.image_url || '',
  category: row.category || '',
  brand: row.brand || '',
  rating: Number(row.rating) || 0,
  featured: row.featured || false,
  specs: Array.isArray(row.specs) ? row.specs as string[] : [],
  created_at: row.created_at,
  updated_at: row.updated_at,
  user_id: row.user_id,
});

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return (data || []).map(transformProduct);
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }

      return (data || []).map(transformProduct);
    },
  });
};

export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['products-by-category', category],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }

      return (data || []).map(transformProduct);
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', parseInt(id))
        .maybeSingle();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      return data ? transformProduct(data) : null;
    },
  });
};

export const useSimilarProducts = (productId: string, category: string, limit: number = 3) => {
  return useQuery({
    queryKey: ['similar-products', productId, category],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('category', category)
        .neq('id', parseInt(productId))
        .limit(limit);

      if (error) {
        console.error('Error fetching similar products:', error);
        throw error;
      }

      return (data || []).map(transformProduct);
    },
  });
};

export const useUserProducts = (userId: string) => {
  return useQuery({
    queryKey: ['user-products', userId],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user products:', error);
        throw error;
      }

      return (data || []).map(transformProduct);
    },
  });
};
