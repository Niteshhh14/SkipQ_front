import api from '../services/api';

const unwrap = (response) => response.data?.data || response.data || {};

export const chatApi = {
  async assist(payload) {
    const response = await api.post('/api/chat/assist', payload);
    const data = unwrap(response);

    return {
      reply: data.reply || response.data?.reply || 'Continue with the next checkout step.',
      nextStep: data.nextStep || response.data?.nextStep || 'Continue with the next checkout step.',
      suggestedActions: data.suggestedActions || response.data?.suggestedActions || [],
      source: data.source || response.data?.source || 'RULE_BASED_FALLBACK',
    };
  },

  async connectStore(storeCode) {
    const response = await api.post('/api/store/connect', { storeCode });
    const data = unwrap(response);
    return {
      storeId: String(data.storeId || data.id || ''),
      storeName: data.storeName || data.name || '',
    };
  },

  async getProducts(storeId) {
    const response = await api.get(`/api/products/${storeId}`);
    const data = unwrap(response);
    const products = data.products || response.data?.products || response.data || [];
    return Array.isArray(products) ? products : [];
  },

  async getProductByBarcode(barcode) {
    const response = await api.get(`/api/products/barcode/${barcode}`);
    return unwrap(response);
  },

  async addToCart(userId, productId, quantity = 1) {
    const response = await api.post('/api/cart/add', { userId, productId, quantity });
    return unwrap(response);
  },

  async getCart(userId) {
    const response = await api.get(`/api/cart/${userId}`);
    const data = unwrap(response);
    const items = data.items || response.data?.items || response.data || [];
    return {
      cartId: data.cartId || data.id || null,
      items: Array.isArray(items) ? items : [],
    };
  },

  async removeCartItem(cartItemId) {
    const response = await api.delete(`/api/cart/remove/${cartItemId}`);
    return unwrap(response);
  },

  async checkout(userId, storeId) {
    const response = await api.post('/api/checkout', { userId, storeId });
    const data = unwrap(response);
    return {
      orderId: data.orderId || data.id || null,
    };
  },

  async getBill(orderId) {
    const response = await api.get(`/api/bill/${orderId}`);
    return response.data?.bill || unwrap(response);
  },

  async verifyExit(orderId) {
    const response = await api.get(`/api/verify/${orderId}`);
    return unwrap(response);
  },
};

export default chatApi;
