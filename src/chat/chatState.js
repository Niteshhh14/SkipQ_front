export const createInitialChatState = ({ userId, storeId, cartItemsCount = 0 }) => ({
  userId,
  storeConnected: Boolean(storeId),
  storeId: storeId || null,
  cartItemsCount: Number(cartItemsCount || 0),
  lastOrderId: null,
  lastBillViewed: null,
});

export const syncStateWithApp = (state, { userId, storeId, cartItemsCount }) => ({
  ...state,
  userId,
  storeConnected: Boolean(storeId || state.storeId),
  storeId: storeId || state.storeId || null,
  cartItemsCount: Number.isFinite(cartItemsCount)
    ? cartItemsCount
    : Number(state.cartItemsCount || 0),
});

export const applyBusinessStatePatch = (state, patch = {}) => ({
  ...state,
  ...patch,
  storeConnected: Boolean((patch.storeId ?? state.storeId) || patch.storeConnected || state.storeConnected),
});
