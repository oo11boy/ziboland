import React from 'react';
import BenefitsContainer from '../Benefits/BenefitsContainer';

export default function Checkout() {
  return (
    <div className="bg-gray-50">


      {/* محتوای اصلی */}
      <main className="w-[90%] mx-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* فرم‌های پرداخت */}
          <div className="lg:col-span-2 space-y-8">
            {/* روش ارسال */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">روش ارسال</h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-black">
                  <input type="radio" name="delivery" className="form-radio text-black" defaultChecked />
                  <div className="mr-4">
                    <div className="font-semibold">ارسال استاندارد</div>
                    <div className="text-sm text-gray-600">رایگان • ۳-۵ روز کاری</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-black">
                  <input type="radio" name="delivery" className="form-radio text-black" />
                  <div className="mr-4">
                    <div className="font-semibold">ارسال سریع</div>
                    <div className="text-sm text-gray-600">۱۲.۹۹ دلار • ۱-۲ روز کاری</div>
                  </div>
                </label>
              </div>
            </section>

            {/* آدرس ارسال */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">آدرس ارسال</h2>
                <button className="text-sm text-gray-600 hover:text-black">
                  <i className="far fa-address-book mr-1"></i> استفاده از آدرس ذخیره‌شده
                </button>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                      placeholder="محمد"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                      placeholder="محمدی"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">آدرس خیابان</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    placeholder="خیابان اصلی ۱۲۳"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">آپارتمان، واحد و غیره (اختیاری)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    placeholder="واحد ۴ب"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">شهر</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                      placeholder="تهران"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">استان</label>
                    <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none">
                      <option>انتخاب استان</option>
                      <option>تهران</option>
                      <option>اصفهان</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">کد پستی</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                      placeholder="۱۲۳۴۵"
                    />
                  </div>
                </div>
              </form>
            </section>

          </div>

          {/* خلاصه سفارش */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <h2 className="text-xl font-semibold mb-4">خلاصه سفارش</h2>
              <div className="flex items-start space-x-4 mb-4 pb-4 border-b">
                <img
                  src="https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="نایک ایر مکس ۲۰۲۴"
                  className="w-20 h-20 rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">نایک ایر مکس ۲۰۲۴</h3>
                  <p className="text-sm text-gray-600">سایز: US 10</p>
                  <p className="text-sm text-gray-600">تعداد: ۱</p>
                  <p className="font-medium mt-1">۱۷۹.۹۹ دلار</p>
                </div>
              </div>
              <div className="mb-4 pb-4 border-b">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                    placeholder="کد تخفیف"
                  />
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black">اعمال</button>
                </div>
              </div>
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">جمع جزء</span>
                  <span>۱۷۹.۹۹ دلار</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">هزینه ارسال</span>
                  <span className="text-green-600">رایگان</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">مالیات</span>
                  <span>۱۶.۲۰ دلار</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">جمع کل</span>
                <span className="text-lg font-semibold">۱۹۶.۱۹ دلار</span>
              </div>
              <button className="w-full bg-black text-white py-4 rounded-full hover:bg-gray-800 flex items-center justify-center">
                <span>ثبت سفارش</span>
                <i className="fas fa-lock mr-2"></i>
              </button>
              <div className="mt-4 text-sm text-gray-600 text-center">
                <p>با ثبت سفارش، شما با</p>
                <p>
                  <a href="#" className="underline">شرایط خدمات</a> و <a href="#" className="underline">سیاست حریم خصوصی</a> ما موافقت می‌کنید
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* بخش فوتر */}
  
        <BenefitsContainer/>
      
    
    </div>
  );
}