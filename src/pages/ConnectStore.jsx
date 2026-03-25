import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectStore } from '../services/api';
import { useApp } from '../context/AppContext';

const ConnectStore = () => {
  const [storeCode, setStoreCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { connectToStore } = useApp();
  const navigate = useNavigate();

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!storeCode.trim()) {
      setError('Please enter a store code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await connectStore(storeCode.trim().toUpperCase());
      const data = response.data?.data || response.data;
      const storeId = data?.storeId || data?.id;
      const storeName = data?.storeName || data?.name || '';
      if (!storeId) throw new Error('Invalid server response');
      connectToStore(String(storeId), storeName);
      navigate(`/store/${storeId}`);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Store not found. Please check the store code and try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Could not connect to the store. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connect-page d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-9 col-md-6 col-lg-4">

            {/* Hero Brand */}
            <div className="text-center mb-4">
              <div className="connect-bolt mb-2">⚡</div>
              <h1 className="fw-bold brand-hero-text mb-1">SkipQ</h1>
              <p className="text-muted">Next-Generation Retail Billing Platform</p>
            </div>

            {/* Card */}
            <div className="card border-0 shadow-lg connect-card">
              <div className="card-body p-4 p-md-5">
                <h5 className="fw-bold mb-1 text-center">Enter Store Code</h5>
                <p className="text-muted small text-center mb-4">
                  Find the code displayed at the store entrance.
                </p>

                <form onSubmit={handleConnect} noValidate>
                  <div className="mb-3">
                    <input
                      type="text"
                      className={`form-control form-control-lg text-center fw-semibold text-uppercase letter-spacing ${error ? 'is-invalid' : ''}`}
                      placeholder="e.g. STORE001"
                      value={storeCode}
                      onChange={(e) => { setStoreCode(e.target.value); setError(''); }}
                      autoFocus
                      maxLength={20}
                    />
                    {error && <div className="invalid-feedback text-center">{error}</div>}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-skipq btn-lg w-100 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Connecting…</>
                    ) : (
                      <><i className="bi bi-plug-fill me-2" />Connect to Store</>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-1 text-success" />
                    Secure connection · No account needed
                  </small>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="row g-2 mt-4 text-center">
              {[
                { icon: 'bi-plug', label: 'Connect' },
                { icon: 'bi-upc-scan', label: 'Scan Items' },
                { icon: 'bi-credit-card', label: 'Pay' },
                { icon: 'bi-qr-code', label: 'Exit' },
              ].map((step, i) => (
                <div className="col-3" key={i}>
                  <div className="step-hint">
                    <i className={`bi ${step.icon} fs-5`} />
                    <div className="small mt-1">{step.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectStore;
