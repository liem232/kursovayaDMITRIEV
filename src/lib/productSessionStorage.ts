import { mockProducts } from '@/data/products';

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

const SESSION_PRODUCTS_KEY = 'progressgarant_session_products';
const PRODUCTS_KEY = 'progressgarant_products';
export const PRODUCTS_UPDATED_EVENT = 'progressgarant_products_updated';

const readLegacySessionProducts = (): Product[] => {
  try {
    const raw = sessionStorage.getItem(SESSION_PRODUCTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
};

const readProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return parsed as Product[];
    return [];
  } catch {
    return [];
  }
};

const writeProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
};

const genId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getSessionProducts = (): Product[] => {
  // legacy name: returns non-mock products which were added via admin UI
  ensureProductsInitialized();
  const baseIds = new Set((mockProducts as Product[]).map(p => p.id));
  return readProducts().filter(p => !baseIds.has(p.id));
};

export const getAllProducts = (): Product[] => {
  ensureProductsInitialized();
  return readProducts();
};

export const addSessionProduct = (product: Omit<Product, 'id'> & { id?: string }): Product => {
  ensureProductsInitialized();
  const next: Product = {
    id: product.id ?? genId(),
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description,
    inStock: product.inStock,
    brand: product.brand,
    volume: product.volume
  };

  const current = readProducts();
  writeProducts([next, ...current]);
  return next;
};

export const removeSessionProduct = (productId: string) => {
  ensureProductsInitialized();
  const current = readProducts();
  writeProducts(current.filter(p => p.id !== productId));
};

export const updateProduct = (productId: string, patch: Partial<Omit<Product, 'id'>>): Product | null => {
  ensureProductsInitialized();
  const current = readProducts();
  const idx = current.findIndex(p => p.id === productId);
  if (idx === -1) return null;

  const updated: Product = {
    ...current[idx],
    ...patch,
    id: current[idx].id
  };

  const next = [...current];
  next[idx] = updated;
  writeProducts(next);
  return updated;
};

export const removeProduct = (productId: string) => {
  removeSessionProduct(productId);
};

const ensureProductsInitialized = () => {
  const existing = readProducts();
  if (existing.length > 0) return;

  const legacy = readLegacySessionProducts();
  if (legacy.length > 0) {
    try {
      sessionStorage.removeItem(SESSION_PRODUCTS_KEY);
    } catch {
      // ignore
    }
  }

  writeProducts([...(mockProducts as Product[]), ...legacy]);
};
