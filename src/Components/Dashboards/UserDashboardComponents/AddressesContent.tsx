import { AddressesContentProps } from "@/types/types";
import { Add, ExpandMore, Edit, Delete, Phone, LocationOn, Home, Person, PinDrop, CheckCircle,  } from "@mui/icons-material";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import { MapPin } from "lucide-react";
import { useState } from "react";

export default function AddressesContent({
  addresses,
  newAddress,
  setNewAddress,
  addressError,
  setAddressError,
  showAddressForm,
  setShowAddressForm,
  editingAddressId,
  setEditingAddressId,
  provinces,
  cities,
  handleAddAddress,
  handleEditAddress,
  handleDeleteAddress,
  expandedAccordion,
  handleAccordionChange,
}: AddressesContentProps) {
  // State برای مدیریت ادیت درون‌خطی
  const [editingFormData, setEditingFormData] = useState<any>(null);

  // محدود کردن ورودی به اعداد فارسی و انگلیسی
  const handlePhoneInput = (value: string) => {
    const persianNumbers = /^[۰-۹0-9]*$/;
    if (persianNumbers.test(value)) {
      return value;
    }
    const persianToEnglish: { [key: string]: string } = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    const converted = value.replace(/[۰-۹]/g, (match) => persianToEnglish[match] || match);
    if (/^[0-9]*$/.test(converted)) {
      return converted;
    }
    return value.replace(/[^0-9]/g, '');
  };

  const handlePostalCodeInput = (value: string) => {
    const persianNumbers = /^[۰-۹0-9]*$/;
    if (persianNumbers.test(value)) {
      return value;
    }
    const persianToEnglish: { [key: string]: string } = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    const converted = value.replace(/[۰-۹]/g, (match) => persianToEnglish[match] || match);
    if (/^[0-9]*$/.test(converted)) {
      return converted;
    }
    return value.replace(/[^0-9]/g, '');
  };

  const handleBuildingNumberInput = (value: string) => {
    const persianNumbers = /^[۰-۹0-9]*$/;
    if (persianNumbers.test(value)) {
      return value;
    }
    const persianToEnglish: { [key: string]: string } = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    const converted = value.replace(/[۰-۹]/g, (match) => persianToEnglish[match] || match);
    if (/^[0-9]*$/.test(converted)) {
      return converted;
    }
    return value.replace(/[^0-9]/g, '');
  };

  const handleUnitInput = (value: string) => {
    const persianNumbers = /^[۰-۹0-9]*$/;
    if (persianNumbers.test(value)) {
      return value;
    }
    const persianToEnglish: { [key: string]: string } = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    const converted = value.replace(/[۰-۹]/g, (match) => persianToEnglish[match] || match);
    if (/^[0-9]*$/.test(converted)) {
      return converted;
    }
    return value.replace(/[^0-9]/g, '');
  };

  // تابع برای شروع ویرایش آدرس
  const startEditAddress = (address: any) => {
    setEditingFormData({
      id: address.id,
      first_name: address.first_name,
      last_name: address.last_name,
      phone_number: address.phone_number,
      province: address.province,
      city: address.city,
      street: address.street,
      alley: address.alley || "",
      building_number: address.building_number || "",
      unit: address.unit || "",
      postal_code: address.postal_code,
      is_default: address.is_default,
      extra_details: address.extra_details || "",
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
    setAddressError("");
  };

  // تابع برای ذخیره ویرایش
  const saveEditAddress = () => {
    if (editingFormData) {
      handleAddAddress();
      setEditingFormData(null);
    }
  };

  return (
    <div className="ud-animate-slide-in-up font-yekannew w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* هدر و عنوان */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="text-[#14B8A6] w-7 h-7" />
            آدرس‌های من
          </h2>
          <p className="text-gray-500 text-sm mt-1 mr-10">
            {addresses.length} آدرس ذخیره شده
          </p>
        </div>
        
        <button
          onClick={() => {
            setShowAddressForm(!showAddressForm);
            setEditingAddressId(null);
            setEditingFormData(null);
            setAddressError("");
          }}
          className="bg-[#14B8A6] hover:bg-[#14b8a6] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium w-full sm:w-auto justify-center"
          aria-label="افزودن آدرس جدید"
        >
          <Add className="text-lg" />
          افزودن آدرس جدید
        </button>
      </div>

      {/* فرم افزودن/ویرایش آدرس - مدرن و کشویی */}
      {showAddressForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Home className="text-[#14B8A6]" />
              {editingAddressId ? "ویرایش آدرس" : "افزودن آدرس جدید"}
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* نام */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  نام <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingAddressId ? editingFormData?.first_name || "" : newAddress.first_name}
                  onChange={(e) => {
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, first_name: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, first_name: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  placeholder="نام خود را وارد کنید"
                  required
                />
              </div>

              {/* نام خانوادگی */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  نام خانوادگی <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingAddressId ? editingFormData?.last_name || "" : newAddress.last_name}
                  onChange={(e) => {
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, last_name: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, last_name: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  placeholder="نام خانوادگی خود را وارد کنید"
                  required
                />
              </div>

              {/* شماره همراه */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Phone className="inline-block w-4 h-4 ml-1" />
                  شماره همراه <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editingAddressId ? editingFormData?.phone_number || "" : newAddress.phone_number}
                  onChange={(e) => {
                    const value = handlePhoneInput(e.target.value);
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, phone_number: value });
                    } else {
                      setNewAddress({ ...newAddress, phone_number: value });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  placeholder="۰۹۱۲xxxxxxx"
                  required
                  maxLength={11}
                />
              </div>

              {/* استان */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  استان <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingAddressId ? editingFormData?.province || "" : newAddress.province}
                  onChange={(e) => {
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, province: e.target.value, city: "" });
                    } else {
                      setNewAddress({ ...newAddress, province: e.target.value, city: "" });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              {/* شهر */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  شهر <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingAddressId ? editingFormData?.city || "" : newAddress.city}
                  onChange={(e) => {
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, city: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, city: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  required
                  disabled={!newAddress.province && !editingFormData?.province}
                >
                  <option value="">ابتدا استان را انتخاب کنید</option>
                  {(editingAddressId ? cities[editingFormData?.province] : cities[newAddress.province])?.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* خیابان */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  خیابان <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingAddressId ? editingFormData?.street || "" : newAddress.street}
                  onChange={(e) => {
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, street: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, street: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  placeholder="خیابان را وارد کنید"
                  required
                />
              </div>

              {/* کوچه */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  کوچه
                </label>
                <input
                  type="text"
                  value={editingAddressId ? editingFormData?.alley || "" : newAddress.alley}
                  onChange={(e) => {
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, alley: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, alley: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  placeholder="کوچه را وارد کنید"
                />
              </div>

              {/* پلاک */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  پلاک <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editingAddressId ? editingFormData?.building_number || "" : newAddress.building_number}
                  onChange={(e) => {
                    const value = handleBuildingNumberInput(e.target.value);
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, building_number: value });
                    } else {
                      setNewAddress({ ...newAddress, building_number: value });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  placeholder="پلاک را وارد کنید"
                  required
                />
              </div>

              {/* واحد */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  واحد (اختیاری)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editingAddressId ? editingFormData?.unit || "" : newAddress.unit}
                  onChange={(e) => {
                    const value = handleUnitInput(e.target.value);
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, unit: value });
                    } else {
                      setNewAddress({ ...newAddress, unit: value });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  placeholder="واحد را وارد کنید"
                />
              </div>

              {/* کدپستی */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  کدپستی <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editingAddressId ? editingFormData?.postal_code || "" : newAddress.postal_code}
                  onChange={(e) => {
                    const value = handlePostalCodeInput(e.target.value);
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, postal_code: value });
                    } else {
                      setNewAddress({ ...newAddress, postal_code: value });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
                  placeholder="کدپستی را وارد کنید"
                  required
                  maxLength={10}
                />
              </div>

              {/* آدرس پیش‌فرض */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingAddressId ? editingFormData?.is_default || false : newAddress.is_default}
                  onChange={(e) => {
                    if (editingAddressId) {
                      setEditingFormData({ ...editingFormData, is_default: e.target.checked });
                    } else {
                      setNewAddress({ ...newAddress, is_default: e.target.checked });
                    }
                  }}
                  className="w-5 h-5 text-[#14B8A6] rounded focus:ring-2 focus:ring-blue-500"
                  id="is-default"
                />
                <label htmlFor="is-default" className="text-sm font-medium text-gray-700">
                  آدرس پیش‌فرض
                </label>
              </div>
            </div>

            {/* خطاها */}
            {addressError && (
              <div className="mt-4">
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
                  {addressError}
                </p>
              </div>
            )}

            {/* دکمه‌های فرم */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddressForm(false);
                  setAddressError("");
                  setEditingAddressId(null);
                  setEditingFormData(null);
                }}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700"
                aria-label="لغو"
              >
                لغو
              </button>
              <button
                onClick={() => {
                  if (editingAddressId && editingFormData) {
                    // اگر در حالت ویرایش هستیم
                    const updatedAddress = {
                      ...editingFormData,
                      id: editingAddressId
                    };
                    // فراخوانی تابع ویرایش با آدرس به‌روز شده
                    handleEditAddress(updatedAddress);
                    setEditingAddressId(null);
                    setEditingFormData(null);
                    setShowAddressForm(false);
                  } else {
                    // اگر در حالت افزودن هستیم
                    handleAddAddress();
                  }
                }}
                className="px-6 py-2.5 bg-[#14B8A6] text-white rounded-xl hover:bg-[#14b8a6] transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                aria-label={editingAddressId ? "ذخیره تغییرات" : "ذخیره آدرس"}
              >
                {editingAddressId ? "ذخیره تغییرات" : "ذخیره آدرس"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* لیست آدرس‌ها - کارت‌های مدرن */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <PinDrop className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">هیچ آدرسی ثبت نشده است!</p>
            <p className="text-gray-400 text-sm mt-2">برای افزودن آدرس جدید، روی دکمه بالا کلیک کنید</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                expandedAccordion === address.id 
                  ? 'border-blue-400 shadow-lg' 
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              {/* هدر کارت */}
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => handleAccordionChange(address.id)(null as any, expandedAccordion === address.id ? false : true)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Person className="text-[#14B8A6] w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-gray-800 text-sm sm:text-base truncate">
                        {address.first_name} {address.last_name}
                      </span>
                      <span className="text-gray-400 hidden sm:inline">|</span>
                      <LocationOn className="text-gray-400 w-4 h-4 flex-shrink-0 hidden sm:inline" />
                      <span className="text-gray-600 text-sm truncate hidden sm:inline">
                        {address.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {address.phone_number}
                      </span>
                      <span className="text-gray-300 hidden sm:inline">|</span>
                      <span className="text-gray-500 text-xs truncate hidden sm:inline">
                        {address.street}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {address.is_default && (
                      <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-green-200 whitespace-nowrap">
                        <CheckCircle className="w-3 h-3" />
                        پیش‌فرض
                      </span>
                    )}
                    <ExpandMore className={`text-gray-400 transition-transform duration-300 ${expandedAccordion === address.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* محتوای کارت */}
              {expandedAccordion === address.id && (
                <div className="border-t border-gray-200 p-5 bg-gray-50 rounded-b-2xl animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-600 min-w-[70px]">نام:</span>
                      <span className="text-gray-800">{address.first_name} {address.last_name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-600 min-w-[70px] flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        همراه:
                      </span>
                      <span className="text-gray-800" dir="ltr">{address.phone_number}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-600 min-w-[70px]">استان:</span>
                      <span className="text-gray-800">{address.province}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-600 min-w-[70px]">شهر:</span>
                      <span className="text-gray-800">{address.city}</span>
                    </div>
                    <div className="flex items-start gap-2 col-span-full">
                      <span className="font-medium text-gray-600 min-w-[70px]">خیابان:</span>
                      <span className="text-gray-800">{address.street}</span>
                    </div>
                    {address.alley && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-600 min-w-[70px]">کوچه:</span>
                        <span className="text-gray-800">{address.alley}</span>
                      </div>
                    )}
                    {address.building_number && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-600 min-w-[70px]">پلاک:</span>
                        <span className="text-gray-800">{address.building_number}</span>
                      </div>
                    )}
                    {address.unit && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-600 min-w-[70px]">واحد:</span>
                        <span className="text-gray-800">{address.unit}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 col-span-full">
                      <span className="font-medium text-gray-600 min-w-[70px]">کدپستی:</span>
                      <span className="text-gray-800" dir="ltr">{address.postal_code}</span>
                    </div>
                    {address.extra_details && (
                      <div className="flex items-start gap-2 col-span-full">
                        <span className="font-medium text-gray-600 min-w-[70px]">جزئیات:</span>
                        <span className="text-gray-800">{address.extra_details}</span>
                      </div>
                    )}
                  </div>

                  {/* دکمه‌های عملیات */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditAddress(address);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-[#14B8A6] transition-all duration-200 text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
                      aria-label={`ویرایش آدرس ${address.first_name} ${address.last_name}`}
                    >
                      <Edit className="w-4 h-4" />
                      ویرایش
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
                      aria-label={`حذف آدرس ${address.first_name} ${address.last_name}`}
                    >
                      <Delete className="w-4 h-4" />
                      حذف
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* استایل انیمیشن */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}