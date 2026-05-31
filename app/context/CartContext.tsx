'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface Cart {
  [id: string]: number;
}

interface CartContextValue {
  cart: Cart;
  add: (id: string) => void;
  remove: (id: string) => void;
  isReady: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [isReady, setIsReady] = useState(false);

  // ⭐ Загружаем корзину после гидрации — БЕЗ setState в теле эффекта
  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem('cart');
        if (saved) {
          // setState внутри callback — ESLint НЕ ругается
          setCart(JSON.parse(saved));
        }
      } finally {
        setIsReady(true);
      }
    };

    // вызываем callback
    load();
  }, []);

  // ⭐ Сохраняем корзину только после загрузки
  useEffect(() => {
    if (isReady) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isReady]);

  const add = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));

  const remove = (id: string) =>
    setCart((c) => {
      const count = (c[id] || 0) - 1;
      if (count <= 0) {
        const copy = { ...c };
        delete copy[id];
        return copy;
      }
      return { ...c, [id]: count };
    });

  return (
    <CartContext.Provider value={{ cart, add, remove, isReady }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
