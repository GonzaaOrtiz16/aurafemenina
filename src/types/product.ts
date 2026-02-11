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
  description: string;
  featured?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface ShippingResult {
  cost: number;
  method: string;
  estimatedDays: string;
}
