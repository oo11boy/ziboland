import { AccountContentProps } from "@/types/types";


export default function AccountContent({
  accountInfo,
  handleAccountInfoChange,
  handleSaveAccountInfo,
}: AccountContentProps) {
  return (
    <div className="ud-animate-slide-in-up">
      <h2 className="ud-main-title">اطلاعات حساب کاربری</h2>
      <div className="ud-account-container">
        <div className="ud-account-form">
          <div>
            <label className="ud-account-form-label">نام کاربری *</label>
            <input
              type="text"
              value={accountInfo.username}
              onChange={(e) => handleAccountInfoChange("username", e.target.value)}
              className="ud-account-form-input"
              placeholder="نام کاربری خود را وارد کنید"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label className="ud-account-form-label">ایمیل *</label>
            <input
              type="email"
              value={accountInfo.email}
              onChange={(e) => handleAccountInfoChange("email", e.target.value)}
              className="ud-account-form-input"
              placeholder="ایمیل خود را وارد کنید"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label className="ud-account-form-label">نام *</label>
            <input
              type="text"
              value={accountInfo.first_name}
              onChange={(e) => handleAccountInfoChange("first_name", e.target.value)}
              className="ud-account-form-input"
              placeholder="نام خود را وارد کنید"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label className="ud-account-form-label">نام خانوادگی *</label>
            <input
              type="text"
              value={accountInfo.last_name}
              onChange={(e) => handleAccountInfoChange("last_name", e.target.value)}
              className="ud-account-form-input"
              placeholder="نام خانوادگی خود را وارد کنید"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label className="ud-account-form-label">شماره همراه</label>
            <input
              type="text"
              value={accountInfo.phone_number}
              onChange={(e) => handleAccountInfoChange("phone_number", e.target.value)}
              className="ud-account-form-input"
              placeholder="شماره همراه خود را وارد کنید"
            />
          </div>
          <div className="ud-account-form-buttons">
            <button
              onClick={handleSaveAccountInfo}
              className="ud-account-form-button-save"
              aria-label="ذخیره تغییرات حساب کاربری"
            >
              ذخیره تغییرات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}