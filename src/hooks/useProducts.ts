import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  sizes: Record<string, number>;
  images: string[];
  featured: boolean;
  colores?: any;
  created_at: string;
  updated_at: string;
}

interface DbCategory {
  id: string;
  name: string;
  slug: string;
}

function dbProductToProduct(p: DbProduct, categoryName?: string, categorySlug?: string): Product {
  // Derive all available sizes from colores variants or fallback to sizes column
  const colores = (p.colores as any[]) || [];
  const hasVariants = colores.length > 0 && colores.some((c: any) => c.sizes && Object.keys(c.sizes).length > 0);

  let allSizes: string[] = [];
  if (hasVariants) {
    const sizeSet = new Set<string>();
    colores.forEach((c: any) => {
      if (c.sizes) Object.keys(c.sizes).forEach((s) => sizeSet.add(s));
    });
    allSizes = Array.from(sizeSet);
  } else if (p.sizes) {
    allSizes = Object.keys(p.sizes);
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: categoryName || "",
    categorySlug: categorySlug || "",
    sizes: allSizes,
    images: p.images || [],
    description: p.description || "",
    featured: p.featured,
    colores: colores,
  };
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as DbCategory[];
    },
  });
}

export function useProducts(categorySlug?: string) {
  return useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: false });

      if (categorySlug) {
        query = query.eq("categories.slug", categorySlug);
      }

      const { data, error } = await query;
      if (error) throw error;

      const products = (data as any[])
        .filter((p) => !categorySlug || p.categories)
        .map((p) =>
          dbProductToProduct(p, p.categories?.name, p.categories?.slug)
        );

      return products;
    },
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("featured", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((p) =>
        dbProductToProduct(p, p.categories?.name, p.categories?.slug)
      );
    },
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)") // El "*" ya trae la columna colores de SQL
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return dbProductToProduct(data as any, (data as any).categories?.name, (data as any).categories?.slug);
    },
    enabled: !!slug,
  });
}
