import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, DollarSign, Calendar, Shield, Briefcase, UserCheck, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    doctorsCount: 0,
    appointmentsCount: 0,
    revenue: 0,
    pendingAppointments: 0
  });
  
  const [doctorsList, setDoctorsList] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [user.token]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Doctors
      const docsRes = await fetch('/api/doctors?status=all');
      const docsData = await docsRes.json();
      
      // 2. Fetch Appointments
      const appsRes = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const appsData = await appsRes.json();
      
      // 3. Fetch Invoices for Revenue
      const invRes = await fetch('/api/invoices', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const invData = await invRes.json();

      if (docsData.success && appsData.success && invData.success) {
        setDoctorsList(docsData.data);
        setRecentAppointments(appsData.data);
        
        // Calculate paid revenue
        const paidRevenue = invData.data
          .filter(inv => inv.paymentStatus === 'paid')
          .reduce((acc, curr) => acc + curr.totalAmount, 0);

        const pending = appsData.data.filter(app => app.status === 'pending').length;

        setStats({
          doctorsCount: docsData.data.length,
          appointmentsCount: appsData.data.length,
          revenue: paidRevenue,
          pendingAppointments: pending
        });
      } else {
        setError('Error loading administrative data panels');
      }
    } catch (err) {
      setError('Connection timeout compiling hospital metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDoctorStatus = async (doctorId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/doctors/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local doctor status
        setDoctorsList(doctorsList.map(doc => doc._id === doctorId ? { ...doc, status: nextStatus } : doc));
        // Update stats doctor count if status is used for filters
      } else {
        alert(data.message || 'Failed to update doctor profile');
      }
    } catch (err) {
      alert('Network error updating clinical status');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header-row">
        <div>
          <h1>Administration Dashboard</h1>
          <p className="welcome-tag">Monitor clinical departments, staff duties, and medical bills</p>
        </div>
        <button className="btn btn-secondary btn-icon" onClick={fetchAdminData} title="Refresh Statistics">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Stats Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper blue">
            <Briefcase size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{stats.doctorsCount}</h3>
            <p>Active Specialties</p>
          </div>
        </div>

        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper green">
            <DollarSign size={24} />
          </div>
          <div className="stat-info-details">
            <h3>${stats.revenue.toFixed(0)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper info">
            <Calendar size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{stats.appointmentsCount}</h3>
            <p>Consultations</p>
          </div>
        </div>

        <div className="glass-card stat-item-card">
          <div className="stat-icon-wrapper orange">
            <UserCheck size={24} />
          </div>
          <div className="stat-info-details">
            <h3>{stats.pendingAppointments}</h3>
            <p>Pending Review</p>
          </div>
        </div>
      </div>

      {/* Doctors Directory List */}
      <div className="glass-card doctors-directory-card">
        <h2 className="section-card-title">Specialist Directory</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Credentials</th>
                <th>Experience</th>
                <th>Session Fee</th>
                <th>Status</th>
                <th>Toggle Status</th>
              </tr>
            </thead>
            <tbody>
              {doctorsList.length > 0 ? (
                doctorsList.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div className="table-doctor-col">
                        <strong>Dr. {doc.user?.name || 'Pending Name'}</strong>
                        <span>{doc.user?.email}</span>
                      </div>
                    </td>
                    <td>{doc.specialty}</td>
                    <td>{doc.qualification}</td>
                    <td>{doc.experienceYears} Years</td>
                    <td><strong>${doc.fees}</strong></td>
                    <td>
                      <span className={`badge badge-${doc.status === 'active' ? 'success' : 'danger'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`btn ${doc.status === 'active' ? 'btn-danger' : 'btn-primary'} btn-sm-link`}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleToggleDoctorStatus(doc._id, doc.status)}
                      >
                        {doc.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                    No doctors registered in directory database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Appointments Audit */}
      <div className="glass-card recent-appointments-card">
        <h2 className="section-card-title">Recent Consultations Audit</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Assigned Doctor</th>
                <th>Schedule Date</th>
                <th>Time Slot</th>
                <th>Concerns</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.length > 0 ? (
                recentAppointments.slice(0, 6).map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.patient?.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{app.patient?.phone}</div>
                    </td>
                    <td>Dr. {app.doctor?.user?.name}</td>
                    <td>{new Date(app.date).toLocaleDateString()}</td>
                    <td>{app.timeSlot}</td>
                    <td>{app.reason.substring(0, 30)}{app.reason.length > 30 ? '...' : ''}</td>
                    <td>
                      <span className={`badge badge-${app.status === 'completed' ? 'success' : app.status === 'cancelled' ? 'danger' : 'warning'}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                    No consultation sessions scheduled yet
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

export default AdminDashboard;
