export interface ProductImage {
  id: string;
  product: string;
  image: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  category_name: string;
  regular_price: string;
  sale_price: string | null;
  current_price: string;
  sku: string;
  stock_quantity: number;
  stock_status: "in_stock" | "out_of_stock" | "backorder";
  is_active: boolean;
  featured: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  is_in_wishlist?: boolean;
  is_in_cart?: boolean;
  cart_item_id?: string;
  cart_quantity?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProductsResponse {
  status: "success" | "error";
  message: string;
  http_status: number;
  data: {
    products: Product[];
    pagination: Pagination;
  };
  request_id: string;
}

export interface CategoriesResponse {
  status: "success" | "error";
  message: string;
  http_status: number;
  data: {
    categories: Category[];
    pagination: Pagination;
  };
  request_id: string;
}

export interface ProductResponse {
  status: "success" | "error";
  message: string;
  http_status: number;
  data: Product;
  request_id: string;
}

export interface CategoryResponse {
  status: "success" | "error";
  message: string;
  http_status: number;
  data: Category;
  request_id: string;
}
