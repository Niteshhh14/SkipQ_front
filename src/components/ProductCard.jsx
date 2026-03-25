import React, { useState } from 'react';
import { addToCart } from '../services/api';
import { useApp } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const { userId, setCartCount } = useApp();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  const outOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = async () => {
    setAdding(true);
    setError('');
    try {
      await addToCart(userId, product.id);
      setCartCount((prev) => prev + 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      setError('Could not add item');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card product-card h-100 border-0 shadow-sm">
      <div className="product-img-wrapper">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            className="product-img"
            alt={product.name}
            onError={(e) => { e.target.src = ''; e.target.onerror = null; e.target.parentNode.innerHTML = '<div class="product-img-placeholder"><i class="bi bi-box-seam"></i></div>'; }}
          />
        ) : (
          <div className="product-img-placeholder">
            <i className="bi bi-box-seam" />
          </div>
        )}
        {product.stock !== undefined && (
          <span className={`stock-badge ${outOfStock ? 'out' : 'in'}`}>
            {outOfStock ? 'Out of Stock' : `${product.stock} left`}
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column px-3 pb-3 pt-2">
        <h6 className="product-name mb-1">{product.name}</h6>
        {product.description && (
          <p className="text-muted small mb-1 product-desc">{product.description}</p>
        )}
        {product.barcode && (
          <small className="text-muted mb-2">
            <i className="bi bi-upc me-1" />{product.barcode}
          </small>
        )}
        <div className="mt-auto pt-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="product-price">₹{Number(product.price).toFixed(2)}</span>
          </div>
          {error && <div className="alert alert-danger py-1 px-2 small mb-2">{error}</div>}
          <button
            className={`btn w-100 btn-sm fw-semibold ${added ? 'btn-success' : 'btn-skipq'}`}
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
          >
            {adding ? (
              <span className="spinner-border spinner-border-sm" />
            ) : added ? (
              <><i className="bi bi-check-circle me-1" />Added!</>
            ) : (
              <><i className="bi bi-cart-plus me-1" />Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
