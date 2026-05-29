import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, DollarSign, Calendar, Briefcase, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

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
      } else {
        alert(data.message || 'Failed to update doctor profile');
      }
    } catch (err) {
      alert('Network error updating clinical status');
    }
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-7.5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Administration Dashboard</h1>
          <p className="text-text-secondary text-[16px] mt-1">Monitor clinical departments, staff duties, and medical bills</p>
        </div>
        <button className="flex items-center gap-2 py-2.5 px-5 text-sm font-semibold rounded-lg bg-bg-surface border border-border-color text-text-secondary transition-all duration-300 hover:bg-bg-main hover:border-text-muted cursor-pointer self-start sm:self-auto" onClick={fetchAdminData} title="Refresh Statistics">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-danger-bg text-danger p-3.5 px-5 rounded-lg mb-6 font-medium">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-7.5">
        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-primary-light text-primary">
            <Briefcase size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{stats.doctorsCount}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Active Specialties</p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-success-bg text-success">
            <DollarSign size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">${stats.revenue.toFixed(0)}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Total Revenue</p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-info-bg text-info">
            <Calendar size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{stats.appointmentsCount}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Consultations</p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-warning-bg text-warning">
            <UserCheck size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{stats.pendingAppointments}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Pending Review</p>
          </div>
        </div>
      </div>

      {/* Doctors Directory List */}
      <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300 mb-7.5">
        <h2 className="text-[18px] font-bold text-text-primary mb-5 border-b border-border-color pb-3">Specialist Directory</h2>
        <div className="overflow-x-auto rounded-xl border border-border-color">
          <table className="w-full border-collapse text-left bg-bg-surface">
            <thead>
              <tr className="border-b-1.5 border-border-color">
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Doctor</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Specialty</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Credentials</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Experience</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Session Fee</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Status</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Toggle Status</th>
              </tr>
            </thead>
            <tbody>
              {doctorsList.length > 0 ? (
                doctorsList.map((doc) => (
                  <tr className="hover:bg-primary-light" key={doc._id}>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <div className="flex flex-col">
                        <strong className="text-text-primary">Dr. {doc.user?.name || 'Pending Name'}</strong>
                        <span className="text-xs text-text-muted mt-0.5">{doc.user?.email}</span>
                      </div>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">{doc.specialty}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">{doc.qualification}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">{doc.experienceYears} Years</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle text-text-primary font-bold">${doc.fees}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <span className={`inline-flex items-center p-1 px-2.5 text-xs font-semibold rounded-full capitalize ${
                        doc.status === 'active' ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <button 
                        className={`text-xs font-semibold py-1.5 px-3 rounded-md cursor-pointer transition-all duration-300 border ${
                          doc.status === 'active' 
                            ? 'bg-danger-bg text-danger border-danger/20 hover:bg-danger hover:text-white' 
                            : 'bg-primary-light text-primary border-primary/20 hover:bg-primary hover:text-white'
                        }`}
                        onClick={() => handleToggleDoctorStatus(doc._id, doc.status)}
                      >
                        {doc.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-text-muted">
                    No doctors registered in directory database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Appointments Audit */}
      <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300 mb-6">
        <h2 className="text-[18px] font-bold text-text-primary mb-5 border-b border-border-color pb-3">Recent Consultations Audit</h2>
        <div className="overflow-x-auto rounded-xl border border-border-color">
          <table className="w-full border-collapse text-left bg-bg-surface">
            <thead>
              <tr className="border-b-1.5 border-border-color">
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Patient</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Assigned Doctor</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Schedule Date</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Time Slot</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Concerns</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.length > 0 ? (
                recentAppointments.slice(0, 6).map((app) => (
                  <tr className="hover:bg-primary-light" key={app._id}>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <strong className="text-text-primary">{app.patient?.name}</strong>
                      <div className="text-xs text-text-muted mt-0.5">{app.patient?.phone}</div>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle text-text-primary font-medium">Dr. {app.doctor?.user?.name}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">{new Date(app.date).toLocaleDateString()}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">{app.timeSlot}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle text-text-secondary">
                      {app.reason.substring(0, 30)}{app.reason.length > 30 ? '...' : ''}
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <span className={`inline-flex items-center p-1 px-2.5 text-xs font-semibold rounded-full capitalize ${
                        app.status === 'completed' ? 'bg-success-bg text-success' : 
                        app.status === 'cancelled' ? 'bg-danger-bg text-danger' : 
                        'bg-warning-bg text-warning'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-text-muted">
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
