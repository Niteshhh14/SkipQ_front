import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { storeId, storeName, cartCount, disconnectStore } = useApp();
  const navigate = useNavigate();

  const handleDisconnect = () => {
    disconnectStore();
    navigate('/connect-store');
  };

  return (
    <nav className="navbar navbar-expand-lg skipq-navbar shadow-sm sticky-top">
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to={storeId ? `/store/${storeId}` : '/connect-store'}
        >
          <span className="brand-bolt">⚡</span>
          <span className="brand-text">SkipQ</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {storeId ? (
              <>
                <li className="nav-item">
                  <span className="store-pill">
                    <i className="bi bi-shop me-1" />
                    {storeName || `Store #${storeId}`}
                  </span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to={`/store/${storeId}`}>
                    <i className="bi bi-grid me-1" />Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white position-relative" to="/cart">
                    <i className="bi bi-cart3 me-1" />Cart
                    {cartCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm ms-2" onClick={handleDisconnect}>
                    <i className="bi bi-box-arrow-right me-1" />Disconnect
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-light btn-sm fw-semibold" to="/connect-store">
                  <i className="bi bi-plug-fill me-1" />Connect Store
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
