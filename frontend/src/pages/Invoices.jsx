import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Eye, Printer, CheckCircle, AlertCircle, DollarSign, X } from 'lucide-react';
import './Invoices.css';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]); // For creating invoices
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for creating invoice
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [services, setServices] = useState([{ name: 'Consultation Fee', cost: 50 }]);
  const [tax, setTax] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvoices();
    if (user.role === 'admin' || user.role === 'staff') {
      fetchPatients();
    }
  }, [user.token]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
      } else {
        setError(data.message || 'Failed to fetch billing invoices');
      }
    } catch (err) {
      setError('Network connection error fetching invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      // Fetch users with role patient to populate dropdown
      const res = await fetch('/api/appointments', { // We can get patient list from appointments or user collection. We'll simulate fetching patient accounts by registering users. For now let's query backend.
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (data.success) {
        // De-duplicate patients from appointments
        const uniquePatients = [];
        const seen = new Set();
        data.data.forEach(app => {
          if (app.patient && !seen.has(app.patient._id)) {
            seen.add(app.patient._id);
            uniquePatients.push(app.patient);
          }
        });
        setPatients(uniquePatients);
      }
    } catch (err) {
      console.error('Error fetching patients for billing', err);
    }
  };

  const handleUpdatePaymentStatus = async (invoiceId, status, method) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ paymentStatus: status, paymentMethod: method }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local list
        setInvoices(invoices.map(inv => inv._id === invoiceId ? { ...inv, paymentStatus: status, paymentMethod: method, paidDate: status === 'paid' ? new Date() : null } : inv));
        // Update modal preview if active
        if (activeInvoice && activeInvoice._id === invoiceId) {
          setActiveInvoice({ ...activeInvoice, paymentStatus: status, paymentMethod: method, paidDate: status === 'paid' ? new Date() : null });
        }
      } else {
        alert(data.message || 'Failed to update payment details');
      }
    } catch (err) {
      alert('Network error updating status');
    }
  };

  const handleAddServiceRow = () => {
    setServices([...services, { name: '', cost: 0 }]);
  };

  const handleServiceChange = (idx, field, value) => {
    const newServices = [...services];
    if (field === 'cost') {
      newServices[idx][field] = Number(value);
    } else {
      newServices[idx][field] = value;
    }
    setServices(newServices);
  };

  const handleRemoveServiceRow = (idx) => {
    setServices(services.filter((_, sIdx) => sIdx !== idx));
  };

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPatientId || services.some(s => !s.name || s.cost <= 0)) {
      setError('Please select a patient and fill in all billing items');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          patient: selectedPatientId,
          services,
          tax: Number(tax),
          discount: Number(discount),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setSelectedPatientId('');
        setServices([{ name: 'Consultation Fee', cost: 50 }]);
        setTax(5);
        setDiscount(0);
        fetchInvoices();
      } else {
        setError(data.message || 'Failed to create invoice');
      }
    } catch (err) {
      setError('Network error compiling invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerPrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="invoices-loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="invoices-page">
      <div className="invoices-header-row">
        <div>
          <h1>Invoices & Billing</h1>
          <p className="welcome-tag">Manage hospital consultation fees, receipt histories, and payment logs</p>
        </div>
        
        {(user.role === 'admin' || user.role === 'staff') && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>Create Invoice</span>
          </button>
        )}
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table List of Invoices */}
      <div className="glass-card table-section-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                {(user.role === 'admin' || user.role === 'staff') && <th>Patient</th>}
                <th>Date Issued</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td>
                      <strong>#{inv._id.substring(18).toUpperCase()}</strong>
                    </td>
                    {(user.role === 'admin' || user.role === 'staff') && (
                      <td>{inv.patient?.name || 'Unknown Patient'}</td>
                    )}
                    <td>{new Date(inv.issuedDate).toLocaleDateString()}</td>
                    <td>
                      <strong>${inv.totalAmount.toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`badge badge-${inv.paymentStatus === 'paid' ? 'success' : inv.paymentStatus === 'partially-paid' ? 'warning' : 'danger'}`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-icon-only" onClick={() => setActiveInvoice(inv)} title="View Detail">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user.role === 'patient' ? 5 : 6} style={{ textAlign: 'center', padding: '30px' }}>
                    No invoice transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW INVOICE MODAL */}
      {activeInvoice && (
        <div className="modal-overlay">
          <div className="modal-content invoice-view-modal">
            <div className="modal-header printable-exclude">
              <h3>Invoice Detail</h3>
              <button className="close-modal-btn" onClick={() => setActiveInvoice(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="printable-invoice-content" id="printable-area">
              <div className="invoice-head-meta">
                <div>
                  <h2 className="hospital-title">APEXCARE</h2>
                  <p className="hospital-meta">Hometown Clinical Center</p>
                </div>
                <div className="invoice-meta-right">
                  <h3>INVOICE</h3>
                  <p>ID: #{activeInvoice._id.toUpperCase()}</p>
                  <p>Issued: {new Date(activeInvoice.issuedDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="invoice-billing-details">
                <div>
                  <span className="billing-label">Billed To:</span>
                  <h4>{activeInvoice.patient?.name}</h4>
                  <p>{activeInvoice.patient?.email}</p>
                  <p>{activeInvoice.patient?.phone || 'No phone provided'}</p>
                </div>
                {activeInvoice.paidDate && (
                  <div className="payment-receipt-badge">
                    <span className="billing-label">Payment Date:</span>
                    <p>{new Date(activeInvoice.paidDate).toLocaleString()}</p>
                    <span className="badge badge-success">{activeInvoice.paymentMethod}</span>
                  </div>
                )}
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Service Description</th>
                    <th style={{ textAlign: 'right' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoice.services.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'right' }}>${item.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-summary-box">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>
                    ${activeInvoice.services.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Tax ({activeInvoice.tax}%):</span>
                  <span>
                    +${(activeInvoice.services.reduce((acc, curr) => acc + curr.cost, 0) * (activeInvoice.tax / 100)).toFixed(2)}
                  </span>
                </div>
                {activeInvoice.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount:</span>
                    <span>-${activeInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>${activeInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer printable-exclude">
              <div className="footer-left-controls">
                {(user.role === 'admin' || user.role === 'staff') && activeInvoice.paymentStatus !== 'paid' && (
                  <div className="quick-pay-dropdown">
                    <button className="btn btn-secondary dropdown-trigger">Receive Payment</button>
                    <div className="dropdown-options">
                      <button onClick={() => handleUpdatePaymentStatus(activeInvoice._id, 'paid', 'cash')}>Paid in Cash</button>
                      <button onClick={() => handleUpdatePaymentStatus(activeInvoice._id, 'paid', 'card')}>Paid by Card</button>
                      <button onClick={() => handleUpdatePaymentStatus(activeInvoice._id, 'paid', 'upi')}>Paid by UPI</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="footer-right-controls">
                <button className="btn btn-secondary" onClick={triggerPrintInvoice}>
                  <Printer size={16} />
                  <span>Print Receipt</span>
                </button>
                <button className="btn btn-primary" onClick={() => setActiveInvoice(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content invoice-create-modal">
            <div className="modal-header">
              <h3>Create Hospital Invoice</h3>
              <button className="close-modal-btn" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoiceSubmit} className="invoice-create-form">
              {/* Patient Dropdown */}
              <div className="form-group">
                <label className="form-label">Billing Patient</label>
                <select
                  className="register-select-field"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  <option value="">Select Patient Profile</option>
                  {patients.map((pat) => (
                    <option value={pat._id} key={pat._id}>{pat.name} ({pat.email})</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Service Items */}
              <div className="services-section">
                <div className="section-subtitle-row">
                  <h4>Billing Service Items</h4>
                  <button type="button" className="btn btn-secondary btn-sm-link" onClick={handleAddServiceRow}>
                    Add Item
                  </button>
                </div>

                {services.map((item, idx) => (
                  <div className="service-item-row" key={idx}>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Service name (e.g. Blood Test, X-Ray)"
                      value={item.name}
                      onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                      required
                    />
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '130px' }}>
                      <DollarSign size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                      <input
                        type="number"
                        className="input-control"
                        style={{ paddingLeft: '24px' }}
                        placeholder="Cost"
                        min="1"
                        value={item.cost || ''}
                        onChange={(e) => handleServiceChange(idx, 'cost', e.target.value)}
                        required
                      />
                    </div>
                    {services.length > 1 && (
                      <button type="button" className="close-modal-btn red" onClick={() => handleRemoveServiceRow(idx)}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tax & Discount */}
              <div className="register-form-row" style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="input-control"
                    min="0"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Amount ($)</label>
                  <input
                    type="number"
                    className="input-control"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Generating Invoice...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
