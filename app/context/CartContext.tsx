'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface Cart {
  [id: string]: number;
}

interface CartContextValue {
  cart: Cart;
  add: (id: string) => void;
  remove: (id: string) => void;
  removeAll: (id: string) => void;
  isReady: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isReady]);

  const add = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const remove = (id: string) => {
    setCart((prev) => {
      const count = (prev[id] || 0) - 1;
      if (count <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: count };
    });
  };

  const removeAll = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <CartContext.Provider value={{ cart, add, remove, removeAll, isReady }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
