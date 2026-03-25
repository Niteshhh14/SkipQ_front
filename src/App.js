import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ConnectStore from './pages/ConnectStore';
import Inventory from './pages/Inventory';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import Bill from './pages/Bill';
import ChatWidget from './components/ChatWidget';
import './App.css';

/** Redirect unauthenticated users to /connect-store */
const ProtectedRoute = ({ children }) => {
  const { storeId } = useApp();
  return storeId ? children : <Navigate to="/connect-store" replace />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Navigate to="/connect-store" replace />} />
        <Route path="/connect-store" element={<ConnectStore />} />
        <Route
          path="/store/:storeId"
          element={<ProtectedRoute><Inventory /></ProtectedRoute>}
        />
        <Route
          path="/cart"
          element={<ProtectedRoute><Cart /></ProtectedRoute>}
        />
        <Route
          path="/payment"
          element={<ProtectedRoute><Payment /></ProtectedRoute>}
        />
        {/* Bill is accessible without store connection (for security scan use-case) */}
        <Route path="/bill/:orderId" element={<Bill />} />
        <Route path="*" element={<Navigate to="/connect-store" replace />} />
      </Routes>
    </main>
    <ChatWidget />
  </>
);

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
