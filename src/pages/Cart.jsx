import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../services/api';
import CartItem from '../components/CartItem';
import { useApp } from '../context/AppContext';

const GST_RATE = 0.18;

const Cart = () => {
  const { userId, storeId, setCartCount } = useApp();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCart(userId);
      const items =
        response.data?.items ||
        response.data?.data ||
        response.data ||
        [];
      const list = Array.isArray(items) ? items : [];
      setCartItems(list);
      setCartCount(list.reduce((sum, item) => sum + (item.quantity || 1), 0));
    } catch {
      setError('Failed to load your cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemRemoved = (removedId) => {
    setCartItems((prev) => prev.filter((item) => (item.cartItemId || item.id) !== removedId));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1),
    0
  );
  const tax = subtotal * GST_RATE;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-skipq" role="status" />
        <p className="mt-3 text-muted">Loading your cart…</p>
      </div>
    );
  }

  return (
    <div className="cart-page py-4">
      <div className="container">

        {/* Header */}
        <div className="d-flex align-items-center mb-4 gap-3">
          <button
            className="btn btn-link p-0 text-skipq"
            onClick={() => storeId ? navigate(`/store/${storeId}`) : navigate(-1)}
          >
            <i className="bi bi-arrow-left me-1" />Back
          </button>
          <h4 className="fw-bold mb-0">
            <i className="bi bi-cart3 text-skipq me-2" />Your Cart
          </h4>
        </div>

        {error && (
          <div className="alert alert-danger d-flex gap-2">
            <i className="bi bi-exclamation-triangle-fill" />
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <div className="empty-cart-emoji mb-3">🛒</div>
            <h5 className="text-muted fw-semibold">Your cart is empty</h5>
            <p className="text-muted mb-4">Head back to the store to add some products.</p>
            {storeId && (
              <button className="btn btn-skipq" onClick={() => navigate(`/store/${storeId}`)}>
                <i className="bi bi-arrow-left me-2" />Continue Shopping
              </button>
            )}
          </div>
        ) : (
          <div className="row g-4">

            {/* Items */}
            <div className="col-12 col-lg-8">
              <p className="text-muted small">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</p>
              {cartItems.map((item) => (
                <CartItem
                  key={item.cartItemId || item.id}
                  item={item}
                  onRemoved={handleItemRemoved}
                />
              ))}
            </div>

            {/* Summary */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm order-summary-card sticky-top" style={{ top: '76px' }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Order Summary</h5>

                  <div className="d-flex justify-content-between mb-2 text-muted">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-muted">
                    <span>GST (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                    <span>Total</span>
                    <span className="text-skipq">₹{total.toFixed(2)}</span>
                  </div>

                  <button
                    className="btn btn-skipq btn-lg w-100 fw-semibold"
                    onClick={() => navigate('/payment')}
                  >
                    <i className="bi bi-credit-card me-2" />Proceed to Checkout
                  </button>

                  {storeId && (
                    <button
                      className="btn btn-outline-secondary w-100 mt-2"
                      onClick={() => navigate(`/store/${storeId}`)}
                    >
                      <i className="bi bi-plus-circle me-2" />Add More Items
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
