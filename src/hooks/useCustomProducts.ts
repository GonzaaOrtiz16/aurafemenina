import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EncargueCategory {
  id: string;
  name: string;
  slug: string;
}

export interface EncargueSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

export interface CustomProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  price_estimate: number;
  original_price: number | null;
  estimated_days: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  colores: any[];
  sizes: Record<string, number>;
  featured: boolean;
}

export function useEncargueCategories() {
  return useQuery({
    queryKey: ["encargue_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("encargue_categories").select("*").order("name");
      if (error) throw error;
      return data as EncargueCategory[];
    },
  });
}

export function useEncargueSubcategories() {
  return useQuery({
    queryKey: ["encargue_subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("encargue_subcategories").select("*").order("name");
      if (error) throw error;
      return data as EncargueSubcategory[];
    },
  });
}

export function useCustomProducts() {
  return useQuery({
    queryKey: ["custom_products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CustomProduct[];
    },
  });
}

export function useCustomProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["custom_product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_products").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return (data ?? null) as CustomProduct | null;
    },
    enabled: !!slug,
  });
}