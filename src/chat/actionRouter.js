export const ACTION_LABELS = {
  CONNECT_STORE: 'Connect to store',
  SHOW_PRODUCTS: 'Show products',
  SCAN_BARCODE: 'Scan barcode',
  ADD_TO_CART: 'Add to cart',
  VIEW_CART: 'View cart',
  REMOVE_ITEM: 'Remove item',
  CHECKOUT: 'Checkout',
  SHOW_BILL: 'Show bill',
  VERIFY_EXIT: 'Verify exit',
};

const extractToken = (text, pattern) => {
  const match = text.match(pattern);
  return match?.[1] || null;
};

const getStoreCodeFromText = (text) => extractToken(text, /(?:store\s*code|connect\s*(?:to)?\s*store)\s*[:#-]?\s*([a-z0-9_-]{3,})/i);
const getBarcodeFromText = (text) => extractToken(text, /(?:barcode|scan)\s*[:#-]?\s*([a-z0-9-]{3,})/i);
const getProductIdFromText = (text) => extractToken(text, /(?:add\s*item|product\s*id)\s*[:#-]?\s*([a-z0-9-]+)/i);
const getCartItemIdFromText = (text) => extractToken(text, /(?:remove\s*item|cart\s*item\s*id)\s*[:#-]?\s*([a-z0-9-]+)/i);
const getOrderIdFromText = (text) => extractToken(text, /(?:order\s*id|bill|verify)\s*[:#-]?\s*([a-z0-9-]{3,})/i);

const countCartItems = (items) => items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

const refreshCartState = async (state, api) => {
  const cart = await api.getCart(state.userId);
  return {
    cartId: cart.cartId,
    cartItemsCount: countCartItems(cart.items),
  };
};

export const executeSuggestedAction = async ({ action, state, api, messageText }) => {
  switch (action) {
    case 'CONNECT_STORE': {
      const storeCode = getStoreCodeFromText(messageText || '');
      if (!storeCode) {
        return {
          ok: false,
          reply: 'Please share a store code, for example: connect store STORE001.',
          statePatch: {},
        };
      }

      const store = await api.connectStore(storeCode.toUpperCase());
      return {
        ok: true,
        reply: `Connected to ${store.storeName || `Store #${store.storeId}`}.`,
        statePatch: {
          storeId: store.storeId,
          storeConnected: true,
        },
        navigateTo: `/store/${store.storeId}`,
      };
    }

    case 'SHOW_PRODUCTS': {
      if (!state.storeConnected || !state.storeId) {
        return {
          ok: false,
          reply: 'Please connect to a store first.',
          statePatch: {},
        };
      }

      await api.getProducts(state.storeId);
      return {
        ok: true,
        reply: 'Opening products for your connected store.',
        statePatch: {},
        navigateTo: `/store/${state.storeId}`,
      };
    }

    case 'SCAN_BARCODE': {
      const barcode = getBarcodeFromText(messageText || '');
      if (!barcode) {
        return {
          ok: false,
          reply: 'Please provide a barcode, for example: scan barcode 8901234567890.',
          statePatch: {},
        };
      }

      const product = await api.getProductByBarcode(barcode);
      return {
        ok: true,
        reply: product?.name
          ? `Found ${product.name}. To add it, say: add item ${product.id}.`
          : 'I found a matching barcode.',
        statePatch: {},
      };
    }

    case 'ADD_TO_CART': {
      if (!state.storeConnected || !state.storeId) {
        return {
          ok: false,
          reply: 'Please connect to a store before adding items.',
          statePatch: {},
        };
      }

      const productId = getProductIdFromText(messageText || '');
      if (!productId) {
        return {
          ok: false,
          reply: 'Please provide a product ID, for example: add item 101.',
          statePatch: {},
        };
      }

      await api.addToCart(state.userId, productId, 1);
      const cartPatch = await refreshCartState(state, api);
      return {
        ok: true,
        reply: 'Item added to cart.',
        statePatch: cartPatch,
      };
    }

    case 'VIEW_CART': {
      const cartPatch = await refreshCartState(state, api);
      return {
        ok: true,
        reply: `You have ${cartPatch.cartItemsCount} item${cartPatch.cartItemsCount !== 1 ? 's' : ''} in cart.`,
        statePatch: cartPatch,
        navigateTo: '/cart',
      };
    }

    case 'REMOVE_ITEM': {
      const cartItemId = getCartItemIdFromText(messageText || '');
      if (!cartItemId) {
        return {
          ok: false,
          reply: 'Please share cart item ID, for example: remove item 55.',
          statePatch: {},
        };
      }

      await api.removeCartItem(cartItemId);
      const cartPatch = await refreshCartState(state, api);
      return {
        ok: true,
        reply: 'Item removed from cart.',
        statePatch: cartPatch,
      };
    }

    case 'CHECKOUT': {
      if (!state.storeConnected || !state.storeId) {
        return {
          ok: false,
          reply: 'Please connect to a store before checkout.',
          statePatch: {},
        };
      }

      if (!Number(state.cartItemsCount || 0)) {
        return {
          ok: false,
          reply: 'Your cart is empty, so checkout is blocked.',
          statePatch: {},
        };
      }

      const result = await api.checkout(state.userId, state.storeId);
      return {
        ok: true,
        reply: `Checkout complete. Order ${result.orderId} is ready.`,
        statePatch: {
          lastOrderId: result.orderId,
          cartItemsCount: 0,
          cartId: null,
        },
        navigateTo: result.orderId ? `/bill/${result.orderId}` : '/payment',
      };
    }

    case 'SHOW_BILL': {
      const orderId = getOrderIdFromText(messageText || '') || state.lastOrderId;
      if (!orderId) {
        return {
          ok: false,
          reply: 'I need an order ID to show the bill.',
          statePatch: {},
        };
      }

      await api.getBill(orderId);
      return {
        ok: true,
        reply: `Opening bill for ${orderId}.`,
        statePatch: {
          lastOrderId: orderId,
          lastBillViewed: orderId,
        },
        navigateTo: `/bill/${orderId}`,
      };
    }

    case 'VERIFY_EXIT': {
      const orderId = getOrderIdFromText(messageText || '') || state.lastOrderId;
      if (!orderId) {
        return {
          ok: false,
          reply: 'I need an order ID to verify purchase.',
          statePatch: {},
        };
      }

      await api.verifyExit(orderId);
      return {
        ok: true,
        reply: `Purchase verified for order ${orderId}.`,
        statePatch: {
          lastOrderId: orderId,
        },
      };
    }

    default:
      return {
        ok: false,
        reply: 'That suggested action is not supported yet.',
        statePatch: {},
      };
  }
};

export default executeSuggestedAction;
