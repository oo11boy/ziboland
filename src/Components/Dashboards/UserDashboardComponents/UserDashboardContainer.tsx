"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Favorite, FireTruck, Home, Logout, Settings, ShoppingBag, Menu, Close, Add, ShoppingCart, Message } from '@mui/icons-material';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Modal, Box, Avatar } from '@mui/material';
import Image from 'next/image';

// TypeScript interfaces
interface Order {
  id: string;
  date: string;
  total: string;
  status: string;
  product: { name: string; image: string; details?: string };
}

interface WishlistItem {
  id: number;
  name: string;
  price: string;
  image: string;
}

interface Tracking {
  id: string;
  status: string;
  estimatedDelivery: string;
}

interface TrackingResult {
  id: string;
  status: string;
  date: string;
  details?: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  date: string;
  response?: string;
}

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  unit?: string;
  isDefault?: boolean;
}

interface AccountInfo {
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  landline: string;
  bankCard: string;
  sheba: string;
  bankName: string;
  guild: string;
  company: string;
  position: string;
  isComplete: boolean;
}

interface RecentActivity {
  description: string;
  date: string;
}

export default function UserDashboardContainer() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [orderTrackingId, setOrderTrackingId] = useState<string>('');
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [trackingError, setTrackingError] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      firstName: 'علی',
      lastName: 'محمدی',
      phone: '09123456789',
      email: 'ali@example.com',
      province: 'تهران',
      city: 'تهران',
      postalCode: '1234567890',
      address: 'خیابان نمونه، کوچه اول',
      unit: 'پلاک 10، واحد 5',
      isDefault: true,
    },
  ]);
  const [newAddress, setNewAddress] = useState<Address>({
    id: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    province: '',
    city: '',
    postalCode: '',
    address: '',
    unit: '',
    isDefault: false,
  });
  const [addressError, setAddressError] = useState<string>('');
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    name: 'علی محمدی',
    email: 'ali@example.com',
    phone: '09123456789',
    nationalId: '1234567890',
    landline: '02112345678',
    bankCard: '1234-5678-9012-3456',
    sheba: 'IR1234567890123456789012',
    bankName: 'بانک ملی',
    guild: 'فناوری اطلاعات',
    company: 'شرکت نمونه',
    position: 'مدیر',
    isComplete: true,
  });
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  const [newTicket, setNewTicket] = useState<{ subject: string; message: string }>({ subject: '', message: '' });
  const [ticketError, setTicketError] = useState<string>('');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = useState<string>('');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    { id: 'T001', subject: 'مشکل در تحویل سفارش', message: 'سفارشم هنوز به دستم نرسیده است.', status: 'باز', date: '1404/05/10', response: 'در حال بررسی هستیم.' },
    { id: 'T002', subject: 'درخواست بازگشت کالا', message: 'محصول معیوب است.', status: 'بسته', date: '1404/05/08', response: 'عودت پذیرفته شد.' },
  ]);

  // Sample data
  const orders: Order[] = [
    {
      id: '1234',
      date: '1404/05/10',
      total: '2,500,000',
      status: 'ارسال شده',
      product: {
        name: 'گوشی سامسونگ S23',
        image: 'https://picsum.photos/200/300',
        details: 'گوشی سامسونگ S23 با 128 گیگابایت حافظه داخلی و رنگ مشکی',
      },
    },
    {
      id: '1235',
      date: '1404/05/08',
      total: '1,800,000',
      status: 'در حال پردازش',
      product: {
        name: 'لپ‌تاپ مک‌بوک پرو',
        image: 'https://picsum.photos/200/302',
        details: 'لپ‌تاپ مک‌بوک پرو 13 اینچ با پردازنده M1',
      },
    },
  ];

  const wishlist: WishlistItem[] = [
    { id: 1, name: 'گوشی سامسونگ S23', price: '32,000,000', image: 'https://picsum.photos/200/300' },
    { id: 2, name: 'لپ‌تاپ مک‌بوک پرو', price: '85,000,000', image: 'https://picsum.photos/200' },
  ];

  const tracking: Tracking[] = [
    { id: '1234', status: 'در حال ارسال', estimatedDelivery: '1404/05/15' },
    { id: '1235', status: 'در حال پردازش', estimatedDelivery: '1404/05/18' },
  ];

  const recentActivities: RecentActivity[] = [
    { description: 'سفارش #1234 ثبت شد', date: '1404/05/10' },
    { description: 'محصول به لیست علاقه‌مندی‌ها اضافه شد', date: '1404/05/09' },
  ];

  const provinces = ['تهران', 'اصفهان', 'شیراز', 'مشهد'];
  const cities: { [key: string]: string[] } = {
    تهران: ['تهران', 'ری', 'شمیرانات'],
    اصفهان: ['اصفهان', 'کاشان', 'نجف‌آباد'],
    شیراز: ['شیراز', 'مرودشت', 'کازرون'],
    مشهد: ['مشهد', 'نیشابور', 'سبزوار'],
  };

  // Handlers
  const handleTrackOrder = () => {
    if (!orderTrackingId.trim()) {
      setTrackingError('لطفاً شماره سفارش را وارد کنید.');
      setTrackingResult(null);
      return;
    }
    if (!/^\d+$/.test(orderTrackingId)) {
      setTrackingError('شماره سفارش باید فقط شامل اعداد باشد.');
      setTrackingResult(null);
      return;
    }
    const result = tracking.find((track) => track.id === orderTrackingId);
    if (result) {
      setTrackingResult({
        id: result.id,
        status: result.status,
        date: result.estimatedDelivery,
        details: `تحویل تخمینی: ${result.estimatedDelivery}`,
      });
      setTrackingError('');
    } else {
      setTrackingResult(null);
      setTrackingError('سفارش با این شماره یافت نشد.');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const validateAddress = (address: Address): string | null => {
    if (!address.firstName || !address.lastName || !address.phone || !address.province || !address.city || !address.postalCode || !address.address) {
      return 'لطفاً تمام فیلدهای الزامی را پر کنید.';
    }
    if (!/^\d{11}$/.test(address.phone)) {
      return 'شماره همراه باید 11 رقم باشد.';
    }
    if (!/^\d{10}$/.test(address.postalCode)) {
      return 'کدپستی باید 10 رقم باشد.';
    }
    if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      return 'ایمیل واردشده معتبر نیست.';
    }
    return null;
  };

  const handleAddAddress = () => {
    const error = validateAddress(newAddress);
    if (error) {
      setAddressError(error);
      return;
    }
    if (editingAddressId) {
      setAddresses(addresses.map((addr) => (addr.id === editingAddressId ? { ...newAddress, id: editingAddressId } : addr)));
      setEditingAddressId(null);
    } else {
      setAddresses([...addresses, { ...newAddress, id: `${addresses.length + 1}` }]);
    }
    setNewAddress({
      id: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      province: '',
      city: '',
      postalCode: '',
      address: '',
      unit: '',
      isDefault: false,
    });
    setShowAddressForm(false);
    setAddressError('');
  };

  const handleEditAddress = (address: Address) => {
    setNewAddress(address);
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const handleAccountInfoChange = (field: keyof AccountInfo, value: string) => {
    setAccountInfo({ ...accountInfo, [field]: value });
  };

  const handleSubmitTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      setTicketError('لطفاً موضوع و متن تیکت را پر کنید.');
      return;
    }
    setSupportTickets([
      ...supportTickets,
      {
        id: `T${supportTickets.length + 1}`.padStart(4, '0'),
        subject: newTicket.subject,
        message: newTicket.message,
        status: 'باز',
        date: new Date().toLocaleDateString('fa-IR'),
      },
    ]);
    setNewTicket({ subject: '', message: '' });
    setIsTicketModalOpen(false);
    setTicketError('');
  };

  const handleCloseTicket = (id: string) => {
    setSupportTickets(supportTickets.map((ticket) => (ticket.id === id ? { ...ticket, status: 'بسته' } : ticket)));
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCancelOrder = (id: string) => {
    // Simulate order cancellation logic
    alert(`سفارش شماره ${id} لغو شد.`);
  };

  const handleAddToCart = (item: WishlistItem) => {
    // Simulate adding to cart logic
    alert(`محصول ${item.name} به سبد خرید اضافه شد.`);
  };

  const handleRemoveFromWishlist = (id: number) => {
    // Simulate removing from wishlist logic
    alert(`محصول با شناسه ${id} از لیست علاقه‌مندی‌ها حذف شد.`);
  };

  const handleReplyTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsReplyModalOpen(true);
  };

  const handleSubmitReply = () => {
    if (!ticketReply.trim()) {
      setTicketError('لطفاً متن پاسخ را وارد کنید.');
      return;
    }
    setSupportTickets(
      supportTickets.map((ticket) =>
        ticket.id === selectedTicket?.id ? { ...ticket, response: ticketReply, status: 'پاسخ داده شده' } : ticket
      )
    );
    setTicketReply('');
    setIsReplyModalOpen(false);
    setTicketError('');
    setSelectedTicket(null);
  };

  const handleSaveAccountInfo = () => {
    // Simulate saving account info
    if (!accountInfo.name || !accountInfo.email) {
      alert('لطفاً نام و ایمیل را پر کنید.');
      return;
    }
    alert('تغییرات حساب کاربری با موفقیت ذخیره شد.');
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    bgcolor: 'white',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    p: 4,
    borderRadius: '12px',
    direction: 'rtl',
  };

  return (
    <div className="min-h-screen yekan bg-gradient-to-br from-teal-100 via-white to-blue-100 flex flex-col md:flex-row lg:w-[90%] lg:my-8 m-auto">
      {/* Mobile Hamburger Menu */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white/95 backdrop-blur-md shadow-lg rounded-b-lg">
        <div className="flex items-center gap-3">
          <Avatar alt={accountInfo.name} />
          <div>
            <h1 className="text-xl font-extrabold text-teal-700">{accountInfo.name}</h1>
            <p className="text-sm text-gray-600">{accountInfo.email}</p>
          </div>
        </div>
        <button onClick={toggleSidebar} className="text-teal-700" aria-label={isSidebarOpen ? 'بستن منو' : 'باز کردن منو'}>
          {isSidebarOpen ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-72 bg-white/95 backdrop-blur-lg shadow-2xl rounded-b-2xl md:rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 md:sticky md:top-8`}
      >
        <div className="hidden md:flex items-center gap-3 mb-4">
          <Avatar alt={accountInfo.name} />
          <div>
            <h1 className="text-xl font-extrabold text-teal-700">{accountInfo.name}</h1>
            <p className="text-sm text-gray-600">{accountInfo.email}</p>
          </div>
        </div>
        <nav className="mt-4 space-y-2">
          {[
            { tab: 'dashboard', label: 'پیشخوان', Icon: Home },
            { tab: 'orders', label: 'سفارش‌ها', Icon: ShoppingBag },
            { tab: 'wishlist', label: 'لیست‌ها', Icon: Favorite },
            { tab: 'tickets', label: 'تیکت پشتیبانی', Icon: FireTruck },
            { tab: 'addresses', label: 'آدرس', Icon: Settings },
            { tab: 'account', label: 'اطلاعات حساب کاربری', Icon: Settings },
          ].map(({ tab, label, Icon }) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center w-full p-3 text-right rounded-lg transition-all duration-300 text-base md:text-lg ${
                activeTab === tab ? 'bg-teal-500 text-white shadow-lg' : 'text-gray-700 hover:bg-teal-100'
              }`}
              aria-label={`نمایش ${label}`}
            >
              <Icon className="ml-3 h-5 w-5" />
              {label}
            </button>
          ))}
          <Link
            href="/"
            className="flex items-center p-3 text-gray-700 hover:bg-teal-100 rounded-lg transition-all duration-300 text-base md:text-lg"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="بازگشت به خانه"
          >
            <Home className="ml-3 h-5 w-5" />
            بازگشت به خانه
          </Link>
          <button
            className="flex items-center w-full p-3 text-gray-700 hover:bg-teal-100 rounded-lg transition-all duration-300 text-base md:text-lg"
            aria-label="خروج از حساب کاربری"
          >
            <Logout className="ml-3 h-5 w-5" />
            خروج
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        {activeTab === 'dashboard' && (
          <div className="animate-slide-in-up">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-teal-900 mb-6 md:mb-8 tracking-tight text-center md:text-right">
              پیشخوان
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div
                className="relative bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 transform hover:scale-105 hover:shadow-xl transition-all duration-300 border border-teal-100/50"
                role="region"
                aria-label="تعداد کل سفارش‌ها"
              >
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-teal-400"></div>
                <h3 className="text-base md:text-lg font-semibold text-teal-800">تعداد کل سفارش‌ها</h3>
                <p className="text-2xl md:text-3xl font-bold text-teal-600 mt-2">{orders.length.toLocaleString('fa-IR')}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">آخرین سفارش: ۲ روز پیش</p>
              </div>
              <div
                className="relative bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 transform hover:scale-105 hover:shadow-xl transition-all duration-300 border border-teal-100/50"
                role="region"
                aria-label="تعداد علاقه‌مندی‌ها"
              >
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-yellow-400"></div>
                <h3 className="text-base md:text-lg font-semibold text-teal-800">تعداد علاقه‌مندی‌ها</h3>
                <p className="text-2xl md:text-3xl font-bold text-teal-600 mt-2">{wishlist.length.toLocaleString('fa-IR')}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">آخرین افزودن: دیروز</p>
              </div>
              <div
                className="relative bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 transform hover:scale-105 hover:shadow-xl transition-all duration-300 border border-teal-100/50"
                role="region"
                aria-label="وضعیت پروفایل"
              >
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-green-400"></div>
                <h3 className="text-base md:text-lg font-semibold text-teal-800">وضعیت پروفایل</h3>
                <p className="text-sm md:text-base font-medium text-green-600 mt-2">
                  {accountInfo.isComplete ? 'تکمیل‌شده' : 'ناقص'}
                </p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">ایمیل: {accountInfo.email}</p>
              </div>
              <div
                className="relative bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 transform hover:scale-105 hover:shadow-xl transition-all duration-300 border border-teal-100/50"
                role="region"
                aria-label="تیکت‌های پشتیبانی"
              >
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-blue-400"></div>
                <h3 className="text-base md:text-lg font-semibold text-teal-800">تیکت‌های پشتیبانی</h3>
                <p className="text-2xl md:text-3xl font-bold text-teal-600 mt-2">
                  {supportTickets.filter(t => t.status === 'باز').length.toLocaleString('fa-IR')}
                </p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">تیکت‌های باز</p>
              </div>
            </div>
            <div className="mt-6 md:mt-8 bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 border border-teal-100/50">
              <h3 className="text-base md:text-lg font-semibold text-teal-800 mb-4 text-right">پیگیری وضعیت سفارش</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={orderTrackingId}
                  onChange={(e) => setOrderTrackingId(e.target.value)}
                  placeholder="شماره سفارش را وارد کنید"
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                  aria-label="وارد کردن شماره سفارش برای پیگیری"
                  required
                />
                <button
                  onClick={handleTrackOrder}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-md text-sm font-medium"
                  aria-label="پیگیری سفارش"
                >
                  پیگیری
                </button>
              </div>
              {trackingResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-teal-800">وضعیت سفارش #{trackingResult.id}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>وضعیت:</strong> {trackingResult.status}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>تاریخ تحویل تخمینی:</strong> {trackingResult.date}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>جزئیات:</strong> {trackingResult.details || 'در حال پردازش'}
                  </p>
                </div>
              )}
              {trackingError && (
                <p className="mt-4 text-sm text-red-600 text-right">{trackingError}</p>
              )}
            </div>
            <div className="mt-6 md:mt-8 bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 border border-teal-100/50">
              <h3 className="text-base md:text-lg font-semibold text-teal-800 mb-4 text-right">فعالیت اخیر</h3>
              {recentActivities.length === 0 ? (
                <p className="text-center text-gray-500 text-sm md:text-base">هیچ فعالیتی ثبت نشده است!</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      role="listitem"
                    >
                      <span className="text-gray-600">{activity.description}</span>
                      <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString('fa-IR')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-6 md:mt-8 bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 border border-teal-100/50">
              <h3 className="text-base md:text-lg font-semibold text-teal-800 mb-4 text-right">میانبرهای سریع</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 text-sm font-medium"
                  aria-label="مشاهده سفارش‌ها"
                >
                  <ShoppingCart className="ml-2 h-5 w-5" />
                  مشاهده سفارش‌ها
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className="flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 text-sm font-medium"
                  aria-label="مشاهده علاقه‌مندی‌ها"
                >
                  <Favorite className="ml-2 h-5 w-5" />
                  مشاهده علاقه‌مندی‌ها
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 text-sm font-medium"
                  aria-label="ثبت تیکت جدید"
                >
                  <Message className="ml-2 h-5 w-5" />
                  ثبت تیکت جدید
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-slide-in-up">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-teal-900 mb-6 md:mb-8 tracking-tight text-center md:text-right">
              سفارش‌های شما
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 text-sm md:text-base col-span-full">
                  هیچ سفارشی ثبت نشده است!
                </p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="relative bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-teal-100/50"
                    role="article"
                    aria-label={`سفارش ${order.id}`}
                  >
                    <div
                      className={`absolute top-3 left-3 w-2 h-2 rounded-full ${
                        order.status === 'ارسال شده' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                    ></div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                      <Image
                        src={order.product.image}
                        alt={order.product.name}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1 space-y-3">
                        <p className="text-base md:text-lg font-semibold text-teal-800 leading-tight">
                          {order.product.name}
                        </p>
                        <p className="text-sm text-gray-500">شماره سفارش: {order.id}</p>
                        <p className="text-sm text-gray-500">تاریخ: {new Date(order.date).toLocaleDateString('fa-IR')}</p>
                        <p className="text-sm text-gray-500">مبلغ: {order.total} تومان</p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                            order.status === 'ارسال شده' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ml-2 ${
                              order.status === 'ارسال شده' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                          ></span>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        aria-label={`مشاهده جزئیات سفارش ${order.id}`}
                      >
                        مشاهده جزئیات
                      </button>
                      {order.status === 'در حال پردازش' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          aria-label={`لغو سفارش ${order.id}`}
                        >
                          لغو سفارش
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Modal
              open={isOrderModalOpen}
              onClose={() => setIsOrderModalOpen(false)}
              aria-labelledby="order-modal-title"
              aria-describedby="order-modal-description"
            >
              <Box sx={modalStyle}>
                <Typography id="order-modal-title" variant="h6" component="h2" className="text-teal-800 font-semibold mb-6 text-right">
                  جزئیات سفارش #{selectedOrder?.id}
                </Typography>
                {selectedOrder && (
                  <div className="space-y-4 text-sm text-gray-600">
                    <p><strong>محصول:</strong> {selectedOrder.product.name}</p>
                    <p><strong>جزئیات محصول:</strong> {selectedOrder.product.details || 'جزئیات موجود نیست'}</p>
                    <p><strong>شماره سفارش:</strong> {selectedOrder.id}</p>
                    <p><strong>تاریخ:</strong> {new Date(selectedOrder.date).toLocaleDateString('fa-IR')}</p>
                    <p><strong>مبلغ:</strong> {selectedOrder.total} تومان</p>
                    <p><strong>وضعیت:</strong> {selectedOrder.status}</p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsOrderModalOpen(false)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-sm font-medium"
                        aria-label="بستن جزئیات سفارش"
                      >
                        بستن
                      </button>
                    </div>
                  </div>
                )}
              </Box>
            </Modal>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="animate-slide-in-up">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-teal-900 mb-6 md:mb-8 tracking-tight text-center md:text-right">
              لیست علاقه‌مندی‌ها
            </h2>
            <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 border border-teal-100/50">
              {wishlist.length === 0 ? (
                <p className="text-center text-gray-500 text-sm md:text-base">
                  لیست علاقه‌مندی‌های شما خالی است!
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-4 md:gap-6">
                  {wishlist.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-teal-100/50"
                      role="listitem"
                      aria-label={`محصول ${item.name} در لیست علاقه‌مندی‌ها`}
                    >
                      <div className="flex items-center mb-3 sm:mb-0 gap-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                          loading="lazy"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm md:text-base font-semibold text-teal-800 leading-tight">
                            {item.name}
                          </span>
                          <span className="text-sm text-gray-500 mt-1">
                            {item.price} تومان
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 sm:flex-none px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                          aria-label={`افزودن ${item.name} به سبد خرید`}
                        >
                          افزودن به سبد
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="flex-1 sm:flex-none px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          aria-label={`حذف ${item.name} از لیست علاقه‌مندی‌ها`}
                        >
                          حذف
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="animate-slide-in-up">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-teal-900 mb-6 md:mb-8 tracking-tight text-center md:text-right">
              تیکت‌های پشتیبانی
            </h2>
            <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 border border-teal-100/50">
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-md text-sm md:text-base font-semibold"
                  aria-label="افزودن تیکت جدید"
                >
                  <Add className="ml-2 h-5 w-5" />
                  افزودن تیکت جدید
                </button>
              </div>
              <Modal
                open={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={modalStyle}>
                  <Typography   sx={{fontFamily:"yekannew"}} id="modal-modal-title" variant="h6" component="h2" className="text-teal-800 font-semibold mb-6 text-right">
                    ثبت تیکت جدید
                  </Typography>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">موضوع *</label>
                      <input
                        type="text"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="موضوع تیکت را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">متن تیکت *</label>
                      <textarea
                        value={newTicket.message}
                        onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                        placeholder="توضیحات تیکت خود را وارد کنید"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        rows={6}
                        required
                        aria-required="true"
                      />
                    </div>
                    {ticketError && (
                      <p className="text-sm text-red-600 text-right">{ticketError}</p>
                    )}
                    <div className="flex justify-end gap-x-4 space-x-reverse">
                      <button
                        onClick={() => {
                          setIsTicketModalOpen(false);
                          setTicketError('');
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-sm font-medium"
                        aria-label="لغو ثبت تیکت"
                      >
                        لغو
                      </button>
                      <button
                        onClick={handleSubmitTicket}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-md text-sm font-medium"
                        aria-label="ارسال تیکت جدید"
                      >
                        ارسال تیکت
                      </button>
                    </div>
                  </div>
                </Box>
              </Modal>
              <Modal
                open={isReplyModalOpen}
                onClose={() => {
                  setIsReplyModalOpen(false);
                  setTicketReply('');
                  setTicketError('');
                }}
                aria-labelledby="reply-modal-title"
                aria-describedby="reply-modal-description"
              >
                <Box sx={modalStyle}>
                  <Typography   sx={{fontFamily:"yekannew"}} id="reply-modal-title" variant="h6" component="h2" className="text-teal-800 font-semibold mb-6 text-right">
                    پاسخ به تیکت #{selectedTicket?.id}
                  </Typography>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">متن پاسخ *</label>
                      <textarea
                        value={ticketReply}
                        onChange={(e) => setTicketReply(e.target.value)}
                        placeholder="پاسخ خود را وارد کنید"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        rows={6}
                        required
                        aria-required="true"
                      />
                    </div>
                    {ticketError && (
                      <p className="text-sm text-red-600 text-right">{ticketError}</p>
                    )}
                    <div className="flex justify-end gap-x-4 space-x-reverse">
                      <button
                        onClick={() => {
                          setIsReplyModalOpen(false);
                          setTicketReply('');
                          setTicketError('');
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-sm font-medium"
                        aria-label="لغو پاسخ به تیکت"
                      >
                        لغو
                      </button>
                      <button
                        onClick={handleSubmitReply}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-md text-sm font-medium"
                        aria-label="ارسال پاسخ به تیکت"
                      >
                        ارسال پاسخ
                      </button>
                    </div>
                  </div>
                </Box>
              </Modal>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { label: 'تیکت باز', count: supportTickets.filter(t => t.status === 'باز').length, color: 'bg-teal-100 text-teal-700' },
                  { label: 'تیکت بسته', count: supportTickets.filter(t => t.status === 'بسته').length, color: 'bg-gray-100 text-gray-700' },
                  { label: 'پاسخ داده شده', count: supportTickets.filter(t => t.response).length, color: 'bg-green-100 text-green-700' },
                  { label: 'اتمام یافته', count: 0, color: 'bg-yellow-100 text-yellow-700' },
                  { label: 'همه', count: supportTickets.length, color: 'bg-blue-100 text-blue-700' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 text-center shadow-sm border border-teal-100/50 ${stat.color} transition-transform duration-300 hover:scale-105`}
                    role="region"
                    aria-label={`آمار ${stat.label}`}
                  >
                    <p className="text-sm font-semibold">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.count.toLocaleString('fa-IR')}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {supportTickets.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm md:text-base">
                    هیچ تیکتی ثبت نشده است!
                  </p>
                ) : (
                  supportTickets.map((ticket) => (
                    <Accordion
                      key={ticket.id}
                      expanded={expandedAccordion === ticket.id}
                      onChange={handleAccordionChange(ticket.id)}
                      className="bg-white rounded-lg shadow-sm border border-teal-100/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      <AccordionSummary
                        expandIcon={<Add className="h-5 w-5 text-teal-600" />}
                        aria-controls={`ticket-panel-${ticket.id}`}
                        id={`ticket-header-${ticket.id}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Typography   sx={{fontFamily:"yekannew"}} className="text-sm md:text-base font-semibold text-teal-800">
                            {ticket.subject}
                          </Typography>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ticket.status === 'باز' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div className="space-y-3 text-sm text-gray-600">
                          <p><strong>موضوع:</strong> {ticket.subject}</p>
                          <p><strong>متن تیکت:</strong> {ticket.message}</p>
                          <p><strong>وضعیت:</strong> {ticket.status}</p>
                          <p><strong>تاریخ:</strong> {new Date(ticket.date).toLocaleDateString('fa-IR')}</p>
                          {ticket.response && (
                            <p><strong>پاسخ پشتیبانی:</strong> {ticket.response}</p>
                          )}
                          <div className="flex justify-end gap-2">
                            {ticket.status === 'باز' && (
                              <button
                                onClick={() => handleReplyTicket(ticket)}
                                className="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                aria-label={`پاسخ به تیکت ${ticket.subject}`}
                              >
                                پاسخ
                              </button>
                            )}
                            <button
                              onClick={() => handleCloseTicket(ticket.id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              aria-label={`بستن تیکت ${ticket.subject}`}
                            >
                              بستن تیکت
                            </button>
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="animate-slide-in-up">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-teal-900 mb-6 md:mb-8 tracking-tight text-center md:text-right">
              آدرس‌ها
            </h2>
            <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 border border-teal-100/50">
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowAddressForm(!showAddressForm);
                    setEditingAddressId(null);
                    setNewAddress({
                      id: '',
                      firstName: '',
                      lastName: '',
                      phone: '',
                      email: '',
                      province: '',
                      city: '',
                      postalCode: '',
                      address: '',
                      unit: '',
                      isDefault: false,
                    });
                    setAddressError('');
                  }}
                  className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-md text-sm md:text-base font-semibold"
                  aria-label="افزودن آدرس جدید"
                >
                  <Add className="ml-2 h-5 w-5" />
                  افزودن آدرس جدید
                </button>
              </div>
              {showAddressForm && (
                <div className="p-4 bg-white  rounded-lg shadow-sm mb-6 border border-teal-100/50">
                  <h3 className="text-base md:text-lg font-semibold text-teal-800 mb-4 text-right">
                    {editingAddressId ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">نام *</label>
                      <input
                        type="text"
                        value={newAddress.firstName}
                        onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="نام خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">نام خانوادگی *</label>
                      <input
                        type="text"
                        value={newAddress.lastName}
                        onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="نام خانوادگی خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">شماره همراه *</label>
                      <input
                        type="text"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="شماره همراه خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">آدرس ایمیل (اختیاری)</label>
                      <input
                        type="email"
                        value={newAddress.email}
                        onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="ایمیل خود را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">استان *</label>
                      <select
                        value={newAddress.province}
                        onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value, city: '' })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm"
                        required
                        aria-required="true"
                      >
                        <option value="">انتخاب کنید</option>
                        {provinces.map((province) => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">شهر *</label>
                      <select
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm"
                        required
                        disabled={!newAddress.province}
                        aria-required="true"
                      >
                        <option value="">ابتدا استان را انتخاب کنید</option>
                        {newAddress.province && cities[newAddress.province]?.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">کدپستی *</label>
                      <input
                        type="text"
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="کدپستی را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">آدرس *</label>
                      <input
                        type="text"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="آدرس کامل را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">پلاک / واحد (اختیاری)</label>
                      <input
                        type="text"
                        value={newAddress.unit}
                        onChange={(e) => setNewAddress({ ...newAddress, unit: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="پلاک یا واحد را وارد کنید"
                      />
                    </div>
                    {addressError && (
                      <p className="sm:col-span-2 text-sm text-red-600 text-right">{addressError}</p>
                    )}
                    <div className="sm:col-span-2 flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setAddressError('');
                          setEditingAddressId(null);
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-sm font-medium"
                        aria-label="لغو افزودن آدرس"
                      >
                        لغو
                      </button>
                      <button
                        onClick={handleAddAddress}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-md text-sm font-medium"
                        aria-label={editingAddressId ? 'ذخیره تغییرات آدرس' : 'ذخیره آدرس جدید'}
                      >
                        {editingAddressId ? 'ذخیره تغییرات' : 'ذخیره آدرس'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm md:text-base">
                    هیچ آدرسی ثبت نشده است!
                  </p>
                ) : (
                  addresses.map((address) => (
                    <Accordion
                      key={address.id}
                      expanded={expandedAccordion === address.id}
                      onChange={handleAccordionChange(address.id)}
                      sx={{fontFamily:"yekannew"}}
                      className="bg-white  rounded-lg shadow-sm border border-teal-100/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      <AccordionSummary
                        expandIcon={<Add className="h-5 w-5 text-teal-600" />}
                        aria-controls={`address-panel-${address.id}`}
                        id={`address-header-${address.id}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Typography   sx={{fontFamily:"yekannew"}} className="text-sm md:text-base font-semibold text-teal-800">
                            {address.firstName} {address.lastName} - {address.city}
                          </Typography>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              address.isDefault ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {address.isDefault ? 'پیش‌فرض' : 'معمولی'}
                          </span>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div className="space-y-3 text-sm text-gray-600">
                          <p><strong>نام:</strong> {address.firstName}</p>
                          <p><strong>نام خانوادگی:</strong> {address.lastName}</p>
                          <p><strong>شماره همراه:</strong> {address.phone}</p>
                          {address.email && <p><strong>ایمیل:</strong> {address.email}</p>}
                          <p><strong>استان:</strong> {address.province}</p>
                          <p><strong>شهر:</strong> {address.city}</p>
                          <p><strong>کدپستی:</strong> {address.postalCode}</p>
                          <p><strong>آدرس:</strong> {address.address}</p>
                          {address.unit && <p><strong>پلاک/واحد:</strong> {address.unit}</p>}
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                              aria-label={`ویرایش آدرس ${address.firstName} ${address.lastName}`}
                            >
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              aria-label={`حذف آدرس ${address.firstName} ${address.lastName}`}
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="animate-slide-in-up">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-teal-900 mb-6 md:mb-8 tracking-tight text-center md:text-right">
              اطلاعات حساب کاربری
            </h2>
            <div className="bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-6 border border-teal-100/50">
              <div className="grid grid-cols-1  gap-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-teal-800 mb-4 text-right">
                    اطلاعات حساب کاربری
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">نام *</label>
                      <input
                        type="text"
                        value={accountInfo.name}
                        onChange={(e) => handleAccountInfoChange('name', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="نام خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">آدرس ایمیل *</label>
                      <input
                        type="email"
                        value={accountInfo.email}
                        onChange={(e) => handleAccountInfoChange('email', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="ایمیل خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">شماره همراه</label>
                      <input
                        type="text"
                        value={accountInfo.phone}
                        onChange={(e) => handleAccountInfoChange('phone', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="شماره همراه خود را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">کدملی</label>
                      <input
                        type="text"
                        value={accountInfo.nationalId}
                        onChange={(e) => handleAccountInfoChange('nationalId', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="کدملی را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">شماره ثابت</label>
                      <input
                        type="text"
                        value={accountInfo.landline}
                        onChange={(e) => handleAccountInfoChange('landline', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="شماره ثابت را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">شماره کارت بانکی (جهت عودت وجه)</label>
                      <input
                        type="text"
                        value={accountInfo.bankCard}
                        onChange={(e) => handleAccountInfoChange('bankCard', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="شماره کارت بانکی را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">شماره شبا (جهت عودت وجه)</label>
                      <input
                        type="text"
                        value={accountInfo.sheba}
                        onChange={(e) => handleAccountInfoChange('sheba', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="شماره شبا را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">نام بانک</label>
                      <input
                        type="text"
                        value={accountInfo.bankName}
                        onChange={(e) => handleAccountInfoChange('bankName', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="نام بانک را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">نام صنف</label>
                      <input
                        type="text"
                        value={accountInfo.guild}
                        onChange={(e) => handleAccountInfoChange('guild', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="نام صنف را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">نام شرکت یا فروشگاه شما</label>
                      <input
                        type="text"
                        value={accountInfo.company}
                        onChange={(e) => handleAccountInfoChange('company', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="نام شرکت یا فروشگاه را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2 text-right">سمت شما</label>
                      <input
                        type="text"
                        value={accountInfo.position}
                        onChange={(e) => handleAccountInfoChange('position', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/50 text-right text-sm placeholder-gray-400"
                        placeholder="سمت خود را وارد کنید"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-4">
                      <button
                        onClick={() => alert('تغییرات لغو شد.')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-sm font-medium"
                        aria-label="لغو تغییرات"
                      >
                        لغو
                      </button>
                      <button
                        onClick={handleSaveAccountInfo}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-md text-sm font-medium"
                        aria-label="ذخیره تغییرات حساب کاربری"
                      >
                        ذخیره تغییرات
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out forwards;
        }
        .font-yekan {
          font-family: 'Yekan Bakh', sans-serif;
        }
      `}</style>
    </div>
  );
}