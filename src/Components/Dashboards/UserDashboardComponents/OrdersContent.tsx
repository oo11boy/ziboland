import { OrdersContentProps } from "@/types/types";
import { Modal, Box, Typography, Button } from "@mui/material";
import Image from "next/image";

export default function OrdersContent({
  orders,
  selectedOrder,
  isOrderModalOpen,
  setIsOrderModalOpen,
  handleViewOrderDetails,
  modalStyle,
}: OrdersContentProps) {
  const translateStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "در انتظار";
      case "processing":
        return "در حال پردازش";
      case "shipped":
        return "ارسال شده";
      case "delivered":
        return "تحویل داده شده";
      case "cancelled":
        return "لغو شده";
      default:
        return status;
    }
  };

  return (
    <div className="ud-animate-slide-in-up p-4">
      <h2 className="ud-main-title text-2xl font-bold mb-6">سفارش‌های شما</h2>

      {orders.length === 0 ? (
        <p className="ud-orders-empty text-gray-500 text-center py-10">
          هیچ سفارشی با پرداخت موفق ثبت نشده است!
        </p>
      ) : (
        <div className="ud-orders-grid grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="ud-order-card bg-white rounded-xl shadow-md p-4 transition-transform hover:scale-105 hover:shadow-lg cursor-pointer flex flex-col"
              role="article"
              aria-label={`سفارش ${order.order_code}`}
            >
              <div
                className={`ud-order-status-dot w-3 h-3 rounded-full mb-2 ${
                  order.status === "shipped" || order.status === "delivered"
                    ? "bg-green-500"
                    : "bg-yellow-400"
                }`}
              ></div>

              <div className="ud-order-content flex gap-4 items-center">
                {order.items && order.items.length > 0 && order.items[0].image ? (
                  <Image
                    src={order.items[0].image}
                    alt={order.items[0].title}
                    width={64}
                    height={64}
                    className="ud-order-image rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="ud-order-image-placeholder w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg text-gray-400 text-xs">
                    بدون تصویر
                  </div>
                )}

                <div className="ud-order-details flex-1">
                  <p className="ud-order-name font-semibold text-gray-800">
                    {order.items && order.items.length > 0
                      ? order.items[0].title
                      : "بدون عنوان"}
                    {order.items && order.items.length > 1
                      ? ` و ${order.items.length - 1} مورد دیگر`
                      : ""}
                  </p>
                  <p className="ud-order-info text-gray-500 text-sm mt-1">
                    شماره سفارش: {order.order_code}
                  </p>
                  <p className="ud-order-info text-gray-500 text-sm">
                    تاریخ: {new Date(order.created_at).toLocaleDateString("fa-IR")}
                  </p>
                  <p className="ud-order-info text-gray-500 text-sm">
                    مبلغ: {(order.total_amount / 10).toLocaleString()} تومان
                  </p>
                  <span
                    className={`ud-order-status inline-flex items-center mt-2 font-medium ${
                      order.status === "shipped" || order.status === "delivered"
                        ? "text-green-600"
                        : "text-yellow-500"
                    }`}
                  >
                    <span
                      className={`ud-order-status-dot-status w-2 h-2 rounded-full mr-2 ${
                        order.status === "shipped" || order.status === "delivered"
                          ? "bg-green-600"
                          : "bg-yellow-500"
                      }`}
                    ></span>
                    {translateStatus(order.status)}
                  </span>
                </div>
              </div>

              <div className="ud-order-buttons mt-4">
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewOrderDetails(order)}
                  aria-label={`مشاهده جزئیات سفارش ${order.order_code}`}
                >
                  مشاهده جزئیات
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        aria-labelledby="order-modal-title"
        aria-describedby="order-modal-description"
      >
        <Box sx={{ ...modalStyle, maxHeight: "85vh", overflowY: "auto", p: 3, borderRadius: 3 }}>
          <Typography
            sx={{ fontFamily: "yekannew" }}
            id="order-modal-title"
            variant="h6"
            component="h2"
            className="ud-modal-title mb-4 font-bold text-lg"
          >
            جزئیات سفارش #{selectedOrder?.order_code}
          </Typography>

          {selectedOrder && (
            <div className="ud-modal-content space-y-2 text-sm text-gray-700">
              <p>
                <strong>شماره سفارش:</strong> {selectedOrder.order_code}
              </p>
              <p>
                <strong>تاریخ:</strong>{" "}
                {new Date(selectedOrder.created_at).toLocaleDateString("fa-IR")}
              </p>
              <p>
                <strong>مبلغ کل:</strong>{" "}
                {(selectedOrder.total_amount / 10).toLocaleString()} تومان
              </p>
              <p>
                <strong>وضعیت:</strong>{" "}
                <span
                  className={`font-semibold ${
                    selectedOrder.status === "shipped" || selectedOrder.status === "delivered"
                      ? "text-green-600"
                      : selectedOrder.status === "cancelled"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  {translateStatus(selectedOrder.status)}
                </span>
              </p>
              <p>
                <strong>روش ارسال:</strong>{" "}
                {selectedOrder.shipping_method === "express" ? "اکسپرس" : "عادی"}
              </p>
              <p>
                <strong>آدرس:</strong>{" "}
                {`${selectedOrder.province}، ${selectedOrder.city}، ${selectedOrder.street}${
                  selectedOrder.alley ? `، ${selectedOrder.alley}` : ""
                }${selectedOrder.building_number ? `، پلاک ${selectedOrder.building_number}` : ""}${
                  selectedOrder.unit ? `، واحد ${selectedOrder.unit}` : ""
                }، کدپستی: ${selectedOrder.postal_code}`}
              </p>

              <h3 className="font-semibold mt-3">محصولات:</h3>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <ul className="space-y-2 mt-1">
                  {selectedOrder.items.map((item) => (
                    <li key={item.id} className="border-b pb-2">
                      <p>
                        <strong>محصول:</strong> {item.title}
                      </p>
                      {item.color && (
                        <p>
                          <strong>رنگ:</strong> {item.color.persianName} ({item.color.englishName})
                        </p>
                      )}
                      <p>
                        <strong>تعداد:</strong> {item.quantity}
                      </p>
                      <p>
                        <strong>قیمت واحد:</strong>{" "}
                        {(item.unit_price / 10).toLocaleString()} تومان
                      </p>
                      <p>
                        <strong>نوع قیمت:</strong>{" "}
                        {item.price_type === "single" ? "تکی" : "عمده"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>هیچ محصولی یافت نشد.</p>
              )}

              <div className="ud-modal-buttons mt-4 flex justify-end">
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setIsOrderModalOpen(false)}
                  aria-label="بستن جزئیات سفارش"
                >
                  بستن
                </Button>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
}