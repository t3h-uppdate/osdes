export type ProductVariant = {
  type: string; // e.g., "Color", "Size"
  options: string[]; // e.g., ["Red", "Blue"], ["S", "M", "L"]
  // OR define specific variant combinations with stock/SKU adjustments
  // sku_suffix?: string;
  // value?: string; // e.g., "Red"
  // stock_adjustment?: number;
};

export type ProductShippingOption = {
  name: string; // e.g., "Standard", "Express"
  cost: number;
  estimated_days?: number | string; // e.g., 5 or "5-7"
};

export type ProductDimensions = {
  length?: number;
  width?: number;
  height?: number;
  unit?: 'cm' | 'in' | string; // Allow common units or custom string
};

export type ProductImage = {
  url: string;
  alt?: string; // Optional alt text for accessibility
};

export type ProductAvailabilityStatus = 'In Stock' | 'Out of Stock' | 'Pre-order';

export interface Product {
  id: string; // UUID
  name: string;
  short_description?: string;
  full_description?: string;
  category?: string;
  images?: ProductImage[] | string[]; // Array of image objects or just URLs
  video_url?: string;
  price: number;
  sale_price?: number;
  currency: string; // ISO 4217 code
  discount_percentage?: number;
  is_subscription?: boolean;
  subscription_details?: string;
  stock_quantity: number;
  availability_status: ProductAvailabilityStatus;
  sku: string; // Unique Stock Keeping Unit
  variants?: ProductVariant[] | Record<string, any>; // Flexible variants definition
  shipping_options?: ProductShippingOption[];
  estimated_delivery_time?: string;
  shipping_cost?: number; // Default/base shipping cost
  return_policy?: string;
  tags?: string[]; // Array of keywords
  dimensions?: ProductDimensions;
  weight?: number;
  weight_unit?: 'kg' | 'lb' | string; // Common weight units or custom
  material?: string;
  slug?: string; // Add the optional slug field
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// Type for creating a new product (omits id, created_at, updated_at)
export type NewProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

// Type for updating a product (makes all fields optional except id)
export type UpdateProduct = Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
};
