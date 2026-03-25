import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, checkout } from '../services/api';
import { useApp } from '../context/AppContext';

const GST_RATE = 0.18;

const Payment = () => {
  const { userId, storeId, setCartCount } = useApp();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await getCart(userId);
      const items =
        response.data?.items ||
        response.data?.data ||
        response.data ||
        [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch {
      setError('Failed to load order summary. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1),
    0
  );
  const tax = subtotal * GST_RATE;
  const total = subtotal + tax;

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      const response = await checkout({ userId, storeId });
      const data = response.data?.data || response.data;
      const orderId = data?.orderId || data?.id;
      if (!orderId) throw new Error('No order ID returned from server');
      setCartCount(0);
      navigate(`/bill/${orderId}`);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Payment processing failed. Please try again.');
      }
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-skipq" role="status" />
        <p className="mt-3 text-muted">Loading order summary…</p>
      </div>
    );
  }

  return (
    <div className="payment-page py-4">
      <div className="container">

        {/* Header */}
        <div className="d-flex align-items-center mb-4 gap-3">
          <button className="btn btn-link p-0 text-skipq" onClick={() => navigate('/cart')}>
            <i className="bi bi-arrow-left me-1" />Back to Cart
          </button>
          <h4 className="fw-bold mb-0">
            <i className="bi bi-credit-card text-skipq me-2" />Payment
          </h4>
        </div>

        <div className="row justify-content-center g-4">
          <div className="col-12 col-md-7 col-lg-5">

            {/* Order Summary Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-transparent border-0 pt-4 pb-0">
                <h5 className="fw-bold">Order Summary</h5>
              </div>
              <div className="card-body">
                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId || item.id}
                    className="d-flex justify-content-between align-items-center py-2 border-bottom"
                  >
                    <div>
                      <span className="fw-medium">{item.name}</span>
                      <small className="text-muted d-block">
                        {item.quantity || 1} × ₹{Number(item.price).toFixed(2)}
                      </small>
                    </div>
                    <span className="fw-semibold">
                      ₹{(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="mt-3">
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mb-2">
                    <span>GST (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span className="text-skipq">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Now Card */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 text-center">
                <div className="payment-icon-large mb-3">💳</div>
                <h5 className="fw-bold mb-1">Confirm &amp; Pay</h5>
                <p className="text-muted mb-4">
                  You will be charged{' '}
                  <strong className="text-skipq">₹{total.toFixed(2)}</strong>
                </p>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 text-start">
                    <i className="bi bi-exclamation-triangle-fill" />
                    {error}
                  </div>
                )}

                <button
                  className="btn btn-skipq btn-lg w-100 fw-semibold"
                  onClick={handlePay}
                  disabled={paying || cartItems.length === 0}
                >
                  {paying ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Processing…</>
                  ) : (
                    <><i className="bi bi-lock-fill me-2" />Pay ₹{total.toFixed(2)} Now</>
                  )}
                </button>

                <p className="text-muted small mt-3 mb-0">
                  <i className="bi bi-shield-lock me-1 text-success" />
                  Payments are processed securely
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
