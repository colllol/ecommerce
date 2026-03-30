import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

function normalizeItem(product, quantity) {
  return {
    product_id: product.product_id,
    product_name: product.product_name,
    image_url: product.image_url || null,
    price: Number(product.price) || 0,
    discount_percent: Number(product.discount_percent) || 0,
    stock_quantity: product.stock_quantity ?? null,
    quantity,
  };
}

function calcLineTotal(item) {
  const unit = Number(item.price) || 0;
  const qty = Number(item.quantity) || 0;
  const disc = Math.min(100, Math.max(0, Number(item.discount_percent) || 0));
  const raw = unit * qty * (1 - disc / 100);
  return Math.max(0, Math.round(raw));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.product_id === product.product_id);
      if (idx === -1) return [...prev, normalizeItem(product, qty)];
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
      return next;
    });
  };

  const updateQuantity = (productId, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setItems((prev) => prev.map((x) => (x.product_id === productId ? { ...x, quantity: qty } : x)));
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((x) => x.product_id !== productId));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + calcLineTotal(i), 0);
    const count = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    return { subtotal, count };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totals,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        calcLineTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

