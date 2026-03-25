import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts, addToCart } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';

const Inventory = () => {
  const { storeId } = useParams();
  const { userId, storeId: ctxStoreId, storeName, cartCount, setCartCount, connectToStore } = useApp();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanMsg, setScanMsg] = useState({ text: '', type: '' });
  const barcodeRef = useRef(null);

  // Sync storeId into context if navigated directly via URL
  useEffect(() => {
    if (storeId && storeId !== ctxStoreId) {
      connectToStore(storeId, '');
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    setFiltered(
      q
        ? products.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.barcode && p.barcode.includes(q)) ||
              (p.description && p.description.toLowerCase().includes(q))
          )
        : products
    );
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProducts(storeId);
      const list =
        response.data?.products ||
        response.data?.data ||
        response.data ||
        [];
      setProducts(Array.isArray(list) ? list : []);
      setFiltered(Array.isArray(list) ? list : []);
    } catch {
      setError('Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const showScanMsg = (text, type) => {
    setScanMsg({ text, type });
    setTimeout(() => setScanMsg({ text: '', type: '' }), 3000);
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const barcode = barcodeInput.trim();
    if (!barcode) return;

    const product = products.find(
      (p) => p.barcode === barcode || String(p.id) === barcode
    );

    if (!product) {
      showScanMsg(`No product found for: "${barcode}"`, 'danger');
      setBarcodeInput('');
      barcodeRef.current?.focus();
      return;
    }

    try {
      await addToCart(userId, product.id);
      setCartCount((prev) => prev + 1);
      showScanMsg(`✓ "${product.name}" added to cart!`, 'success');
    } catch {
      showScanMsg('Failed to add item. Please try again.', 'danger');
    }
    setBarcodeInput('');
    barcodeRef.current?.focus();
  };

  return (
    <div className="inventory-page py-4">
      <div className="container">

        {/* Page header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
          <div>
            <h4 className="fw-bold mb-0">
              <i className="bi bi-shop text-skipq me-2" />
              {storeName || `Store #${storeId}`}
            </h4>
            <small className="text-muted">Browse products and add them to your cart</small>
          </div>
          <button className="btn btn-skipq position-relative" onClick={() => navigate('/cart')}>
            <i className="bi bi-cart3 me-2" />View Cart
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Barcode scanner strip */}
        <div className="card border-0 shadow-sm scan-card mb-4">
          <div className="card-body py-3">
            <h6 className="fw-semibold mb-2">
              <i className="bi bi-upc-scan me-2 text-skipq" />Scan Barcode / Enter Product ID
            </h6>
            <form onSubmit={handleBarcodeSubmit} className="d-flex gap-2">
              <input
                ref={barcodeRef}
                type="text"
                className="form-control"
                placeholder="Scan barcode or type product ID and press Enter…"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
              />
              <button type="submit" className="btn btn-skipq text-nowrap">
                <i className="bi bi-plus-circle me-1" />Add
              </button>
            </form>
            {scanMsg.text && (
              <div className={`alert alert-${scanMsg.type} py-2 mb-0 mt-2 small`}>
                {scanMsg.text}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="input-group mb-4 shadow-sm">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search products by name or barcode…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="btn btn-outline-secondary" onClick={() => setSearchQuery('')}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        {/* States */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-skipq" role="status" />
            <p className="mt-3 text-muted">Loading products…</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger d-flex align-items-center gap-3">
            <i className="bi bi-exclamation-triangle-fill fs-5" />
            <span className="flex-grow-1">{error}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={fetchProducts}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1 d-block mb-3" />
            {searchQuery ? `No products match "${searchQuery}".` : 'No products available in this store.'}
          </div>
        ) : (
          <>
            <p className="text-muted small mb-3">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} available
            </p>
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
              {filtered.map((product) => (
                <div className="col" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;
