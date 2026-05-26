import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, CheckCircle, Clock, AlertCircle, FileText, X, Plus } from 'lucide-react';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  // Prescription Form state
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '1-0-1', duration: '5 days', notes: 'After food' }]);
  const [advice, setAdvice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctorAppointments();
  }, [user.token]);

  const fetchDoctorAppointments = async () => {
    try {
      const res = await fetch('/api/appointments', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      } else {
        setError(data.message || 'Failed to fetch doctor appointments');
      }
    } catch (err) {
      setError('Network error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/appointments/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(appointments.map(app => app._id === appId ? { ...app, status: newStatus } : app));
        if (activeAppointment && activeAppointment._id === appId) {
          setActiveAppointment({ ...activeAppointment, status: newStatus });
        }
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error updating status');
    }
  };

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '1-0-1', duration: '5 days', notes: '' }]);
  };

  const handleMedicineChange = (idx, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[idx][field] = value;
    setMedicines(newMedicines);
  };

  const handleRemoveMedicineRow = (idx) => {
    setMedicines(medicines.filter((_, mIdx) => mIdx !== idx));
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (medicines.some(m => !m.name)) {
      alert('Please fill in all medicine names');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/appointments/${activeAppointment._id}/prescription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ symptoms, diagnosis, medicines, advice }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local appointments list
        setAppointments(appointments.map(app => 
          app._id === activeAppointment._id 
            ? { ...app, status: 'completed', prescription: { symptoms, diagnosis, medicines, advice } } 
            : app
        ));
        setShowPrescriptionForm(false);
        setActiveAppointment(null);
        // Reset form
        setSymptoms('');
        setDiagnosis('');
        setMedicines([{ name: '', dosage: '1-0-1', duration: '5 days', notes: 'After food' }]);
        setAdvice('');
      } else {
        alert(data.message || 'Failed to submit prescription');
      }
    } catch (err) {
      alert('Network error submitting prescription');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculations
  const total = appointments.length;
  const pending = appointments.filter(app => app.status === 'pending').length;
  const confirmed = appointments.filter(app => app.status === 'confirmed').length;
  const completed = appointments.filter(app => app.status === 'completed').length;

  if (loading) {
    return (
      <div className="doctor-loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header-panel">
        <h1>Doctor Dashboard</h1>
        <p className="welcome-tag">Oversee patient schedules, diagnosis writeups, and medical prescriptions</p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper blue">
            <Calendar size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{total}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper orange">
            <Clock size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>

        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper info">
            <Users size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{confirmed}</h3>
            <p>Confirmed Visits</p>
          </div>
        </div>

        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{completed}</h3>
            <p>Completed Visits</p>
          </div>
        </div>
      </div>

      {/* Main Appointments Table Card */}
      <div className="glass-card table-section-card">
        <h2 className="section-card-title">Patient Consultation Schedule</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Gender/Age</th>
                <th>Appointment Date</th>
                <th>Time Slot</th>
                <th>Booking Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.patient?.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{app.patient?.email}</div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{app.patient?.gender || 'N/A'}</span>
                      {app.patient?.dob && ` (${new Date().getFullYear() - new Date(app.patient.dob).getFullYear()} yrs)`}
                    </td>
                    <td>{new Date(app.date).toLocaleDateString()}</td>
                    <td>
                      <span className="slot-badge"><Clock size={12} /> {app.timeSlot}</span>
                    </td>
                    <td>{app.reason.substring(0, 30)}{app.reason.length > 30 ? '...' : ''}</td>
                    <td>
                      <span className={`badge badge-${app.status === 'completed' ? 'success' : app.status === 'confirmed' ? 'info' : app.status === 'cancelled' ? 'danger' : 'warning'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm-link" onClick={() => {
                        setActiveAppointment(app);
                        setShowPrescriptionForm(false);
                      }}>
                        Consult
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                    No patient consultation bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONSULTATION DETAIL MODAL */}
      {activeAppointment && (
        <div className="modal-overlay">
          <div className="modal-content doctor-consultation-modal">
            <div className="modal-header">
              <h3>Patient Consultation</h3>
              <button className="close-modal-btn" onClick={() => setActiveAppointment(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body consultation-modal-body">
              {/* Patient Basic Bio Card */}
              <div className="patient-bio-summary">
                <div>
                  <span className="billing-label">Patient Name:</span>
                  <h4>{activeAppointment.patient?.name}</h4>
                  <p>{activeAppointment.patient?.email} | {activeAppointment.patient?.phone}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="billing-label">Session Slot:</span>
                  <p><strong>{new Date(activeAppointment.date).toLocaleDateString()}</strong> at {activeAppointment.timeSlot}</p>
                </div>
              </div>

              <div className="session-concern-box">
                <span className="billing-label">Concern Description:</span>
                <p>"{activeAppointment.reason}"</p>
              </div>

              {/* Status Actions */}
              {!showPrescriptionForm && activeAppointment.status !== 'completed' && (
                <div className="consultation-status-actions">
                  <span className="billing-label">Update Session Status:</span>
                  <div className="status-buttons-row">
                    {activeAppointment.status === 'pending' && (
                      <button className="btn btn-primary" onClick={() => handleUpdateStatus(activeAppointment._id, 'confirmed')}>
                        Confirm Booking
                      </button>
                    )}
                    {activeAppointment.status !== 'cancelled' && (
                      <button className="btn btn-danger" onClick={() => handleUpdateStatus(activeAppointment._id, 'cancelled')}>
                        Cancel Session
                      </button>
                    )}
                    {activeAppointment.status === 'confirmed' && (
                      <button className="btn btn-success-action" onClick={() => setShowPrescriptionForm(true)}>
                        Write Prescription
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Prescription Viewer (If Completed) */}
              {activeAppointment.status === 'completed' && activeAppointment.prescription && (
                <div className="completed-prescription-viewer">
                  <h4 className="section-title">Prescribed Consultation Record</h4>
                  <div className="prescription-meta-grid">
                    <div>
                      <span className="meta-label">Symptoms</span>
                      <p>{activeAppointment.prescription.symptoms || 'General Checkup'}</p>
                    </div>
                    <div>
                      <span className="meta-label">Diagnosis</span>
                      <p>{activeAppointment.prescription.diagnosis || 'General'}</p>
                    </div>
                  </div>
                  
                  <div className="prescription-medicines">
                    <span className="meta-label">Medicines</span>
                    <table className="medicines-simple-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Duration</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeAppointment.prescription.medicines?.map((med, idx) => (
                          <tr key={idx}>
                            <td><strong>{med.name}</strong></td>
                            <td>{med.dosage}</td>
                            <td>{med.duration}</td>
                            <td>{med.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {activeAppointment.prescription.advice && (
                    <div style={{ marginTop: '16px' }}>
                      <span className="meta-label">Doctor Advice</span>
                      <p className="advice-box">{activeAppointment.prescription.advice}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Prescription Creation Form */}
              {showPrescriptionForm && (
                <form onSubmit={handlePrescriptionSubmit} className="prescription-form-fields animate-slideUp">
                  <h4 className="section-title text-primary">Write Prescription</h4>

                  <div className="register-form-row">
                    <div className="form-group">
                      <label className="form-label">Symptoms</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Fever, cough, body pain"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Diagnosis</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Viral Infection, Bronchitis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Medicines dynamic list */}
                  <div className="prescription-medicines-section">
                    <div className="section-subtitle-row">
                      <h5>Prescribed Medicines</h5>
                      <button type="button" className="btn btn-secondary btn-sm-link" onClick={handleAddMedicineRow}>
                        Add Medicine
                      </button>
                    </div>

                    {medicines.map((med, idx) => (
                      <div className="medicine-row" key={idx}>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="Medicine Name (e.g. Paracetamol)"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="input-control"
                          style={{ width: '110px' }}
                          placeholder="Dosage (1-0-1)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="input-control"
                          style={{ width: '110px' }}
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="input-control"
                          placeholder="Notes (e.g., After food)"
                          value={med.notes}
                          onChange={(e) => handleMedicineChange(idx, 'notes', e.target.value)}
                        />
                        {medicines.length > 1 && (
                          <button type="button" className="close-modal-btn red" onClick={() => handleRemoveMedicineRow(idx)}>
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label">Consultation Advice / Recommendations</label>
                    <textarea
                      rows="2"
                      className="input-control"
                      placeholder="Take rest for 3 days, drink warm fluids..."
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="form-actions-row">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowPrescriptionForm(false)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Save Prescription & Complete visit'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveAppointment(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
