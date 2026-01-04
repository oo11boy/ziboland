"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import BenefitsContainer from "../Benefits/BenefitsContainer";
import Cookies from "js-cookie";
import { Modal, Box, Typography, Button } from "@mui/material";
import { Address } from "@/types/types";
import { useCart } from "@/ContextApi/CartContext";
import { cities, provinces } from "@/lib/city";

interface FormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  province: string;
  city: string;
  street: string;
  alley: string;
  building_number: string;
  unit: string;
  postal_code: string;
  extra_details: string;
  is_default: boolean;
}

export default function Checkout() {
  const { state: { cartItems } } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [deliveryType, setDeliveryType] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    province: "",
    city: "",
    street: "",
    alley: "",
    building_number: "",
    unit: "",
    postal_code: "",
    extra_details: "",
    is_default: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submissionError, setSubmissionError] = useState<string>("");
  const token = Cookies.get("authToken");

  useEffect(() => {
    if (token) {
      fetchAddresses();
      fetchUser();
    } else {
      setSubmissionError("لطفاً ابتدا وارد حساب کاربری خود شوید.");
    }
  }, [token]);

  const fetchAddresses = async (): Promise<void> => {
    try {
      const res = await fetch("/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Address[] = await res.json();
        setAddresses(data);
        const defaultAddr = data.find((addr) => addr.is_default);
        if (defaultAddr) selectAddress(defaultAddr);
      } else {
        setSubmissionError("خطا در دریافت آدرس‌ها");
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setSubmissionError("خطا در دریافت آدرس‌ها");
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserId(data.userId);
      } else {
        setSubmissionError("لطفاً ابتدا وارد حساب کاربری خود شوید.");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setSubmissionError("خطا در دریافت اطلاعات کاربر");
    }
  };

  const selectAddress = (addr: Address | null) => {
    if (addr) {
      setSelectedAddress(addr);
      setFormData({
        first_name: addr.first_name,
        last_name: addr.last_name,
        phone_number: addr.phone_number,
        province: addr.province,
        city: addr.city,
        street: addr.street,
        alley: addr.alley || "",
        building_number: addr.building_number || "",
        unit: addr.unit || "",
        postal_code: addr.postal_code,
        extra_details: addr.extra_details || "",
        is_default: addr.is_default,
      });
      setShowAddressForm(false);
    } else {
      setSelectedAddress(null);
      setShowAddressForm(true);
      setFormData({
        first_name: "",
        last_name: "",
        phone_number: "",
        province: "",
        city: "",
        street: "",
        alley: "",
        building_number: "",
        unit: "",
        postal_code: "",
        extra_details: "",
        is_default: false,
      });
    }
    setErrors({});
    setIsAddressModalOpen(false);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "province" ? { city: "" } : {}),
    }));
  };

  const handleDeliveryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeliveryType(e.target.value);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.first_name) newErrors.first_name = "نام الزامی است";
    if (!formData.last_name) newErrors.last_name = "نام خانوادگی الزامی است";
    if (!/^\d{11}$/.test(formData.phone_number))
      newErrors.phone_number = "شماره همراه باید 11 رقم باشد";
    if (!formData.province) newErrors.province = "استان الزامی است";
    if (!formData.city) newErrors.city = "شهر الزامی است";
    if (!formData.street) newErrors.street = "خیابان الزامی است";
    if (!formData.building_number)
      newErrors.building_number = "پلاک الزامی است";
    if (!/^\d{10}$/.test(formData.postal_code))
      newErrors.postal_code = "کدپستی باید 10 رقم باشد";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAddress = async () => {
    if (!validate()) return;
    const payload = {
      ...formData,
      unit: formData.unit || null,
      extra_details: formData.extra_details || null,
    };
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchAddresses();
        setShowAddressForm(false);
        alert("آدرس ذخیره شد");
      } else {
        setSubmissionError("خطا در ذخیره آدرس");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      setSubmissionError("خطا در ذخیره آدرس");
    }
  };

  const handleSubmitOrder = async () => {
    setSubmissionError("");
    if (!selectedAddress) {
      setSubmissionError("لطفاً یک آدرس انتخاب کنید.");
      return;
    }
    if (!deliveryType) {
      setSubmissionError("لطفاً یک روش ارسال انتخاب کنید.");
      return;
    }
    if (cartItems.length === 0) {
      setSubmissionError("سبد خرید شما خالی است.");
      return;
    }
    if (!userId) {
      setSubmissionError("لطفاً ابتدا وارد حساب کاربری خود شوید.");
      return;
    }

    const payload = {
      userId,
      address: selectedAddress,
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: parseInt(item.price.replace(/,/g, "")),
        price_type: item.priceType || "single",
        color: item.color,
      })),
      deliveryType,
      amount: total * 10,
      callbackUrl: `${window.location.origin}/api/payment/verify`,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = data.paymentUrl;
      } else {
        setSubmissionError(data.error || "خطایی در ثبت سفارش رخ داد.");
      }
    } catch (err) {
      console.error("خطا در ثبت سفارش:", err);
      setSubmissionError("خطایی در ثبت سفارش رخ داد.");
    }
  };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 600,
    bgcolor: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    p: 4,
    borderRadius: "12px",
    direction: "rtl",
  };

  const subtotal = cartItems.reduce((total, item) => {
    const price = parseInt(item.price.replace(/,/g, ""));
    return total + price * item.quantity;
  }, 0);

  const deliveryCost: number = deliveryType === "express" ? 129900 : 0;
  const total = subtotal + deliveryCost;

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="w-[90%] mx-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* روش ارسال */}
            <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">روش ارسال</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:border-gray-900 transition">
                  <input
                    type="radio"
                    name="delivery"
                    value="normal"
                    checked={deliveryType === "normal"}
                    onChange={handleDeliveryChange}
                    className="form-radio text-gray-900"
                  />
                  <div className="mr-3 sm:mr-4">
                    <div className="font-semibold text-sm sm:text-base">ارسال عادی</div>
                    <div className="text-xs sm:text-sm text-gray-600">رایگان • ۳-۵ روز کاری</div>
                  </div>
                </label>
                <label className="flex items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:border-gray-900 transition">
                  <input
                    type="radio"
                    name="delivery"
                    value="express"
                    checked={deliveryType === "express"}
                    onChange={handleDeliveryChange}
                    className="form-radio text-gray-900"
                  />
                  <div className="mr-3 sm:mr-4">
                    <div className="font-semibold text-sm sm:text-base">ارسال پیشتاز</div>
                    <div className="text-xs sm:text-sm text-gray-600">129,900 تومان • ۱-۲ روز کاری</div>
                  </div>
                </label>
              </div>
            </section>

            {/* کارت آدرس انتخاب شده یا پیام */}
            <section className="bg-white p-6 rounded-lg shadow-sm space-y-6">
              <h2 className="text-xl font-semibold">آدرس ارسال</h2>

              {selectedAddress ? (
                <div className="p-4 border rounded-lg bg-purple-50 shadow-sm space-y-1">
                  <p className="font-semibold">
                    {selectedAddress.first_name} {selectedAddress.last_name}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {selectedAddress.street}, {selectedAddress.alley || ""}, پلاک{" "}
                    {selectedAddress.building_number}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {selectedAddress.city}, {selectedAddress.province}
                  </p>
                  <p className="text-gray-700 text-sm">
                    کدپستی: {selectedAddress.postal_code}
                  </p>
                  <p className="text-gray-700 text-sm">
                    شماره همراه: {selectedAddress.phone_number}
                  </p>
                  {selectedAddress.is_default && (
                    <span className="text-green-600 text-xs">پیش‌فرض</span>
                  )}
                  <div className="flex gap-2 mt-2">
                    {addresses.length > 0 && (
                      <button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="px-4 sm:px-5 py-2 sm:py-3 bg-white border border-purple-700 text-purple-700 rounded-lg shadow-sm hover:bg-purple-50 transition text-sm sm:text-base"
                      >
                        انتخاب از آدرس‌های ذخیره‌شده
                      </button>
                    )}
                    <button
                      onClick={() => selectAddress(null)}
                      className="px-4 sm:px-5 py-2 sm:py-3 bg-purple-700 text-white rounded-lg shadow-sm hover:bg-purple-800 transition text-sm sm:text-base"
                    >
                      افزودن آدرس جدید
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-gray-600">
                  هیچ آدرسی انتخاب نشده است.
                  <div className="mt-2 flex justify-center gap-2">
                    {addresses.length > 0 && (
                      <button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="px-4 sm:px-5 py-2 sm:py-3 bg-white border border-purple-700 text-purple-700 rounded-lg shadow-sm hover:bg-purple-50 transition text-sm sm:text-base"
                      >
                        انتخاب از آدرس‌های ذخیره‌شده
                      </button>
                    )}
                    <button
                      onClick={() => selectAddress(null)}
                      className="px-4 sm:px-5 py-2 sm:py-3 bg-purple-700 text-white rounded-lg shadow-sm hover:bg-purple-800 transition text-sm sm:text-base"
                    >
                      افزودن آدرس جدید
                    </button>
                  </div>
                </div>
              )}

              {/* فرم آدرس فقط در صورت افزودن آدرس جدید */}
              {showAddressForm && (
                <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="نام *"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs">{errors.first_name}</p>
                  )}

                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="نام خانوادگی *"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-xs">{errors.last_name}</p>
                  )}

                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="شماره همراه *"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-xs">{errors.phone_number}</p>
                  )}

                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  >
                    <option value="">انتخاب استان *</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="text-red-500 text-xs">{errors.province}</p>
                  )}

                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!formData.province}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  >
                    <option value="">انتخاب شهر *</option>
                    {formData.province &&
                      cities[formData.province]?.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                  {errors.city && (
                    <p className="text-red-500 text-xs">{errors.city}</p>
                  )}

                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="خیابان *"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs">{errors.street}</p>
                  )}

                  <input
                    type="text"
                    name="alley"
                    value={formData.alley}
                    onChange={handleInputChange}
                    placeholder="کوچه"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  />
                  {errors.alley && (
                    <p className="text-red-500 text-xs">{errors.alley}</p>
                  )}

                  <input
                    type="text"
                    name="building_number"
                    value={formData.building_number}
                    onChange={handleInputChange}
                    placeholder="پلاک *"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  />
                  {errors.building_number && (
                    <p className="text-red-500 text-xs">{errors.building_number}</p>
                  )}

                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="کدپستی *"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  />
                  {errors.postal_code && (
                    <p className="text-red-500 text-xs">{errors.postal_code}</p>
                  )}

                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="واحد (اختیاری)"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                  />
                  <textarea
                    name="extra_details"
                    value={formData.extra_details}
                    onChange={handleInputChange}
                    placeholder="توضیحات اضافی (اختیاری)"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-300 text-sm sm:text-base"
                    rows={3}
                  ></textarea>

                  <div className="sm:col-span-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 sm:px-5 py-2 sm:py-3 bg-gray-200 rounded hover:bg-gray-300 text-sm sm:text-base"
                    >
                      لغو
                    </button>
                    <button
                      type="button"
                      onClick={saveAddress}
                      className="px-4 sm:px-5 py-2 sm:py-3 bg-purple-700 text-white rounded hover:bg-purple-800 text-sm sm:text-base"
                    >
                      ذخیره آدرس
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>

          {/* خلاصه سفارش */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm sticky top-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">خلاصه سفارش</h2>

              {cartItems.length > 0 ? (
                <>
                  {cartItems.map((item) => (
                    <div
                      key={`${item.id}-${item.priceType}-${item.color?.englishName || "default"}`}
                      className="flex items-start space-x-3 sm:space-x-4 mb-4 pb-4 border-b space-x-reverse"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm sm:text-base">{item.title}</h3>
                        {item.color && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            رنگ: {item.color.persianName} ({item.color.englishName})
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-600">تعداد: {item.quantity}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          قیمت واحد: {item.price} تومان
                        </p>
                        <p className="font-medium text-sm sm:text-base mt-1">
                          {(parseInt(item.price.replace(/,/g, "")) * item.quantity).toLocaleString(
                            "fa-IR"
                          )}{" "}
                          تومان
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2 mb-4 pb-4 border-b">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">جمع جزء</span>
                      <span>{subtotal.toLocaleString("fa-IR")} تومان</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">هزینه ارسال</span>
                      <span className="text-green-600">
                        {deliveryCost === 0 ? "رایگان" : `${deliveryCost.toLocaleString("fa-IR")} تومان`}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6 text-base sm:text-lg font-semibold">
                    <span>جمع کل</span>
                    <span>{total.toLocaleString("fa-IR")} تومان</span>
                  </div>

                  {submissionError && (
                    <p className="text-red-500 text-sm mb-4">{submissionError}</p>
                  )}

                  <button
                    onClick={handleSubmitOrder}
                    className="w-full bg-gray-900 text-white py-3 sm:py-4 rounded-full hover:bg-gray-800 flex items-center justify-center text-sm sm:text-base mt-2"
                    disabled={!token || !userId}
                  >
                    <span>ثبت سفارش</span> <i className="fas fa-lock mr-2"></i>
                  </button>
                </>
              ) : (
                <p className="text-gray-600 text-center">سبد خرید شما خالی است</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal انتخاب آدرس */}
      <Modal
        open={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 2, fontFamily: "yekannew" }}
          >
            انتخاب آدرس ذخیره‌شده
          </Typography>
          {addresses.length === 0 ? (
            <div className="text-center">
              هیچ آدرسی ثبت نشده است.
              <Button
                onClick={() => selectAddress(null)}
                variant="contained"
                className="mt-4 bg-purple-700 hover:bg-purple-800 rounded-lg"
              >
                افزودن آدرس جدید
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition"
                  onClick={() => selectAddress(addr)}
                >
                  <p>
                    {addr.first_name} {addr.last_name} - {addr.city},{" "}
                    {addr.province}
                  </p>
                  <p className="text-gray-600">
                    {addr.street}, {addr.alley || ""}, پلاک {addr.building_number},{" "}
                    کدپستی {addr.postal_code}
                  </p>
                  {addr.is_default && <p className="text-green-600">پیش‌فرض</p>}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-end gap-3">
            <Button
              onClick={() => setIsAddressModalOpen(false)}
              variant="outlined"
              className="border-gray-300 text-gray-700 rounded-lg"
            >
              بستن
            </Button>
            <Button
              onClick={() => selectAddress(null)}
              variant="contained"
              className="bg-purple-700 hover:bg-purple-800 rounded-lg"
            >
              افزودن آدرس جدید
            </Button>
          </div>
        </Box>
      </Modal>

      <BenefitsContainer />
    </div>
  );
}