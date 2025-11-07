import { userdashSidebarProps } from "@/types/types";
import { Menu, Close, Home, ShoppingBag, Favorite, FireTruck, Settings, Logout } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import Link from "next/link";


export default function Sidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  toggleSidebar,
  accountInfo,
  handleLogout,
}: userdashSidebarProps) {
  return (
    <>
      <div className="ud-mobile-header">
        <div className="ud-mobile-header-user">
          <Avatar alt={accountInfo.first_name} />
          <div>
            <h1 className="ud-mobile-header-title">{accountInfo.first_name}</h1>
            <p className="ud-mobile-header-email">{accountInfo.email}</p>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="ud-mobile-header-button"
          aria-label={isSidebarOpen ? "بستن منو" : "باز کردن منو"}
        >
          {isSidebarOpen ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <aside className={`ud-sidebar ${isSidebarOpen ? "ud-sidebar-open" : ""}`}>
        <div className="ud-sidebar-user">
          <Avatar alt={accountInfo.first_name} />
          <div>
            <h1 className="ud-mobile-header-title">{accountInfo.first_name}</h1>
            <p className="ud-mobile-header-email">{accountInfo.email}</p>
          </div>
        </div>
        <nav className="ud-sidebar-nav">
          {[
            { tab: "dashboard", label: "پیشخوان", Icon: Home },
            { tab: "orders", label: "سفارش‌ها", Icon: ShoppingBag },
            // { tab: "wishlist", label: "لیست‌ها", Icon: Favorite },
            { tab: "tickets", label: "تیکت پشتیبانی", Icon: FireTruck },
            { tab: "addresses", label: "آدرس", Icon: Settings },
            { tab: "account", label: "اطلاعات حساب کاربری", Icon: Settings },
          ].map(({ tab, label, Icon }) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                toggleSidebar();
              }}
              className={`ud-sidebar-button ${activeTab === tab ? "ud-sidebar-button-active" : ""}`}
              aria-label={`نمایش ${label}`}
            >
              <Icon className="ud-sidebar-icon" />
              {label}
            </button>
          ))}
          <Link
            href="/"
            className="ud-sidebar-button"
            onClick={toggleSidebar}
            aria-label="بازگشت به خانه"
          >
            <Home className="ud-sidebar-icon" />
            بازگشت به خانه
          </Link>
          <button
            onClick={handleLogout}
            className="ud-sidebar-button"
            aria-label="خروج از حساب کاربری"
          >
            <Logout className="ud-sidebar-icon" />
            خروج
          </button>
        </nav>
      </aside>
    </>
  );
}