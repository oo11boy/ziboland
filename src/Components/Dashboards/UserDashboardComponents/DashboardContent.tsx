import { ShoppingCart, Favorite, Message } from "@mui/icons-material";
import { Order, WishlistItem, AccountInfo, SupportTicket, RecentActivity } from "@/types/types";

interface DashboardContentProps {
  orders: Order[];
  wishlist: WishlistItem[];
  accountInfo: AccountInfo;
  supportTickets: SupportTicket[];
  recentActivities: RecentActivity[];
  orderTrackingId: string;
  setOrderTrackingId: (id: string) => void;
  trackingResult: any;
  trackingError: string;
  handleTrackOrder: () => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardContent({
  orders,
  wishlist,
  accountInfo,
  supportTickets,
  recentActivities,
  orderTrackingId,
  setOrderTrackingId,
  trackingResult,
  trackingError,
  handleTrackOrder,
  setActiveTab,
}: DashboardContentProps) {
  return (
    <div className="ud-animate-slide-in-up">
      <h2 className="ud-main-title">پیشخوان</h2>
      <div className="ud-dashboard-grid">
        <div className="ud-card" role="region" aria-label="تعداد کل سفارش‌ها">
          <div className="ud-card-dot ud-card-dot-teal"></div>
          <h3 className="ud-card-title">تعداد کل سفارش‌ها</h3>
          <p className="ud-card-value">{orders.length.toLocaleString("fa-IR")}</p>
        </div>
        <div className="ud-card" role="region" aria-label="تعداد علاقه‌مندی‌ها">
          <div className="ud-card-dot ud-card-dot-yellow"></div>
          <h3 className="ud-card-title">تعداد علاقه‌مندی‌ها</h3>
          <p className="ud-card-value">{wishlist.length.toLocaleString("fa-IR")}</p>
          <p className="ud-card-info">آخرین افزودن: {recentActivities[0]?.date || "نامشخص"}</p>
        </div>
        <div className="ud-card" role="region" aria-label="وضعیت پروفایل">
          <div className="ud-card-dot ud-card-dot-green"></div>
          <h3 className="ud-card-title">وضعیت پروفایل</h3>
          <p className="ud-card-profile-status">{accountInfo.email ? "تکمیل‌شده" : "ناقص"}</p>
          <p className="ud-card-info">ایمیل: {accountInfo.email}</p>
        </div>
        <div className="ud-card" role="region" aria-label="تیکت‌های پشتیبانی">
          <div className="ud-card-dot ud-card-dot-blue"></div>
          <h3 className="ud-card-title">تیکت‌های پشتیبانی</h3>
          <p className="ud-card-value">
            {supportTickets.filter((t) => t.status === "باز").length.toLocaleString("fa-IR")}
          </p>
          <p className="ud-card-info">تیکت‌های باز</p>
        </div>
      </div>
      <div className="ud-tracking-container">
        <h3 className="ud-tracking-title">پیگیری وضعیت سفارش</h3>
        <div className="ud-tracking-form">
          <input
            type="text"
            value={orderTrackingId}
            onChange={(e) => setOrderTrackingId(e.target.value)}
            placeholder="شماره سفارش را وارد کنید"
            className="ud-tracking-input"
            aria-label="وارد کردن شماره سفارش برای پیگیری"
            required
          />
          <button
            onClick={handleTrackOrder}
            className="ud-tracking-button"
            aria-label="پیگیری سفارش"
          >
            پیگیری
          </button>
        </div>
        {trackingResult && (
          <div className="ud-tracking-result">
            <p className="ud-tracking-result-title">وضعیت سفارش #{trackingResult.id}</p>
            <p className="ud-tracking-result-text"><strong>وضعیت:</strong> {trackingResult.status}</p>
            <p className="ud-tracking-result-text"><strong>تاریخ تحویل تخمینی:</strong> {trackingResult.date}</p>
            <p className="ud-tracking-result-text"><strong>جزئیات:</strong> {trackingResult.details || "در حال پردازش"}</p>
          </div>
        )}
        {trackingError && <p className="ud-tracking-error">{trackingError}</p>}
      </div>
      <div className="ud-activities-container">
        <h3 className="ud-activities-title">فعالیت اخیر</h3>
        {recentActivities.length === 0 ? (
          <p className="ud-activities-empty">هیچ فعالیتی ثبت نشده است!</p>
        ) : (
          <ul className="ud-activities-list">
            {recentActivities.slice(0, 5).map((activity, index) => (
              <li key={index} className="ud-activities-item" role="listitem">
                <span className="ud-activities-description">{activity.description}</span>
                <span className="ud-activities-date">
                  {new Date(activity.date).toLocaleDateString("fa-IR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="ud-shortcuts-container">
        <h3 className="ud-shortcuts-title">میانبرهای سریع</h3>
        <div className="ud-shortcuts-grid">
          <button
            onClick={() => setActiveTab("orders")}
            className="ud-shortcuts-button"
            aria-label="مشاهده سفارش‌ها"
          >
            <ShoppingCart className="ud-shortcuts-icon" />
            مشاهده سفارش‌ها
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className="ud-shortcuts-button"
            aria-label="مشاهده علاقه‌مندی‌ها"
          >
            <Favorite className="ud-shortcuts-icon" />
            مشاهده علاقه‌مندی‌ها
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className="ud-shortcuts-button"
            aria-label="ثبت تیکت جدید"
          >
            <Message className="ud-shortcuts-icon" />
            ثبت تیکت جدید
          </button>
        </div>
      </div>
    </div>
  );
}