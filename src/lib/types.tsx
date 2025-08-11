export interface MenuItem {
  id: number;
  name: string;
  link: string;
  mothercat: boolean;
  icon: string;
  subcat: {
    id: number;
    name: string;
    items: { id: number; name: string }[];
  }[];
}


export interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  alt: string;
}

export interface Product {
  id: number;
  title: string;
  mothercatId: number; // شناسه دسته‌بندی اصلی
  subcatId: number; // شناسه زیرمجموعه
  features?: string[];
  content?: string;
  brand: string;
  originalPrice: string;
  discountedPrice: string;
  wholesalePrice: string;
  discountwholesalePrice: string;
  minwholesale: number;
  discount: string;
  discountwholesale: string;
  media?: MediaItem[];
  category: string; // حفظ شده برای سازگاری با کد قبلی
  image?: string;
  rating: number;
  inStock: boolean;
  numericPrice: number;
  sales?: number;
}