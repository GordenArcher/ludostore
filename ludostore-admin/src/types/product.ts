export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  order: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  regular_price: string;
  sale_price: string | null;
  current_price: string;
  stock_quantity: number;
  stock_status: "in_stock" | "out_of_stock" | "backorder";
  category_name: string;
  is_active: boolean;
  featured: boolean;
  images: ProductImage[];
  created_at: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
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
  status: string;
  message: string;
  data: {
    products: AdminProduct[];
    pagination: Pagination;
  };
}

export interface CategoriesResponse {
  status: string;
  message: string;
  data: {
    categories: AdminCategory[];
    pagination: Pagination;
  };
}
