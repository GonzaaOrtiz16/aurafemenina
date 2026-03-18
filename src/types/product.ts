export interface ProductColorVariant {
  nombre: string;
  hex: string;
  sizes: Record<string, number>; // size → stock
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  subcategory?: string;
  subcategorySlug?: string;
  sizes: string[]; // all available sizes (derived)
  images: string[];
  colores?: ProductColorVariant[];
  description: string;
  featured?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  color?: string;
  quantity: number;
}

export type ShippingZone = "caba" | "zona_sur" | "gba" | "interior";

export type DeliveryMethod = "shipping" | "pickup";

export interface ShippingResult {
  cost: number;
  method: string;
  estimatedDays: string;
}
