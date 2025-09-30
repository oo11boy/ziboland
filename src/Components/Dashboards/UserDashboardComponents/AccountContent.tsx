import { AccountContentProps } from "@/types/types";


export default function AccountContent({
  accountInfo,
  handleAccountInfoChange,
  handleSaveAccountInfo,
}: AccountContentProps) {
  return (
    <div className="ud-animate-slide-in-up p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6 border-b pb-2">اطلاعات حساب کاربری</h2>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">نام کاربری *</label>
          <input
            type="text"
            value={accountInfo.username}
            onChange={(e) => handleAccountInfoChange("username", e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="نام کاربری خود را وارد کنید"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">ایمیل *</label>
          <input
            type="email"
            value={accountInfo.email}
            onChange={(e) => handleAccountInfoChange("email", e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="ایمیل خود را وارد کنید"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">نام *</label>
          <input
            type="text"
            value={accountInfo.first_name}
            onChange={(e) => handleAccountInfoChange("first_name", e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="نام خود را وارد کنید"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">نام خانوادگی *</label>
          <input
            type="text"
            value={accountInfo.last_name}
            onChange={(e) => handleAccountInfoChange("last_name", e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="نام خانوادگی خود را وارد کنید"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">شماره همراه</label>
          <input
            type="text"
            value={accountInfo.phone_number}
            onChange={(e) => handleAccountInfoChange("phone_number", e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="شماره همراه خود را وارد کنید"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveAccountInfo}
          className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition"
        >
          ذخیره تغییرات
        </button>
      </div>
    </div>
  );
}