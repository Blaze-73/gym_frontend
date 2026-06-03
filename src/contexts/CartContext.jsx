import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();

  // Initialise from localStorage — only when a token exists
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // ── cart operations ──────────────────────────────────────────────

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Increment quantity by 1 (respects stock limit if provided)
  const increaseQty = (productId, maxStock = Infinity) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, maxStock) }
          : item
      )
    );
  };

  // Decrement qty by 1; removes the item when qty reaches 0
  const decreaseQty = (productId) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  // ── derived values ───────────────────────────────────────────────

  const cartTotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price ?? 0) * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── localStorage persistence ─────────────────────────────────────

  // Persist whenever cart changes — only while authenticated
  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem('cart', JSON.stringify(cart));
      } catch {
        // storage quota exceeded — silently ignore
      }
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart, token]);

  // Clear in-memory cart immediately on logout
  useEffect(() => {
    if (!token) {
      setCart([]);
    }
  }, [token]);

  const value = {
    cart,
    cartItems: cart,   // alias kept for backward-compat with existing consumers
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};