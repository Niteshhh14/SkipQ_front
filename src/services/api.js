import axios from 'axios';

console.log('API BASE URL:', import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Store ─────────────────────────────────────────────────────────────────────
export const connectStore = (storeCode) =>
  api.post('/api/store/connect', { storeCode });

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = (storeId) =>
  api.get(`/api/products/${storeId}`);

export const getProductByBarcode = (barcode) =>
  api.get(`/api/products/barcode/${barcode}`);

// ── Cart ──────────────────────────────────────────────────────────────────────
export const getCart = (userId) =>
  api.get(`/api/cart/${userId}`);

export const addToCart = (userId, productId, quantity = 1) =>
  api.post('/api/cart/add', { userId, productId, quantity });

export const removeFromCart = (cartItemId) =>
  api.delete(`/api/cart/remove/${cartItemId}`);

// ── Checkout & Bill ───────────────────────────────────────────────────────────
export const checkout = (payload) =>
  api.post('/api/checkout', payload);

export const getBill = (orderId) =>
  api.get(`/api/bill/${orderId}`);

export const verifyExit = (orderId) =>
  api.get(`/api/verify/${orderId}`);

export const verifyPurchase = verifyExit;

export default api;
