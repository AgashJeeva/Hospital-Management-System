import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Eye, Printer, CheckCircle, AlertCircle, DollarSign, X } from 'lucide-react';

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
      const res = await fetch('/api/appointments', {
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
      <div className="flex justify-center items-center h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="flex justify-between items-center mb-7.5 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Invoices & Billing</h1>
          <p className="text-text-secondary text-[16px] mt-1">Manage hospital consultation fees, receipt histories, and payment logs</p>
        </div>
        
        {(user.role === 'admin' || user.role === 'staff') && (
          <button className="py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 max-sm:w-full font-heading font-semibold" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>Create Invoice</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-danger-bg text-danger p-3.5 px-5 rounded-lg mb-6 font-medium">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table List of Invoices */}
      <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 mb-7.5">
        <div className="overflow-x-auto rounded-xl border border-border-color">
          <table className="w-full border-collapse text-left bg-bg-surface">
            <thead>
              <tr className="border-b-1.5 border-border-color">
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Invoice #</th>
                {(user.role === 'admin' || user.role === 'staff') && <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Patient</th>}
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Date Issued</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Total Amount</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Status</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr className="hover:bg-primary-light" key={inv._id}>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <strong className="text-text-primary">#{inv._id.substring(18).toUpperCase()}</strong>
                    </td>
                    {(user.role === 'admin' || user.role === 'staff') && (
                      <td className="p-4 px-5 border-b border-border-color text-sm align-middle text-text-secondary">{inv.patient?.name || 'Unknown Patient'}</td>
                    )}
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">{new Date(inv.issuedDate).toLocaleDateString()}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <strong className="text-text-primary">${inv.totalAmount.toFixed(2)}</strong>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <span className={`inline-flex items-center p-1 px-2.5 text-xs font-semibold rounded-full capitalize ${inv.paymentStatus === 'paid' ? 'bg-success-bg text-success' : inv.paymentStatus === 'partially-paid' ? 'bg-warning-bg text-warning' : 'bg-danger-bg text-danger'}`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <button className="bg-none border border-border-color text-text-secondary cursor-pointer flex items-center justify-center p-2 rounded-lg transition-all duration-300 hover:bg-bg-main hover:text-text-primary" onClick={() => setActiveInvoice(inv)} title="View Detail">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user.role === 'patient' ? 5 : 6} className="text-center p-8 text-text-muted">
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease]">
          <div className="bg-bg-surface border border-border-color rounded-xl w-[90%] max-w-[650px] shadow-lg overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex justify-between items-center p-5 px-6 border-b border-border-color print:hidden">
              <h3 className="font-heading font-bold text-text-primary text-[16px]">Invoice Detail</h3>
              <button className="bg-none border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-bg-main hover:text-text-primary" onClick={() => setActiveInvoice(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-7.5 sm:p-10 bg-white text-slate-700 rounded-lg" id="printable-area">
              <div className="flex justify-between border-b-2 border-slate-200 pb-5 mb-6">
                <div>
                  <h2 className="text-primary font-extrabold tracking-tight text-xl">APEXCARE</h2>
                  <p className="text-[13px] text-slate-500 font-medium">Hometown Clinical Center</p>
                </div>
                <div className="text-right text-[13px] text-slate-500">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">INVOICE</h3>
                  <p>ID: #{activeInvoice._id.toUpperCase()}</p>
                  <p>Issued: {new Date(activeInvoice.issuedDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-between mb-7.5 text-sm">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-[0.5px]">Billed To:</span>
                  <h4 className="text-slate-900 font-semibold text-[15px] mb-0.5">{activeInvoice.patient?.name}</h4>
                  <p className="text-slate-600">{activeInvoice.patient?.email}</p>
                  <p className="text-slate-600">{activeInvoice.patient?.phone || 'No phone provided'}</p>
                </div>
                {activeInvoice.paidDate && (
                  <div className="text-right">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-[0.5px]">Payment Date:</span>
                    <p className="font-semibold text-slate-900 mb-1">{new Date(activeInvoice.paidDate).toLocaleString()}</p>
                    <span className="inline-flex items-center p-1 px-2.5 text-xs font-semibold rounded-full capitalize bg-success-bg text-success">{activeInvoice.paymentMethod}</span>
                  </div>
                )}
              </div>

              <table className="w-full border-collapse mb-7.5">
                <thead>
                  <tr>
                    <th className="border-b-2 border-slate-300 py-2.5 text-slate-600 text-xs font-bold uppercase text-left">Service Description</th>
                    <th className="border-b-2 border-slate-300 py-2.5 text-slate-600 text-xs font-bold uppercase text-right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoice.services.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border-b border-slate-200 py-3.5 text-slate-900 text-sm">{item.name}</td>
                      <td className="border-b border-slate-200 py-3.5 text-slate-900 text-sm text-right">${item.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ml-auto w-full max-w-[320px] flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    ${activeInvoice.services.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({activeInvoice.tax}%):</span>
                  <span className="font-semibold text-slate-900">
                    +${(activeInvoice.services.reduce((acc, curr) => acc + curr.cost, 0) * (activeInvoice.tax / 100)).toFixed(2)}
                  </span>
                </div>
                {activeInvoice.discount > 0 && (
                  <div className="flex justify-between text-danger font-medium">
                    <span>Discount:</span>
                    <span>-${activeInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t-1.5 border-slate-300 pt-2 text-base font-bold text-slate-900">
                  <span>Total Amount:</span>
                  <span>${activeInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-5 px-6 border-t border-border-color print:hidden">
              <div className="flex">
                {(user.role === 'admin' || user.role === 'staff') && activeInvoice.paymentStatus !== 'paid' && (
                  <div className="relative group">
                    <button className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-bg-surface border border-border-color text-text-secondary transition-all duration-300 hover:bg-bg-main hover:border-text-muted">Receive Payment</button>
                    <div className="hidden group-hover:block absolute bottom-full left-0 bg-bg-surface border border-border-color rounded-lg shadow-lg min-w-[160px] z-10 mb-1 overflow-hidden">
                      <button className="w-full p-2.5 px-4 bg-none border-none text-left text-xs font-medium text-text-secondary cursor-pointer transition-all duration-300 hover:bg-primary-light hover:text-primary" onClick={() => handleUpdatePaymentStatus(activeInvoice._id, 'paid', 'cash')}>Paid in Cash</button>
                      <button className="w-full p-2.5 px-4 bg-none border-none text-left text-xs font-medium text-text-secondary cursor-pointer transition-all duration-300 hover:bg-primary-light hover:text-primary" onClick={() => handleUpdatePaymentStatus(activeInvoice._id, 'paid', 'card')}>Paid by Card</button>
                      <button className="w-full p-2.5 px-4 bg-none border-none text-left text-xs font-medium text-text-secondary cursor-pointer transition-all duration-300 hover:bg-primary-light hover:text-primary" onClick={() => handleUpdatePaymentStatus(activeInvoice._id, 'paid', 'upi')}>Paid by UPI</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-bg-surface border border-border-color text-text-secondary transition-all duration-300 hover:bg-bg-main hover:border-text-muted flex items-center gap-2 cursor-pointer" onClick={triggerPrintInvoice}>
                  <Printer size={16} />
                  <span>Print Receipt</span>
                </button>
                <button className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-2" onClick={() => setActiveInvoice(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease]">
          <div className="bg-bg-surface border border-border-color rounded-xl w-[90%] max-w-[600px] shadow-lg overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex justify-between items-center p-5 px-6 border-b border-border-color">
              <h3 className="font-heading font-bold text-text-primary text-[16px]">Create Hospital Invoice</h3>
              <button className="bg-none border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-bg-main hover:text-text-primary" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoiceSubmit} className="p-6">
              {/* Patient Dropdown */}
              <div className="flex flex-col mb-4.5">
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Billing Patient</label>
                <select
                  className="w-full py-2.5 px-4 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] cursor-pointer"
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
              <div className="border-1.5 border-dashed border-border-color p-5 rounded-xl mt-5 bg-bg-main">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold uppercase text-text-primary tracking-[0.5px]">Billing Service Items</h4>
                  <button type="button" className="text-xs font-semibold py-1.5 px-3 bg-bg-surface border border-border-color text-text-secondary rounded-md cursor-pointer hover:border-primary hover:text-primary transition-all duration-300" onClick={handleAddServiceRow}>
                    Add Item
                  </button>
                </div>

                {services.map((item, idx) => (
                  <div className="flex gap-3 mb-2.5 items-center" key={idx}>
                    <input
                      type="text"
                      className="w-full py-2 px-4 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                      placeholder="Service name (e.g. Blood Test, X-Ray)"
                      value={item.name}
                      onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                      required
                    />
                    <div className="relative flex items-center w-[130px] shrink-0">
                      <DollarSign size={14} className="absolute left-3 text-text-muted" />
                      <input
                        type="number"
                        className="w-full py-2 px-3 pl-7 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                        placeholder="Cost"
                        min="1"
                        value={item.cost || ''}
                        onChange={(e) => handleServiceChange(idx, 'cost', e.target.value)}
                        required
                      />
                    </div>
                    {services.length > 1 && (
                      <button type="button" className="bg-none border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-danger-bg hover:text-danger" onClick={() => handleRemoveServiceRow(idx)}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tax & Discount */}
              <div className="grid grid-cols-2 gap-5 mt-5">
                <div className="flex flex-col mb-4.5">
                  <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="w-full py-2.5 px-4 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                    min="0"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                  />
                </div>
                <div className="flex flex-col mb-4.5">
                  <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Discount Amount ($)</label>
                  <input
                    type="number"
                    className="w-full py-2.5 px-4 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-5 px-6 border-t border-border-color">
                <button type="button" className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-bg-surface border border-border-color text-text-secondary transition-all duration-300 hover:bg-bg-main hover:border-text-muted" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer" disabled={submitting}>
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
