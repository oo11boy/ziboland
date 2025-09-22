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
  return (
    <div className="ud-animate-slide-in-up">
      <h2 className="ud-main-title">آدرس‌ها</h2>
      <div className="ud-addresses-container">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              setShowAddressForm(!showAddressForm);
              setEditingAddressId(null);
              setAddressError("");
            }}
            className="ud-addresses-button"
            aria-label="افزودن آدرس جدید"
          >
            <Add className="ud-addresses-button-icon" />
            افزودن آدرس جدید
          </button>
        </div>
        {showAddressForm && (
          <div className="ud-address-form">
            <h3 className="ud-address-form-title">
              {editingAddressId ? "ویرایش آدرس" : "افزودن آدرس جدید"}
            </h3>
            <div className="ud-address-form-grid">
              <div>
                <label className="ud-address-form-label">نام *</label>
                <input
                  type="text"
                  value={newAddress.first_name}
                  onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
                  className="ud-address-form-input"
                  placeholder="نام خود را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="ud-address-form-label">نام خانوادگی *</label>
                <input
                  type="text"
                  value={newAddress.last_name}
                  onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
                  className="ud-address-form-input"
                  placeholder="نام خانوادگی خود را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="ud-address-form-label">شماره همراه *</label>
                <input
                  type="text"
                  value={newAddress.phone_number}
                  onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })}
                  className="ud-address-form-input"
                  placeholder="شماره همراه خود را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="ud-address-form-label">استان *</label>
                <select
                  value={newAddress.province}
                  onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value, city: "" })}
                  className="ud-address-form-select"
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
                <label className="ud-address-form-label">شهر *</label>
                <select
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="ud-address-form-select"
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
              <div>
                <label className="ud-address-form-label">خیابان *</label>
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="ud-address-form-input"
                  placeholder="خیابان را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="ud-address-form-label">کوچه *</label>
                <input
                  type="text"
                  value={newAddress.alley}
                  onChange={(e) => setNewAddress({ ...newAddress, alley: e.target.value })}
                  className="ud-address-form-input"
                  placeholder="کوچه را وارد کنید"
                />
              </div>
              <div>
                <label className="ud-address-form-label">پلاک *</label>
                <input
                  type="text"
                  value={newAddress.building_number}
                  onChange={(e) => setNewAddress({ ...newAddress, building_number: e.target.value })}
                  className="ud-address-form-input"
                  placeholder="پلاک را وارد کنید"
                />
              </div>
              <div>
                <label className="ud-address-form-label">واحد (اختیاری)</label>
                <input
                  type="text"
                  value={newAddress.unit}
                  onChange={(e) => setNewAddress({ ...newAddress, unit: e.target.value })}
                  className="ud-address-form-input"
                  placeholder="واحد را وارد کنید"
                />
              </div>
              <div>
                <label className="ud-address-form-label">کدپستی *</label>
                <input
                  type="text"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                  className="ud-address-form-input"
                  placeholder="کدپستی را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="ud-address-form-label">جزئیات اضافی (اختیاری)</label>
                <textarea
                  value={newAddress.extra_details}
                  onChange={(e) => setNewAddress({ ...newAddress, extra_details: e.target.value })}
                  className="ud-address-form-input"
                  placeholder="جزئیات اضافی (مانند توضیحات تحویل)"
                  rows={4}
                />
              </div>
              <div>
                <label className="ud-address-form-label">آدرس پیش‌فرض</label>
                <input
                  type="checkbox"
                  checked={newAddress.is_default}
                  onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                  className="ud-address-form-checkbox"
                />
              </div>
              {addressError && <p className="ud-address-form-error">{addressError}</p>}
              <div className="ud-address-form-buttons">
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setAddressError("");
                    setEditingAddressId(null);
                  }}
                  className="ud-address-form-button-cancel"
                  aria-label="لغو افزودن آدرس"
                >
                  لغو
                </button>
                <button
                  onClick={handleAddAddress}
                  className="ud-address-form-button-save"
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
            <p className="ud-addresses-empty">هیچ آدرسی ثبت نشده است!</p>
          ) : (
            addresses.map((address) => (
              <Accordion
                key={address.id}
                expanded={expandedAccordion === address.id}
                onChange={handleAccordionChange(address.id)}
                sx={{ fontFamily: "yekannew" }}
                className="ud-address-accordion"
              >
                <AccordionSummary
                  expandIcon={<Add className="ud-addresses-button-icon" />}
                  aria-controls={`address-panel-${address.id}`}
                  id={`address-header-${address.id}`}
                >
                  <div className="ud-address-summary">
                    <Typography sx={{ fontFamily: "yekannew" }} className="ud-address-title">
                      {address.first_name} {address.last_name} - {address.city}
                    </Typography>
                    <span
                      className={`ud-address-status ${
                        address.is_default ? "ud-address-status-default" : "ud-address-status-normal"
                      }`}
                    >
                      {address.is_default ? "پیش‌فرض" : "معمولی"}
                    </span>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="ud-address-details">
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
                    <div className="ud-address-buttons">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="ud-address-button ud-address-button-edit"
                        aria-label={`ویرایش آدرس ${address.first_name} ${address.last_name}`}
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="ud-address-button ud-address-button-delete"
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