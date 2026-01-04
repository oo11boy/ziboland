"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";

interface CartItem {
  id: number;
  title: string;
  quantity: number;
  priceType: "single" | "wholesale";
  price: string;
  image: string;
  discount: string;
  color?: {
    englishName: string;
    persianName: string | null;
    hexCode: string;
  } | null;
  baseRetailPrice: number;
  baseWholesalePrice: number;
  retailDiscountPercent: number;
  minWholesale: number;
  stock_quantity: number; // اضافه شد برای کنترل سقف خرید
  addedAt: number;
}

interface CartState {
  cartItems: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "addedAt"> }
  | {
      type: "REMOVE_ITEM_BY_TYPE";
      payload: { id: number; color?: CartItem["color"] };
    }
  | {
      type: "UPDATE_QUANTITY";
      payload: { itemKey: string; newQuantity: number };
    }
  | { type: "CLEAR_CART" };

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "cartItems";

const getItemKey = (item: { id: number; color?: CartItem["color"] }) =>
  `${item.id}-${item.color?.englishName || "default"}`;

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const key = getItemKey(action.payload);
      const existingItemIndex = state.cartItems.findIndex(
        (item) => getItemKey(item) === key
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.cartItems];
        const existingItem = updatedItems[existingItemIndex];

        // کنترل موجودی در هنگام اضافه کردن مجدد
        let totalQuantity = existingItem.quantity + action.payload.quantity;
        if (totalQuantity > action.payload.stock_quantity) {
          totalQuantity = action.payload.stock_quantity;
        }

        const isWholesale =
          totalQuantity >= action.payload.minWholesale &&
          action.payload.baseWholesalePrice > 0;
        let newUnitPrice = isWholesale
          ? action.payload.baseWholesalePrice
          : Math.round(
              action.payload.baseRetailPrice *
                (1 - action.payload.retailDiscountPercent / 100)
            );

        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: totalQuantity,
          priceType: isWholesale ? "wholesale" : "single",
          price: newUnitPrice.toString(),
          discount: isWholesale
            ? "0"
            : `${action.payload.retailDiscountPercent}%`,
        };
        return { ...state, cartItems: updatedItems };
      }

      return {
        ...state,
        cartItems: [
          ...state.cartItems,
          { ...action.payload, addedAt: Date.now() },
        ],
      };
    }

    case "UPDATE_QUANTITY": {
      const { itemKey, newQuantity } = action.payload;
      const itemIndex = state.cartItems.findIndex(
        (item) => getItemKey(item) === itemKey
      );

      if (itemIndex >= 0) {
        const item = state.cartItems[itemIndex];

        // اگر تعداد درخواستی بیشتر از موجودی انبار بود، روی سقف انبار قفل شود
        const finalQuantity =
          newQuantity > item.stock_quantity ? item.stock_quantity : newQuantity;

        if (finalQuantity <= 0) {
          return {
            ...state,
            cartItems: state.cartItems.filter((_, i) => i !== itemIndex),
          };
        }

        const isWholesale =
          finalQuantity >= item.minWholesale && item.baseWholesalePrice > 0;
        let newUnitPrice = isWholesale
          ? item.baseWholesalePrice
          : Math.round(
              item.baseRetailPrice * (1 - item.retailDiscountPercent / 100)
            );

        const updatedItems = [...state.cartItems];
        updatedItems[itemIndex] = {
          ...item,
          quantity: finalQuantity,
          priceType: isWholesale ? "wholesale" : "single",
          price: newUnitPrice.toString(),
          discount: isWholesale ? "0" : `${item.retailDiscountPercent}%`,
        };
        return { ...state, cartItems: updatedItems };
      }
      return state;
    }

    case "REMOVE_ITEM_BY_TYPE":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => getItemKey(item) !== getItemKey(action.payload)
        ),
      };

    case "CLEAR_CART":
      return { ...state, cartItems: [] };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, { cartItems: [] });

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.forEach((item: any) =>
          dispatch({ type: "ADD_ITEM", payload: item })
        );
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
