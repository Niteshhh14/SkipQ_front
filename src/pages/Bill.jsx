import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getBill } from '../services/api';

const Bill = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchBill = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getBill(orderId);
      setBill(response.data?.bill || response.data?.data || response.data);
    } catch {
      setError('Failed to load your bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-skipq" role="status" />
        <p className="mt-3 text-muted">Generating your digital bill…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: 480 }}>{error}</div>
        <button className="btn btn-skipq" onClick={fetchBill}>Retry</button>
      </div>
    );
  }

  const items = bill?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1),
    0
  );
  const tax = bill?.tax != null ? Number(bill.tax) : subtotal * 0.18;
  const total = bill?.total != null ? Number(bill.total) : subtotal + tax;
  const billDate = bill?.createdAt ? new Date(bill.createdAt) : new Date();

  return (
    <div className="bill-page py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">

            <div className="card border-0 shadow-lg bill-card" id="printable-bill">

              {/* Branded header */}
              <div className="bill-header text-center p-4">
                <div className="bill-bolt mb-1">⚡</div>
                <h3 className="text-white fw-bold mb-0">SkipQ</h3>
                <small className="text-white-50">Digital Receipt</small>
              </div>

              <div className="card-body p-4">

                {/* Meta */}
                <div className="row g-2 mb-4 bill-meta">
                  <div className="col-6">
                    <small className="text-muted d-block">Order ID</small>
                    <span className="fw-semibold text-break small">{orderId}</span>
                  </div>
                  <div className="col-6 text-end">
                    <small className="text-muted d-block">Date</small>
                    <span className="fw-semibold small">{billDate.toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Time</small>
                    <span className="fw-semibold small">
                      {billDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {bill?.storeName && (
                    <div className="col-6 text-end">
                      <small className="text-muted d-block">Store</small>
                      <span className="fw-semibold small">{bill.storeName}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <h6 className="fw-bold border-bottom pb-2 mb-3">
                  <i className="bi bi-bag-check me-2 text-skipq" />Items Purchased
                </h6>

                {items.length === 0 && (
                  <p className="text-muted small">No item details available.</p>
                )}

                {items.map((item, idx) => (
                  <div key={item.id || idx} className="d-flex align-items-center mb-3 bill-line-item">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="bill-item-img me-3"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <span className="fw-medium d-block">{item.name}</span>
                      <small className="text-muted">
                        {item.quantity || 1} × ₹{Number(item.price).toFixed(2)}
                      </small>
                    </div>
                    <span className="fw-semibold ms-2">
                      ₹{(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}

                {/* Totals */}
                <div className="mt-3 pt-3 border-top">
                  <div className="d-flex justify-content-between text-muted mb-1 small">
                    <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mb-2 small">
                    <span>GST (18%)</span><span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold fs-5 bill-total-row rounded p-2">
                    <span>Total Paid</span>
                    <span className="text-skipq">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center mt-4">
                  <div className="qr-wrapper d-inline-block p-3 rounded-3 border shadow-sm bg-white">
                    <QRCodeSVG
                      value={orderId}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-muted small mt-2 mb-0">
                    <i className="bi bi-qr-code me-1" />
                    Show this QR code to security at the store exit
                  </p>
                </div>

                {/* Success banner */}
                <div className="alert alert-success border-0 text-center mt-4 mb-0 py-2">
                  <i className="bi bi-patch-check-fill me-2" />
                  <strong>Payment Successful!</strong> Thank you for shopping with SkipQ.
                </div>
              </div>

              {/* Actions – hidden on print */}
              <div className="card-footer bg-transparent border-0 p-4 pt-2 no-print">
                <div className="d-flex gap-2">
                  <button className="btn btn-skipq flex-grow-1" onClick={handlePrint}>
                    <i className="bi bi-printer me-2" />Print Bill
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/connect-store')}
                    title="Start a new session"
                  >
                    <i className="bi bi-house me-1" />Done
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Bill;
