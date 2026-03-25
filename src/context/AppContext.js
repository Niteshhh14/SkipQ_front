import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const generateUserId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
};

export const AppProvider = ({ children }) => {
  const [storeId, setStoreId] = useState(
    () => localStorage.getItem('skipq_storeId') || null
  );
  const [storeName, setStoreName] = useState(
    () => localStorage.getItem('skipq_storeName') || ''
  );
  const [userId] = useState(() => {
    const saved = localStorage.getItem('skipq_userId');
    if (saved) return saved;
    const newId = generateUserId();
    localStorage.setItem('skipq_userId', newId);
    return newId;
  });
  const [cartCount, setCartCount] = useState(0);

  const connectToStore = (id, name = '') => {
    const sid = String(id);
    setStoreId(sid);
    setStoreName(name);
    localStorage.setItem('skipq_storeId', sid);
    localStorage.setItem('skipq_storeName', name);
  };

  const disconnectStore = () => {
    setStoreId(null);
    setStoreName('');
    setCartCount(0);
    localStorage.removeItem('skipq_storeId');
    localStorage.removeItem('skipq_storeName');
  };

  return (
    <AppContext.Provider
      value={{ storeId, storeName, userId, cartCount, setCartCount, connectToStore, disconnectStore }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
