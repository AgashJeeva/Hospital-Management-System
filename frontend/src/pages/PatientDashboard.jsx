import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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
      <div className="flex justify-center items-center h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-7.5">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Patient Dashboard</h1>
        <p className="text-text-secondary text-[16px] mt-1">Manage your health profile, consultation schedules, and medical receipts</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-danger-bg text-danger p-3.5 px-5 rounded-lg mb-6 font-medium">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-7.5">
        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-primary-light text-primary">
            <Calendar size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{totalBooked}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Total Booked</p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-warning-bg text-warning">
            <Clock size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{pendingAppointments.length}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Pending / Confirmed</p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-success-bg text-success">
            <CheckCircle size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{completedAppointments.length}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Completed Visits</p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 bg-bg-card backdrop-blur-md border border-border-color rounded-xl shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-danger-bg text-danger">
            <AlertCircle size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold text-text-primary leading-tight">{cancelledAppointments.length}</h3>
            <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[0.5px] mt-0.5">Cancelled Visits</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Next Appointment & Upcoming Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 mb-7.5">
        {/* Next Appointment Card */}
        <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <h2 className="text-[18px] font-bold text-text-primary mb-5 border-b border-border-color pb-3">Next Scheduled Appointment</h2>
          {nextAppointment ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-xl font-heading">
                  {nextAppointment.doctor?.user?.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-text-primary">Dr. {nextAppointment.doctor?.user?.name}</h4>
                  <p className="text-[13px] text-text-muted font-medium">{nextAppointment.doctor?.specialty}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-bg-main p-4 rounded-lg border border-border-color">
                <div>
                  <span className="block text-[11px] text-text-muted uppercase font-bold mb-1 tracking-[0.5px]">Date</span>
                  <span className="font-semibold text-text-primary text-[14px]">
                    {new Date(nextAppointment.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-text-muted uppercase font-bold mb-1 tracking-[0.5px]">Time Slot</span>
                  <span className="font-semibold text-text-primary text-[14px]">{nextAppointment.timeSlot}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-text-muted uppercase font-bold mb-1 tracking-[0.5px]">Status</span>
                  <span className={`inline-flex items-center p-1 px-2.5 text-xs font-semibold rounded-full capitalize ${nextAppointment.status === 'confirmed' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}>
                    {nextAppointment.status}
                  </span>
                </div>
              </div>
              <div>
                <span className="block text-[11px] text-text-muted uppercase font-bold mb-1 tracking-[0.5px]">Reason</span>
                <p className="text-[14px] text-text-secondary bg-bg-main p-3 px-4 rounded-lg border border-border-color mt-1">{nextAppointment.reason}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
              <Calendar size={48} className="text-text-muted mb-3" />
              <p>No upcoming appointments found</p>
              <a href="/book" className="mt-4 py-2 px-5 text-sm font-heading font-semibold rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer">Book Now</a>
            </div>
          )}
        </div>

        {/* List of Recent Appointments */}
        <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300">
          <h2 className="text-[18px] font-bold text-text-primary mb-5 border-b border-border-color pb-3">Recent Appointment History</h2>
          <div className="flex flex-col gap-3">
            {appointments.length > 0 ? (
              appointments.slice(0, 5).map((app) => (
                <div className="flex items-center justify-between p-3.5 px-4 rounded-lg border border-border-color bg-bg-surface transition-all duration-300 hover:border-primary hover:bg-primary-light" key={app._id}>
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-primary text-[14px]">Dr. {app.doctor?.user?.name}</span>
                    <span className="text-xs text-text-muted">{app.doctor?.specialty}</span>
                  </div>
                  <div className="flex flex-col text-right text-[13px]">
                    <span>{new Date(app.date).toLocaleDateString()}</span>
                    <span className="font-medium text-text-primary">{app.timeSlot}</span>
                  </div>
                  <span className={`inline-flex items-center p-1 px-2.5 text-xs font-semibold rounded-full capitalize ${app.status === 'completed' ? 'bg-success-bg text-success' : app.status === 'cancelled' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'}`}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-text-muted p-7.5">No appointment logs found</p>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Log Section */}
      <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300 mb-6">
        <h2 className="text-[18px] font-bold text-text-primary mb-5 border-b border-border-color pb-3">Recent Medical Prescriptions</h2>
        <div className="overflow-x-auto rounded-xl border border-border-color">
          <table className="w-full border-collapse text-left bg-bg-surface">
            <thead>
              <tr className="border-b-1.5 border-border-color">
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Doctor</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Diagnosis</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Prescribed Date</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Medicines</th>
                <th className="bg-bg-main p-4 px-5 font-semibold text-sm text-text-primary font-heading">Instructions</th>
              </tr>
            </thead>
            <tbody>
              {completedAppointments.length > 0 ? (
                completedAppointments.slice(0, 5).map((app) => (
                  <tr className="hover:bg-primary-light" key={app._id}>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <div className="flex flex-col">
                        <strong className="text-text-primary">Dr. {app.doctor?.user?.name}</strong>
                        <span className="text-xs text-text-muted">{app.doctor?.specialty}</span>
                      </div>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle text-text-primary font-medium">{app.prescription?.diagnosis || 'General Consultation'}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">{new Date(app.date).toLocaleDateString()}</td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle">
                      <div className="flex flex-wrap gap-1.5">
                        {app.prescription?.medicines?.map((med, idx) => (
                          <span className="text-xs font-medium bg-primary-light text-primary py-0.5 px-2 rounded whitespace-nowrap" key={idx}>
                            {med.name} ({med.dosage})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 px-5 border-b border-border-color text-sm align-middle text-text-secondary">{app.prescription?.advice || 'No special advice provided'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-text-muted">
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
