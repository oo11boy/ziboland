import { OrdersContentProps } from "@/types/types";
import { Modal, Box, Typography } from "@mui/material";
import Image from "next/image";


export default function OrdersContent({
  orders,
  selectedOrder,
  isOrderModalOpen,
  setIsOrderModalOpen,
  handleViewOrderDetails,
  handleCancelOrder,
  modalStyle,
}: OrdersContentProps) {
  return (
    <div className="ud-animate-slide-in-up">
      <h2 className="ud-main-title">سفارش‌های شما</h2>
      <div className="ud-orders-grid">
        {orders.length === 0 ? (
          <p className="ud-orders-empty">هیچ سفارشی ثبت نشده است!</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="ud-order-card" role="article" aria-label={`سفارش ${order.id}`}>
              <div
                className={`ud-order-status-dot ${
                  order.status === "ارسال شده" ? "ud-order-status-dot-green" : "ud-order-status-dot-yellow"
                }`}
              ></div>
              <div className="ud-order-content">
                <Image
                  src={order.product.image}
                  alt={order.product.name}
                  width={64}
                  height={64}
                  className="ud-order-image"
                  loading="lazy"
                />
                <div className="ud-order-details">
                  <p className="ud-order-name">{order.product.name}</p>
                  <p className="ud-order-info">شماره سفارش: {order.id}</p>
                  <p className="ud-order-info">تاریخ: {new Date(order.date).toLocaleDateString("fa-IR")}</p>
                  <p className="ud-order-info">مبلغ: {order.total} تومان</p>
                  <span
                    className={`ud-order-status ${
                      order.status === "ارسال شده" ? "ud-order-status-green" : "ud-order-status-yellow"
                    }`}
                  >
                    <span
                      className={`ud-order-status-dot-status ${
                        order.status === "ارسال شده" ? "ud-order-status-dot-green" : "ud-order-status-dot-yellow"
                      }`}
                    ></span>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="ud-order-buttons">
                <button
                  onClick={() => handleViewOrderDetails(order)}
                  className="ud-order-button ud-order-button-details"
                  aria-label={`مشاهده جزئیات سفارش ${order.id}`}
                >
                  مشاهده جزئیات
                </button>
                {order.status === "در حال پردازش" && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="ud-order-button ud-order-button-cancel"
                    aria-label={`لغو سفارش ${order.id}`}
                  >
                    لغو سفارش
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <Modal
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        aria-labelledby="order-modal-title"
        aria-describedby="order-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            sx={{ fontFamily: "yekannew" }}
            id="order-modal-title"
            variant="h6"
            component="h2"
            className="ud-modal-title"
          >
            جزئیات سفارش #{selectedOrder?.id}
          </Typography>
          {selectedOrder && (
            <div className="ud-modal-content">
              <p><strong>محصول:</strong> {selectedOrder.product.name}</p>
              <p><strong>جزئیات محصول:</strong> {selectedOrder.product.details || "جزئیات موجود نیست"}</p>
              <p><strong>شماره سفارش:</strong> {selectedOrder.id}</p>
              <p><strong>تاریخ:</strong> {new Date(selectedOrder.date).toLocaleDateString("fa-IR")}</p>
              <p><strong>مبلغ:</strong> {selectedOrder.total} تومان</p>
              <p><strong>وضعیت:</strong> {selectedOrder.status}</p>
              <div className="ud-modal-buttons">
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className="ud-modal-button-close"
                  aria-label="بستن جزئیات سفارش"
                >
                  بستن
                </button>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
}