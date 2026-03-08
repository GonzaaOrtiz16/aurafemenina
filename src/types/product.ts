export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  sizes: string[];
  images: string[];
  // Agregamos la definición de colores aquí
  colores?: { nombre: string, hex: string }[]; 
  description: string;
  featured?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  color?: string; // Para que el carrito guarde el color elegido
  quantity: number;
}

export type ShippingZone = "caba" | "zona_sur" | "gba" | "interior";

export interface ShippingResult {
  cost: number;
  method: string;
  estimatedDays: string;
}
