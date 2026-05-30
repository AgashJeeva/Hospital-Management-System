import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

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
    } catch {
      setError('Network error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, [user.token]);

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
    } catch {
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
    } catch {
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
      <div className="flex justify-center items-center h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-7.5">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Doctor Dashboard</h1>
        <p className="text-text-secondary text-[16px] mt-1">Oversee patient schedules, diagnosis writeups, and medical prescriptions</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-danger-bg text-danger p-3.5 px-5 rounded-lg mb-6 font-medium">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-7.5">
        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-primary-light text-primary">
            <Calendar size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{total}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Total Bookings</p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-warning-bg text-warning">
            <Clock size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{pending}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Pending Review</p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-info-bg text-info">
            <Users size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{confirmed}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Confirmed Visits</p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-success-bg text-success">
            <CheckCircle size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{completed}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Completed Visits</p>
          </div>
        </div>
      </div>

      {/* Main Appointments Table Card */}
      <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300 mb-6">
        <h2 className="text-[18px] font-bold text-text-primary mb-5 border-b border-border-color pb-3">Patient Consultation Schedule</h2>
        <div className="overflow-x-auto rounded-xl border border-border-color">
          <table className="w-full border-collapse text-left bg-bg-surface">
            <thead>
              <tr className="border-b-1.5 border-border-color">
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Patient Name</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Gender/Age</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Appointment Date</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Time Slot</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Booking Reason</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Status</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((app) => (
                  <tr className="hover:bg-primary-light" key={app._id}>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <strong className="text-text-primary">{app.patient?.name}</strong>
                      <div className="text-xs text-text-muted mt-0.5">{app.patient?.email}</div>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle capitalize">
                      <span>{app.patient?.gender || 'N/A'}</span>
                      {app.patient?.dob && ` (${new Date().getFullYear() - new Date(app.patient.dob).getFullYear()} yrs)`}
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">{new Date(app.date).toLocaleDateString()}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <span className="inline-flex items-center gap-1.5 bg-primary-light text-primary py-1 px-2.5 rounded-full text-xs font-medium">
                        <Clock size={12} /> {app.timeSlot}
                      </span>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle text-text-secondary">
                      {app.reason.substring(0, 30)}{app.reason.length > 30 ? '...' : ''}
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <span className={`inline-flex items-center p-1 px-2.5 text-xs font-semibold rounded-full capitalize ${
                        app.status === 'completed' ? 'bg-success-bg text-success' : 
                        app.status === 'confirmed' ? 'bg-info-bg text-info' : 
                        app.status === 'cancelled' ? 'bg-danger-bg text-danger' : 
                        'bg-warning-bg text-warning'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <button className="text-xs font-semibold py-1.5 px-3 bg-bg-surface border border-border-color text-text-secondary rounded-md cursor-pointer hover:border-primary hover:text-primary transition-all duration-300" onClick={() => {
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
                  <td colSpan="7" className="text-center p-8 text-text-muted">
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease]">
          <div className="bg-bg-surface border border-border-color rounded-xl w-[90%] max-w-[650px] shadow-lg overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex justify-between items-center p-5 px-6 border-b border-border-color">
              <h3 className="font-heading font-bold text-text-primary text-[16px]">Patient Consultation</h3>
              <button className="bg-none border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-bg-main hover:text-text-primary" onClick={() => setActiveAppointment(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {/* Patient Basic Bio Card */}
              <div className="flex justify-between border-b-1.5 border-border-color pb-4 mb-4.5">
                <div>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px] block mb-1">Patient Name</span>
                  <h4 className="text-base font-bold text-text-primary font-heading leading-tight">{activeAppointment.patient?.name}</h4>
                  <p className="text-xs text-text-secondary mt-1">{activeAppointment.patient?.email} | {activeAppointment.patient?.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px] block mb-1">Session Slot</span>
                  <p className="text-xs text-text-secondary"><strong className="text-text-primary">{new Date(activeAppointment.date).toLocaleDateString()}</strong> at {activeAppointment.timeSlot}</p>
                </div>
              </div>

              <div className="bg-bg-main p-4 rounded-lg border border-border-color mb-5">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px] block mb-1.5">Concern Description</span>
                <p className="italic text-sm text-text-secondary">"{activeAppointment.reason}"</p>
              </div>

              {/* Status Actions */}
              {!showPrescriptionForm && activeAppointment.status !== 'completed' && (
                <div className="border-t border-border-color pt-4.5 mb-5">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px] block mb-2">Update Session Status</span>
                  <div className="flex gap-3 mt-2">
                    {activeAppointment.status === 'pending' && (
                      <button className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer" onClick={() => handleUpdateStatus(activeAppointment._id, 'confirmed')}>
                        Confirm Booking
                      </button>
                    )}
                    {activeAppointment.status !== 'cancelled' && (
                      <button className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-danger-bg text-danger border border-danger/25 transition-all duration-300 hover:bg-danger hover:text-white cursor-pointer" onClick={() => handleUpdateStatus(activeAppointment._id, 'cancelled')}>
                        Cancel Session
                      </button>
                    )}
                    {activeAppointment.status === 'confirmed' && (
                      <button className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-success text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.3)] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 cursor-pointer" onClick={() => setShowPrescriptionForm(true)}>
                        Write Prescription
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Prescription Viewer (If Completed) */}
              {activeAppointment.status === 'completed' && activeAppointment.prescription && (
                <div className="border-t border-dashed border-border-color pt-4.5">
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-[0.5px] mb-4 font-heading">Prescribed Consultation Record</h4>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px] block mb-1">Symptoms</span>
                      <p className="text-sm text-text-secondary">{activeAppointment.prescription.symptoms || 'General Checkup'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px] block mb-1">Diagnosis</span>
                      <p className="text-sm text-text-secondary">{activeAppointment.prescription.diagnosis || 'General'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4.5">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px] block mb-2">Medicines</span>
                    <table className="w-full border-collapse mt-2">
                      <thead>
                        <tr className="border-b-1.5 border-border-color">
                          <th className="text-left text-[11px] text-text-muted uppercase font-bold pb-1.5 font-heading">Medicine</th>
                          <th className="text-left text-[11px] text-text-muted uppercase font-bold pb-1.5 font-heading">Dosage</th>
                          <th className="text-left text-[11px] text-text-muted uppercase font-bold pb-1.5 font-heading">Duration</th>
                          <th className="text-left text-[11px] text-text-muted uppercase font-bold pb-1.5 font-heading">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeAppointment.prescription.medicines?.map((med, idx) => (
                          <tr key={idx} className="border-b border-border-color last:border-0">
                            <td className="py-2.5 text-xs text-text-secondary"><strong className="text-text-primary">{med.name}</strong></td>
                            <td className="py-2.5 text-xs text-text-secondary">{med.dosage}</td>
                            <td className="py-2.5 text-xs text-text-secondary">{med.duration}</td>
                            <td className="py-2.5 text-xs text-text-secondary">{med.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {activeAppointment.prescription.advice && (
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px] block mb-1">Doctor Advice</span>
                      <p className="bg-primary-light text-primary p-3 px-4 rounded-lg text-sm font-medium mt-1">{activeAppointment.prescription.advice}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Prescription Creation Form */}
              {showPrescriptionForm && (
                <form onSubmit={handlePrescriptionSubmit} className="border-t-1.5 border-dashed border-primary pt-5 mt-5 animate-[slideUp_0.3s_ease]">
                  <h4 className="text-sm font-bold uppercase tracking-[0.5px] mb-4 text-primary font-heading">Write Prescription</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col mb-4">
                      <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Symptoms</label>
                      <input
                        type="text"
                        className="w-full py-2.5 px-4 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                        placeholder="Fever, cough, body pain"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col mb-4">
                      <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Diagnosis</label>
                      <input
                        type="text"
                        className="w-full py-2.5 px-4 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                        placeholder="Viral Infection, Bronchitis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Medicines dynamic list */}
                  <div className="border border-border-color bg-bg-main p-4.5 rounded-xl mt-2.5">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xs font-bold uppercase text-text-primary tracking-[0.5px]">Prescribed Medicines</h5>
                      <button type="button" className="text-xs font-semibold py-1.5 px-3 bg-bg-surface border border-border-color text-text-secondary rounded-md cursor-pointer hover:border-primary hover:text-primary transition-all duration-300" onClick={handleAddMedicineRow}>
                        Add Medicine
                      </button>
                    </div>

                    {medicines.map((med, idx) => (
                      <div className="flex flex-col md:flex-row gap-2.5 mb-2.5 items-center last:mb-0" key={idx}>
                        <input
                          type="text"
                          className="w-full md:flex-1 py-2 px-3.5 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                          placeholder="Medicine Name (e.g. Paracetamol)"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="w-full md:w-[110px] py-2 px-3.5 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                          placeholder="Dosage (1-0-1)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="w-full md:w-[110px] py-2 px-3.5 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="w-full md:flex-1 py-2 px-3.5 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                          placeholder="Notes (e.g., After food)"
                          value={med.notes}
                          onChange={(e) => handleMedicineChange(idx, 'notes', e.target.value)}
                        />
                        {medicines.length > 1 && (
                          <button type="button" className="bg-none border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-danger-bg hover:text-danger" onClick={() => handleRemoveMedicineRow(idx)}>
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col mb-4 mt-5">
                    <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Consultation Advice / Recommendations</label>
                    <textarea
                      rows="2"
                      className="w-full py-2.5 px-4 text-sm rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary placeholder-text-muted"
                      placeholder="Take rest for 3 days, drink warm fluids..."
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-bg-surface border border-border-color text-text-secondary transition-all duration-300 hover:bg-bg-main hover:border-text-muted cursor-pointer" onClick={() => setShowPrescriptionForm(false)}>
                      Back
                    </button>
                    <button type="submit" className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Save Prescription & Complete visit'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="flex justify-end items-center p-5 px-6 border-t border-border-color">
              <button className="py-2.5 px-5 text-sm font-semibold rounded-lg bg-bg-surface border border-border-color text-text-secondary transition-all duration-300 hover:bg-bg-main hover:border-text-muted cursor-pointer" onClick={() => setActiveAppointment(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
