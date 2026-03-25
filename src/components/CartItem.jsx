import React, { useState } from 'react';
import { removeFromCart } from '../services/api';
import { useApp } from '../context/AppContext';

const CartItem = ({ item, onRemoved }) => {
  const { setCartCount } = useApp();
  const [removing, setRemoving] = useState(false);

  const itemId = item.cartItemId || item.id;
  const qty = item.quantity || 1;
  const lineTotal = (Number(item.price) * qty).toFixed(2);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeFromCart(itemId);
      setCartCount((prev) => Math.max(0, prev - qty));
      onRemoved(itemId);
    } catch (err) {
      console.error('Failed to remove item', err);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="card cart-item-card border-0 shadow-sm mb-3">
      <div className="card-body py-3">
        <div className="row align-items-center g-3">
          {/* Image */}
          <div className="col-3 col-md-2">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="cart-item-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="cart-item-img-placeholder">
                <i className="bi bi-box-seam" />
              </div>
            )}
          </div>

          {/* Name & price */}
          <div className="col-9 col-md-5">
            <p className="mb-0 fw-semibold">{item.name}</p>
            <small className="text-muted">
              ₹{Number(item.price).toFixed(2)} × {qty}
            </small>
          </div>

          {/* Qty */}
          <div className="col-4 col-md-2 text-center">
            <span className="qty-badge">Qty {qty}</span>
          </div>

          {/* Line total */}
          <div className="col-5 col-md-2 text-end">
            <span className="fw-bold text-skipq">₹{lineTotal}</span>
          </div>

          {/* Remove */}
          <div className="col-3 col-md-1 text-end">
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleRemove}
              disabled={removing}
              title="Remove item"
              aria-label="Remove item"
            >
              {removing ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                <i className="bi bi-trash" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
