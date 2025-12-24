import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { getAllProducts, PRODUCTS_UPDATED_EVENT } from '@/lib/productSessionStorage';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  brand?: string;
  volume?: string;
}

interface CartLine {
  id: string;
  quantity: number;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [productsVersion, setProductsVersion] = useState(0);

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    void productsVersion;
    for (const p of getAllProducts() as Product[]) {
      map.set(p.id, p);
    }
    return map;
  }, [productsVersion]);

  useEffect(() => {
    const onUpdate = () => setProductsVersion(v => v + 1);
    window.addEventListener(PRODUCTS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(PRODUCTS_UPDATED_EVENT, onUpdate);
  }, []);

  const items: CartItem[] = useMemo(() => {
    return lines
      .map((line) => {
        const product = productById.get(line.id);
        if (!product) return null;
        return { ...product, quantity: line.quantity };
      })
      .filter((x): x is CartItem => Boolean(x));
  }, [lines, productById]);

  useEffect(() => {
    const savedCart = localStorage.getItem('progressgarant_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const normalized: CartLine[] = Array.isArray(parsed)
          ? parsed
              .map((entry: any) => {
                const id = String(entry?.id ?? '');
                const quantity = Number(entry?.quantity ?? 0);
                if (!id || !Number.isFinite(quantity) || quantity <= 0) return null;
                return { id, quantity } as CartLine;
              })
              .filter(Boolean)
          : [];
        setLines(normalized);
      } catch (error) {
        localStorage.removeItem('progressgarant_cart');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('progressgarant_cart', JSON.stringify(lines));
  }, [lines]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setLines(prevLines => {
      const existing = prevLines.find(line => line.id === product.id);
      if (existing) {
        return prevLines.map(line =>
          line.id === product.id
            ? { ...line, quantity: line.quantity + quantity }
            : line
        );
      }
      return [...prevLines, { id: product.id, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setLines(prevLines => prevLines.filter(line => line.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setLines(prevLines =>
      prevLines.map(line =>
        line.id === productId ? { ...line, quantity } : line
      )
    );
  };

  const clearCart = () => {
    setLines([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};