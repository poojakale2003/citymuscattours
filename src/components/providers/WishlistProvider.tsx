"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WishlistItem = {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  currency?: string;
  rating: number;
  highlights: string[];
  image: string;
  detailPath?: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "citymuscattours:wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as WishlistItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.warn("[wishlist] Failed to load stored wishlist", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch (error) {
      console.warn("[wishlist] Failed to persist wishlist", error);
    }
  }, [items]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleItem = useCallback(
    (item: WishlistItem) => {
      setItems((prev) => {
        const exists = prev.some((existing) => existing.id === item.id);
        if (exists) {
          return prev.filter((existing) => existing.id !== item.id);
        }
        return [...prev, item];
      });
    },
    [],
  );

  const isWishlisted = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      addItem,
      removeItem,
      toggleItem,
      isWishlisted,
    }),
    [items, addItem, removeItem, toggleItem, isWishlisted],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

