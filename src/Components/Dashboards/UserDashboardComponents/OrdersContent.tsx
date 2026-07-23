import { OrdersContentProps } from "@/types/types";
import { Modal, Box, Typography, Button, Chip, Divider } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

// Constants
const STATUS_CONFIG = {
  pending: { label: "در انتظار پرداخت", color: "warning", dotColor: "bg-yellow-400" },
  processing: { label: "در حال پردازش", color: "info", dotColor: "bg-blue-400" },
  shipped: { label: "ارسال شده", color: "success", dotColor: "bg-green-500" },
  delivered: { label: "تحویل داده شده", color: "success", dotColor: "bg-green-600" },
  cancelled: { label: "لغو شده", color: "error", dotColor: "bg-red-500" },
} as const;

const EXPRESS_SHIPPING_METHODS = [
  "fast_tehran",
  "fast_other",
  "express",
  "پیشتاز",
  "normal_express",
] as const;

type OrderStatus = keyof typeof STATUS_CONFIG;

export default function OrdersContent({
  orders,
  selectedOrder,
  isOrderModalOpen,
  setIsOrderModalOpen,
  handleViewOrderDetails,
  handleDeleteOrder,
  modalStyle,
}: OrdersContentProps) {
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

  const translateStatus = (status: string): string => {
    return STATUS_CONFIG[status as OrderStatus]?.label || status;
  };

  const getStatusColor = (status: string): string => {
    return STATUS_CONFIG[status as OrderStatus]?.color || "default";
  };

  const getStatusDotColor = (status: string): string => {
    return STATUS_CONFIG[status as OrderStatus]?.dotColor || "bg-gray-400";
  };

  const isExpressShipping = (method: string): boolean => {
    return EXPRESS_SHIPPING_METHODS.includes(method as any);
  };

  const formatPrice = (amount: number): string => {
    return (amount / 10).toLocaleString("fa-IR");
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteWithLoading = async (orderId: number) => {
    setDeletingOrderId(orderId);
    await handleDeleteOrder(orderId);
    setDeletingOrderId(null);
  };

  const renderOrderCard = (order: any) => (
    <div
      key={order.id}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5 flex flex-col cursor-pointer border border-gray-100"
      role="article"
      aria-label={`سفارش ${order.order_code}`}
      onClick={() => handleViewOrderDetails(order)}
    >
      {/* Status Dot */}
      <div className={`w-3 h-3 rounded-full mb-3 ${getStatusDotColor(order.status)}`} />

      {/* Main Content */}
      <div className="flex gap-4 items-start">
        {/* Product Image */}
        {order.items?.[0]?.image ? (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
            <Image
              src={order.items[0].image}
              alt={order.items[0].title}
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">
            بدون تصویر
          </div>
        )}

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm line-clamp-1">
            {order.items?.[0]?.title || "بدون عنوان"}
            {order.items?.length > 1 && (
              <span className="text-gray-500 text-xs mr-1">
                و {order.items.length - 1} مورد دیگر
              </span>
            )}
          </p>

          <div className="mt-2 space-y-1">
            <p className="text-gray-500 text-xs">
              <span className="font-medium">شماره سفارش:</span> {order.order_code}
            </p>
            <p className="text-gray-500 text-xs">
              <span className="font-medium">تاریخ:</span> {formatDate(order.created_at)}
            </p>
            <p className="text-gray-700 text-sm font-bold">
              {formatPrice(order.total_amount)} تومان
            </p>
          </div>

          {/* Status Chip */}
          <Chip
            label={translateStatus(order.status)}
            color={getStatusColor(order.status) as any}
            size="small"
            className="mt-2 !font-yekannew"
          />

          {/* Tracking Info */}
          {order.tracking_info && order.status === "shipped" && (
            <p className="text-blue-600 text-xs mt-2 font-medium bg-blue-50 p-2 rounded-lg">
              {isExpressShipping(order.shipping_method) ? (
                <>🚚 شماره پیک: {order.tracking_info}</>
              ) : (
                <>📦 کد رهگیری پستی: {order.tracking_info}</>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 yekan flex gap-2 pt-3 border-t border-gray-100">
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className="yekan !text-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewOrderDetails(order);
          }}
        >
          جزئیات سفارش
        </Button>

        {order.status === "pending" && (
          <Button
            variant="outlined"
            color="error"
            className="!font-yekannew !text-sm flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteWithLoading(order.id);
            }}
            disabled={deletingOrderId === order.id}
          >
            {deletingOrderId === order.id ? "در حال حذف..." : "حذف"}
          </Button>
        )}
      </div>
    </div>
  );

  const renderOrderModal = () => (
    <Modal
      open={isOrderModalOpen}
      onClose={() => setIsOrderModalOpen(false)}
      aria-labelledby="order-modal-title"
    >
      <Box
        sx={{
          ...modalStyle,
          maxHeight: "90vh",
          overflowY: "auto",
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          bgcolor: "background.paper",
        }}
        className="!font-yekannew"
      >
        {selectedOrder && (
          <>
            <Typography
              id="order-modal-title"
              variant="h5"
              component="h2"
              className="!font-yekannew !font-bold mb-4"
            >
              جزئیات سفارش #{selectedOrder.order_code}
            </Typography>

            <Divider className="mb-4" />

            <div className="space-y-3 text-sm">
              {/* Order Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs">شماره سفارش</p>
                  <p className="font-medium">{selectedOrder.order_code}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs">تاریخ ثبت</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-xs">مبلغ کل</p>
                  <p className="font-bold text-lg">
                    {formatPrice(selectedOrder.total_amount)} تومان
                  </p>
                </div>
                <div className="bg-gray-50 yekan p-3 rounded-lg">
                  <p className="text-gray-500 text-xs">وضعیت</p>
                  <Chip
                    label={translateStatus(selectedOrder.status)}
                    color={getStatusColor(selectedOrder.status) as any}
                    size="small"
                    className="!font-yekannew mt-1"
                  />
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-xs">روش ارسال</p>
                <p className="font-medium">
                  {selectedOrder.shipping_method === "express" ? "اکسپرس" : "عادی"}
                </p>
              </div>

              {/* Tracking Info */}
              {selectedOrder.tracking_info && selectedOrder.status === "shipped" && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-gray-500 text-xs">اطلاعات رهگیری</p>
                  <p className="font-medium text-blue-700">
                    {isExpressShipping(selectedOrder.shipping_method)
                      ? `🚚 شماره پیک: ${selectedOrder.tracking_info}`
                      : `📦 کد رهگیری پستی: ${selectedOrder.tracking_info}`}
                  </p>
                </div>
              )}

              {/* Address */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-xs">آدرس تحویل</p>
                <p className="font-medium">
                  {selectedOrder.province}، {selectedOrder.city}، {selectedOrder.street}
                  {selectedOrder.alley && `، ${selectedOrder.alley}`}
                  {selectedOrder.building_number && `، پلاک ${selectedOrder.building_number}`}
                  {selectedOrder.unit && `، واحد ${selectedOrder.unit}`}
                  <br />
                  <span className="text-gray-500 text-xs">کدپستی: {selectedOrder.postal_code}</span>
                </p>
              </div>

              {/* Products */}
              <div>
                <Typography variant="subtitle1" className="yekan !font-bold mb-2">
                  محصولات سفارش
                </Typography>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.color && (
                            <p className="text-xs text-gray-500">
                              رنگ: {item.color.persianName} ({item.color.englishName})
                            </p>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{item.quantity} عدد</p>
                          <p className="text-xs text-gray-500">
                            {item.unit_price.toLocaleString()} تومان
                          </p>
                        </div>
                      </div>
                      <div className="mt-1">
                        <Chip
                          label={item.price_type === "single" ? "تکی" : "عمده"}
                          size="small"
                          variant="outlined"
                          className="!font-yekannew !text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="contained"
                  color="primary"
                  className="!font-yekannew"
                  onClick={() => setIsOrderModalOpen(false)}
                >
                  بستن
                </Button>
              </div>
            </div>
          </>
        )}
      </Box>
    </Modal>
  );

  return (
    <div className="ud-animate-slide-in-up p-4 md:p-6 font-yekannew">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        سفارش‌های شما
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg">هیچ سفارشی با پرداخت موفق ثبت نشده است!</p>
          <p className="text-gray-400 text-sm mt-2">برای مشاهده سفارشات، ابتدا خرید کنید.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {orders.map(renderOrderCard)}
        </div>
      )}

      {renderOrderModal()}
    </div>
  );
}