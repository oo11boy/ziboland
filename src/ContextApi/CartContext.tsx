"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Color } from "@/types/types";

interface CartItem {
  id: number;
  title: string;
  quantity: number;
  priceType: "single" | "wholesale";
  price: string;
  image: string;
  discount: string;
  color?: Color | null;
  addedAt: number;
}

interface CartState {
  cartItems: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "addedAt"> }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "REMOVE_ITEM_BY_TYPE"; payload: { id: number; priceType: "single" | "wholesale" } }
  | { type: "UPDATE_QUANTITY"; payload: CartItem }
  | { type: "CLEAR_CART" };

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cartItems";

const getCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      if (Array.isArray(parsedCart) && parsedCart.every(item => 
        typeof item === "object" &&
        "id" in item &&
        "title" in item &&
        "quantity" in item &&
        "priceType" in item &&
        "price" in item &&
        "image" in item &&
        "discount" in item &&
        ("color" in item ? typeof item.color === "object" : true)
      )) {
        return parsedCart.map(item => ({
          ...item,
          addedAt: item.addedAt || Date.now()
        }));
      }
    }
    return [];
  } catch (error) {
    console.error("Error parsing cart from localStorage:", error);
    return [];
  }
};

const getItemKey = (itemOrPayload: { id: number; priceType: string; color?: Color | null }) =>
  `${itemOrPayload.id}-${itemOrPayload.priceType}-${itemOrPayload.color?.englishName || "default"}`;

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM":
      const existingItemIndex = state.cartItems.findIndex(
        (item) => getItemKey(item) === getItemKey(action.payload)
      );
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.cartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };
        return { ...state, cartItems: updatedItems };
      }
      
      return {
        ...state,
        cartItems: [
          ...state.cartItems,
          {
            ...action.payload,
            addedAt: Date.now()
          }
        ],
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => item.id !== action.payload),
      };

    case "REMOVE_ITEM_BY_TYPE":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => !(item.id === action.payload.id && item.priceType === action.payload.priceType)
        ),
      };

    case "UPDATE_QUANTITY":
      const itemIndex = state.cartItems.findIndex(
        (item) => getItemKey(item) === getItemKey(action.payload)
      );
      
      if (itemIndex >= 0) {
        const updatedItems = [...state.cartItems];
        updatedItems[itemIndex] = {
          ...action.payload,
          addedAt: updatedItems[itemIndex].addedAt // حفظ زمان افزودن اصلی
        };
        return { ...state, cartItems: updatedItems };
      }
      return state;

    case "CLEAR_CART":
      return {
        ...state,
        cartItems: [],
      };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: getCartFromStorage(),
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cartItems));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [state.cartItems]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};