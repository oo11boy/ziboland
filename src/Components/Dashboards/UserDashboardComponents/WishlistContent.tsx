import { WishlistContentProps } from "@/types/types";
import Image from "next/image";

export default function WishlistContent({
  wishlist,
  handleAddToCart,
  handleRemoveFromWishlist,
}: WishlistContentProps) {
  return (
    <div className="ud-animate-slide-in-up">
      <h2 className="ud-main-title">لیست علاقه‌مندی‌ها</h2>
      <div className="ud-wishlist-container">
        {wishlist.length === 0 ? (
          <p className="ud-wishlist-empty">لیست علاقه‌مندی‌های شما خالی است!</p>
        ) : (
          <ul className="ud-wishlist-list">
            {wishlist.map((item) => (
              <li
                key={item.id}
                className="ud-wishlist-item"
                role="listitem"
                aria-label={`محصول ${item.name} در لیست علاقه‌مندی‌ها`}
              >
                <div className="ud-wishlist-item-content">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="ud-wishlist-image"
                    loading="lazy"
                  />
                  <div className="ud-wishlist-details">
                    <span className="ud-wishlist-name">{item.name}</span>
                    <span className="ud-wishlist-price">
                      {item.price} تومان
                    </span>
                  </div>
                </div>
                <div className="ud-wishlist-buttons">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="ud-wishlist-button ud-wishlist-button-add"
                    aria-label={`افزودن ${item.name} به سبد خرید`}
                  >
                    افزودن به سبد
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="ud-wishlist-button ud-wishlist-button-remove"
                    aria-label={`حذف ${item.name} از لیست علاقه‌مندی‌ها`}
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
