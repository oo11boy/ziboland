import { RowDataPacket } from 'mysql2/promise';

export interface CategoryRow extends RowDataPacket {
  cat_id: number;
  cat_name: string;
  link: string;
  mothercat: number;
  icon: string;
  subcat_id: number | null;
  subcat_name: string | null;
  item_id: number | null;
  item_name: string | null;
}
export interface ProductRow extends RowDataPacket {
  product_id: number;
  brand_id: number | null;
  title: string;
  image: string;
  originalPrice: string;
  discountedPrice: string;
  wholesalePrice: string;
  discountwholesalePrice: string;
  minwholesale: number;
  discount: string;
  discountwholesale: string;
  category: string;
  mothercatId: number;
  subcatId: number;
  rating: number;
  inStock: number;
  numericPrice: number;
  sales: number;
  features: string | null;
  content: string | null;
  media_type: string | null;
  media_src: string | null;
  media_thumbnail: string | null;
  media_alt: string | null;
  englishName: string | null;
  persianName: string | null;
  hexCode: string | null;
  infotable_id: number | null;
  infotable_name: string | null;
  infotable_value: string | null;
  comment_id: number | null;
  comment_product_id: number | null; // Add
  comment_name: string | null;
  comment_rating: number | null;
  comment_text: string | null;
  comment_date: string | null;
  comment_status: number | null; // Add
  comment_is_admin: number | null; // Add
  brand_title: string | null;
  brand_img: string | null;
  brand_link: string | null;
}
export interface Categoryapi {
  id: number;
  name: string;
  link: string;
  mothercat: number;
  icon: string;
  subcat: { id: number; name: string; items: { id: number; name: string }[] }[];
}

export interface Product {
  id: number;
  brand_id: number | null;
  title: string;
  image: string;
  originalPrice: string;
  discountedPrice: string;
  wholesalePrice: string;
  discountwholesalePrice: string;
  minwholesale: number;
  discount: string;
  discountwholesale: string;
  category: string;
  mothercatId: number;
  subcatId: number;
  rating: number;
  inStock: boolean;
  numericPrice: number;
  sales: number;
  features?: string[];
  content?: string;
  media?: Media[];
  colors?: Color[];
  infotable?: InfoTable[];
  comments?: Comment[];
  brandDetails?: Brand;
}

export interface Media {
  type: string;
  src: string;
  thumbnail: string;
  alt: string;
}

export interface Color {
  englishName: string;
  persianName: string;
  hexCode: string;
}

export interface InfoTable {
  id: number;
  name: string;
  value: string;
}
export interface Comment {
  id: number;
product_id: number | null;
  name: string;
  rating?: number;
  text: string;
  admin_reply?: string;
  date: string;
  status: boolean;
  parent_id?: number; // Remove | null
  is_admin: boolean;
  product_title?: string;
  level?: number;
}

export interface Brand {
  id: number;
  title: string;
  img: string;
  link: string;
}

export interface Category {
  id: number;
  name: string;
  link: string;
  mothercat: number;
  icon: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
}