import { executeSuggestedAction } from './actionRouter';

describe('executeSuggestedAction', () => {
  const state = {
    userId: 'guest-123',
    storeConnected: true,
    storeId: '1',
    cartItemsCount: 2,
    lastOrderId: null,
  };

  const api = {
    connectStore: jest.fn(),
    getProducts: jest.fn(),
    getProductByBarcode: jest.fn(),
    addToCart: jest.fn(),
    getCart: jest.fn(),
    removeCartItem: jest.fn(),
    checkout: jest.fn(),
    getBill: jest.fn(),
    verifyExit: jest.fn(),
  };

  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
  });

  test('blocks checkout when cart is empty', async () => {
    const result = await executeSuggestedAction({
      action: 'CHECKOUT',
      state: { ...state, cartItemsCount: 0 },
      api,
      messageText: 'checkout',
    });

    expect(result.ok).toBe(false);
    expect(result.reply.toLowerCase()).toContain('empty');
    expect(api.checkout).not.toHaveBeenCalled();
  });

  test('connect store requires store code in message', async () => {
    const result = await executeSuggestedAction({
      action: 'CONNECT_STORE',
      state: { ...state, storeConnected: false, storeId: null },
      api,
      messageText: 'connect store',
    });

    expect(result.ok).toBe(false);
    expect(api.connectStore).not.toHaveBeenCalled();
  });

  test('view cart refreshes cart state', async () => {
    api.getCart.mockResolvedValue({
      cartId: 'c-1',
      items: [{ quantity: 2 }, { quantity: 1 }],
    });

    const result = await executeSuggestedAction({
      action: 'VIEW_CART',
      state,
      api,
      messageText: 'view cart',
    });

    expect(result.ok).toBe(true);
    expect(result.statePatch.cartItemsCount).toBe(3);
    expect(result.navigateTo).toBe('/cart');
  });
});
