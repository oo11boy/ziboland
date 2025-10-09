import { RowDataPacket } from 'mysql2/promise';

export interface Comment {
  id: number;
  product_id: number;
  name: string;
  rating: number | null;
  text: string;
  admin_reply: string | null;
  date: string;
  status: number ;
  parent_id: number | null;
  is_admin: number;
  product_title: string | null;
  replies?: Comment[];
}

export interface CommentRow extends RowDataPacket {
  id: number;
  product_id: number;
  name: string;
  rating: number | null;
  text: string;
  admin_reply: string | null;
  date: string;
  status: number;
  parent_id: number | null;
  is_admin: number;
  product_title: string | null;
}

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
  comment_product_id: number;
  comment_name: string | null;
  comment_rating: number | null;
  comment_text: string | null;
  comment_date: string | null;
  comment_status: number | null;
  comment_is_admin: number | null;
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

export interface Address {
  id: string;
  userId: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  province: string;
  city: string;
  street: string;
  alley?: string;
  building_number?: string;
  unit?: string;
  postal_code: string;
  extra_details?: string;
  is_default: boolean;
}

export interface AddressesContentProps {
  addresses: Address[];
  newAddress: Address;
  setNewAddress: (address: Address) => void;
  addressError: string;
  setAddressError: (error: string) => void;
  showAddressForm: boolean;
  setShowAddressForm: (show: boolean) => void;
  editingAddressId: string | null;
  setEditingAddressId: (id: string | null) => void;
  provinces: string[];
  cities: { [key: string]: string[] };
  handleAddAddress: () => void;
  handleEditAddress: (address: Address) => void;
  handleDeleteAddress: (id: string) => void;
  expandedAccordion: string | false;
  handleAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

export interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  response: string | null;
  admin_id: number | null;
}

export interface AccountInfo {
  username: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: "admin" | "customer";
  isActive: boolean;
}

export interface AccountContentProps {
  accountInfo: AccountInfo;
  handleAccountInfoChange: (field: keyof AccountInfo, value: string) => void;
  handleSaveAccountInfo: () => void;
}

export interface Order {
  id: number;
  order_code: string;
  user_id: number;
  username?: string;
  email?: string;
  first_name?: string ;
  last_name?: string;
  phone_number?: string;
  address_id: number;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  shipping_method: string;
  tracking_code: string | null;
  created_at: string;
  updated_at: string;
  province?: string;
  city?: string;
  street?: string;
  alley?: string | null;
  building_number?: string | null;
  unit?: string | null;
  postal_code?: string;
  items: {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price_type: "single" | "wholesale";
    unit_price: number;
    discount: string | null;
    title: string;
    image: string | null;
      color?: Color;
  }[];

}

export interface OrdersContentProps {
  orders: Order[];
  selectedOrder: Order | null;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  handleViewOrderDetails: (order: Order) => void;
  modalStyle: any;
}

export interface WishlistItem {
  id: number;
  name: string;
  price: string;
  image: string;
}

export interface Tracking {
  id: string;
  status: string;
  estimatedDelivery: string;
}

export interface TrackingResult {
  id: number;
  order_code: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
  total_amount: number;
  shipping_method: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  date: string;
  response?: string;
}

export interface RecentActivity {
  description: string;
  date: string;
}

export interface userdashSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  accountInfo: AccountInfo;
  handleLogout: () => void;
}

export interface TicketsContentProps {
  supportTickets: SupportTicket[];
  isTicketModalOpen: boolean;
  setIsTicketModalOpen: (open: boolean) => void;
  newTicket: { subject: string; message: string };
  setNewTicket: (ticket: { subject: string; message: string }) => void;
  ticketError: string;
  setTicketError: (error: string) => void;
  handleSubmitTicket: () => void;
  handleCloseTicket: (id: string) => void;
  expandedAccordion: string | false;
  handleAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  modalStyle: any;
}

export interface WishlistContentProps {
  wishlist: WishlistItem[];
  handleAddToCart: (item: WishlistItem) => void;
  handleRemoveFromWishlist: (id: number) => void;
}

export type { RowDataPacket };