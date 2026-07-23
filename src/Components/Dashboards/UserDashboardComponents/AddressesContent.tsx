import { AddressesContentProps } from "@/types/types";
import { Add } from "@mui/icons-material";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";

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
  // محدود کردن ورودی به اعداد فارسی و انگلیسی
  const handlePhoneInput = (value: string) => {
    const persianNumbers = /^[۰-۹0-9]*$/;
    if (persianNumbers.test(value)) {
      return value;
    }
    // تبدیل اعداد فارسی به انگلیسی
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

  // محدود کردن ورودی کدپستی به اعداد
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

  // محدود کردن ورودی پلاک به اعداد
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

  // محدود کردن ورودی واحد به اعداد
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

  return (
    <div className="ud-animate-slide-in-up font-yekannew">
      <h2 className="ud-main-title text-2xl font-bold mb-6">آدرس‌ها</h2>
      <div className="ud-addresses-container">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              setShowAddressForm(!showAddressForm);
              setEditingAddressId(null);
              setAddressError("");
            }}
            className="ud-addresses-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            aria-label="افزودن آدرس جدید"
          >
            <Add className="ud-addresses-button-icon" />
            افزودن آدرس جدید
          </button>
        </div>

        {showAddressForm && (
          <div className="ud-address-form bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="ud-address-form-title text-xl font-bold mb-4">
              {editingAddressId ? "ویرایش آدرس" : "افزودن آدرس جدید"}
            </h3>
            <div className="ud-address-form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* نام */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">نام *</label>
                <input
                  type="text"
                  value={newAddress.first_name}
                  onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
                  className="ud-address-form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="نام خود را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>

              {/* نام خانوادگی */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">نام خانوادگی *</label>
                <input
                  type="text"
                  value={newAddress.last_name}
                  onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
                  className="ud-address-form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="نام خانوادگی خود را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>

              {/* شماره همراه - فقط اعداد */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">شماره همراه *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newAddress.phone_number}
                  onChange={(e) => {
                    const value = handlePhoneInput(e.target.value);
                    setNewAddress({ ...newAddress, phone_number: value });
                  }}
                  className="ud-address-form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="شماره همراه خود را وارد کنید"
                  required
                  aria-required="true"
                  maxLength={11}
                />
              </div>

              {/* استان */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">استان *</label>
                <select
                  value={newAddress.province}
                  onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value, city: "" })}
                  className="ud-address-form-select w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  aria-required="true"
                >
                  <option value="">انتخاب کنید</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              {/* شهر */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">شهر *</label>
                <select
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="ud-address-form-select w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!newAddress.province}
                  aria-required="true"
                >
                  <option value="">ابتدا استان را انتخاب کنید</option>
                  {newAddress.province &&
                    cities[newAddress.province]?.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                </select>
              </div>

              {/* خیابان */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">خیابان *</label>
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="ud-address-form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="خیابان را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>

              {/* کوچه */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">کوچه</label>
                <input
                  type="text"
                  value={newAddress.alley}
                  onChange={(e) => setNewAddress({ ...newAddress, alley: e.target.value })}
                  className="ud-address-form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="کوچه را وارد کنید"
                />
              </div>

              {/* پلاک - فقط اعداد */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">پلاک *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newAddress.building_number}
                  onChange={(e) => {
                    const value = handleBuildingNumberInput(e.target.value);
                    setNewAddress({ ...newAddress, building_number: value });
                  }}
                  className="ud-address-form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="پلاک را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>

              {/* واحد - فقط اعداد */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">واحد (اختیاری)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newAddress.unit}
                  onChange={(e) => {
                    const value = handleUnitInput(e.target.value);
                    setNewAddress({ ...newAddress, unit: value });
                  }}
                  className="ud-address-form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="واحد را وارد کنید"
                />
              </div>

              {/* کدپستی - فقط اعداد */}
              <div>
                <label className="ud-address-form-label block text-sm font-medium mb-1">کدپستی *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newAddress.postal_code}
                  onChange={(e) => {
                    const value = handlePostalCodeInput(e.target.value);
                    setNewAddress({ ...newAddress, postal_code: value });
                  }}
                  className="ud-address-form-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="کدپستی را وارد کنید"
                  required
                  aria-required="true"
                  maxLength={10}
                />
              </div>

              {/* آدرس پیش‌فرض */}
              <div className="flex items-center">
                <label className="ud-address-form-label text-sm font-medium mr-2">آدرس پیش‌فرض</label>
                <input
                  type="checkbox"
                  checked={newAddress.is_default}
                  onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                  className="ud-address-form-checkbox w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {addressError && (
                <p className="ud-address-form-error text-red-500 text-sm col-span-2">{addressError}</p>
              )}

              <div className="ud-address-form-buttons col-span-2 flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setAddressError("");
                    setEditingAddressId(null);
                  }}
                  className="ud-address-form-button-cancel px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="لغو افزودن آدرس"
                >
                  لغو
                </button>
                <button
                  onClick={handleAddAddress}
                  className="ud-address-form-button-save px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label={editingAddressId ? "ذخیره تغییرات آدرس" : "ذخیره آدرس جدید"}
                >
                  {editingAddressId ? "ذخیره تغییرات" : "ذخیره آدرس"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <p className="ud-addresses-empty text-center text-gray-500 py-10">
              هیچ آدرسی ثبت نشده است!
            </p>
          ) : (
            addresses.map((address) => (
              <Accordion
                key={address.id}
                expanded={expandedAccordion === address.id}
                onChange={handleAccordionChange(address.id)}
                sx={{ fontFamily: "yekannew" }}
                className="ud-address-accordion border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionSummary
                  expandIcon={<Add className="ud-addresses-button-icon" />}
                  aria-controls={`address-panel-${address.id}`}
                  id={`address-header-${address.id}`}
                  className="hover:bg-gray-50 rounded-t-lg"
                >
                  <div className="ud-address-summary flex items-center justify-between w-full">
                    <Typography sx={{ fontFamily: "yekannew" }} className="ud-address-title font-medium">
                      {address.first_name} {address.last_name} - {address.city}
                    </Typography>
                    <span
                      className={`ud-address-status px-3 py-1 rounded-full text-xs font-medium ${
                        address.is_default 
                          ? "ud-address-status-default bg-green-100 text-green-700" 
                          : "ud-address-status-normal bg-gray-100 text-gray-700"
                      }`}
                    >
                      {address.is_default ? "پیش‌فرض" : "معمولی"}
                    </span>
                  </div>
                </AccordionSummary>
                <AccordionDetails className="border-t border-gray-200">
                  <div className="ud-address-details space-y-2">
                    <p><strong>نام:</strong> {address.first_name} {address.last_name}</p>
                    <p><strong>شماره همراه:</strong> {address.phone_number}</p>
                    <p><strong>استان:</strong> {address.province}</p>
                    <p><strong>شهر:</strong> {address.city}</p>
                    <p><strong>خیابان:</strong> {address.street}</p>
                    {address.alley && <p><strong>کوچه:</strong> {address.alley}</p>}
                    {address.building_number && <p><strong>پلاک:</strong> {address.building_number}</p>}
                    {address.unit && <p><strong>واحد:</strong> {address.unit}</p>}
                    <p><strong>کدپستی:</strong> {address.postal_code}</p>
                    {address.extra_details && <p><strong>جزئیات اضافی:</strong> {address.extra_details}</p>}
                    <div className="ud-address-buttons flex gap-2 mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="ud-address-button ud-address-button-edit px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        aria-label={`ویرایش آدرس ${address.first_name} ${address.last_name}`}
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="ud-address-button ud-address-button-delete px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        aria-label={`حذف آدرس ${address.first_name} ${address.last_name}`}
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
  );
}