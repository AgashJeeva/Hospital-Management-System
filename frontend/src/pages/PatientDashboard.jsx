import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
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
          setError(data.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        setError('Network error fetching dashboard details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user.token]);

  // Calculations for stats
  const totalBooked = appointments.length;
  const pendingAppointments = appointments.filter((app) => app.status === 'pending' || app.status === 'confirmed');
  const completedAppointments = appointments.filter((app) => app.status === 'completed');
  const cancelledAppointments = appointments.filter((app) => app.status === 'cancelled');

  const nextAppointment = pendingAppointments.length > 0 ? pendingAppointments[0] : null;

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header-panel">
        <h1>Patient Dashboard</h1>
        <p className="welcome-tag">Manage your health profile, consultation schedules, and medical receipts</p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Stats */}
      <div className="stats-grid">
        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper blue">
            <Calendar size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{totalBooked}</h3>
            <p>Total Booked</p>
          </div>
        </div>

        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper orange">
            <Clock size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{pendingAppointments.length}</h3>
            <p>Pending / Confirmed</p>
          </div>
        </div>

        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{completedAppointments.length}</h3>
            <p>Completed Visits</p>
          </div>
        </div>

        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper red">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{cancelledAppointments.length}</h3>
            <p>Cancelled Visits</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Next Appointment & Upcoming Schedules */}
      <div className="dashboard-content-split">
        {/* Next Appointment Card */}
        <div className="glass-card next-visit-card">
          <h2 className="section-card-title">Next Scheduled Appointment</h2>
          {nextAppointment ? (
            <div className="visit-detail-box">
              <div className="doctor-badge-row">
                <div className="doctor-info-avatar">
                  {nextAppointment.doctor?.user?.name.charAt(0)}
                </div>
                <div>
                  <h4>Dr. {nextAppointment.doctor?.user?.name}</h4>
                  <p className="doc-spec">{nextAppointment.doctor?.specialty}</p>
                </div>
              </div>
              <div className="visit-meta-grid">
                <div>
                  <span className="meta-label">Date</span>
                  <span className="meta-value">
                    {new Date(nextAppointment.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Time Slot</span>
                  <span className="meta-value">{nextAppointment.timeSlot}</span>
                </div>
                <div>
                  <span className="meta-label">Status</span>
                  <span className={`badge badge-${nextAppointment.status === 'confirmed' ? 'success' : 'warning'}`}>
                    {nextAppointment.status}
                  </span>
                </div>
              </div>
              <div className="visit-reason">
                <span className="meta-label">Reason</span>
                <p>{nextAppointment.reason}</p>
              </div>
            </div>
          ) : (
            <div className="no-visit-placeholder">
              <Calendar size={48} className="placeholder-icon" />
              <p>No upcoming appointments found</p>
              <a href="/book" className="btn btn-primary btn-sm-link">Book Now</a>
            </div>
          )}
        </div>

        {/* List of Recent Appointments */}
        <div className="glass-card appointments-list-card">
          <h2 className="section-card-title">Recent Appointment History</h2>
          <div className="appointment-items-container">
            {appointments.length > 0 ? (
              appointments.slice(0, 5).map((app) => (
                <div className="appointment-list-item" key={app._id}>
                  <div className="item-doc-details">
                    <span className="item-doc-name">Dr. {app.doctor?.user?.name}</span>
                    <span className="item-doc-spec">{app.doctor?.specialty}</span>
                  </div>
                  <div className="item-time-details">
                    <span>{new Date(app.date).toLocaleDateString()}</span>
                    <span className="item-slot">{app.timeSlot}</span>
                  </div>
                  <span className={`badge badge-${app.status === 'completed' ? 'success' : app.status === 'cancelled' ? 'danger' : 'warning'}`}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-records-text">No appointment logs found</p>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Log Section */}
      <div className="glass-card prescriptions-section-card">
        <h2 className="section-card-title">Recent Medical Prescriptions</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Prescribed Date</th>
                <th>Medicines</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {completedAppointments.length > 0 ? (
                completedAppointments.slice(0, 5).map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div className="table-doctor-col">
                        <strong>Dr. {app.doctor?.user?.name}</strong>
                        <span>{app.doctor?.specialty}</span>
                      </div>
                    </td>
                    <td>{app.prescription?.diagnosis || 'General Consultation'}</td>
                    <td>{new Date(app.date).toLocaleDateString()}</td>
                    <td>
                      <div className="table-medicines-list">
                        {app.prescription?.medicines?.map((med, idx) => (
                          <span className="med-tag" key={idx}>
                            {med.name} ({med.dosage})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{app.prescription?.advice || 'No special advice provided'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>
                    No prescription history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
