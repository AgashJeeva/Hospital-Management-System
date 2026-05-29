import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User as UserIcon, Clock, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch all active doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors?status=active');
        const data = await res.json();
        if (data.success) {
          setDoctors(data.data);
          
          // Extract unique specialties
          const specs = [...new Set(data.data.map(doc => doc.specialty))];
          setSpecialties(specs);
        } else {
          setError(data.message || 'Failed to fetch doctor schedules');
        }
      } catch (err) {
        setError('Error connecting to clinical database');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter doctors based on selected specialty
  const filteredDoctors = selectedSpecialty
    ? doctors.filter((doc) => doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase())
    : doctors;

  // Handle doctor selection and populate slots
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot('');
    setAppointmentDate('');
    setAvailableSlots([]);
  };

  // Handle date change and populate active slots for that day
  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    setAppointmentDate(dateStr);
    setSelectedSlot('');

    if (!selectedDoctor || !dateStr) {
      setAvailableSlots([]);
      return;
    }

    // Get day name for selected date (e.g. 'Monday')
    const selectedDay = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find doctor's slots for that day
    const doctorDayAvailability = selectedDoctor.availability.find(
      (avail) => avail.day.toLowerCase() === selectedDay.toLowerCase()
    );

    if (doctorDayAvailability) {
      setAvailableSlots(doctorDayAvailability.slots);
    } else {
      setAvailableSlots([]); // No availability for this day
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctor || !appointmentDate || !selectedSlot || !reason) {
      setError('Please fill in all booking details');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date: appointmentDate,
          timeSlot: selectedSlot,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reserve appointment');
      }
    } catch (err) {
      setError('Network error saving appointment details');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (today) to prevent past bookings
  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-[500px] mx-auto my-[60px] p-10 bg-bg-card backdrop-blur-md border border-border-color rounded-[20px] shadow-lg animate-[fadeIn_0.4s_ease]">
        <CheckCircle className="text-success mb-5" size={60} />
        <h2 className="text-[22px] font-bold text-text-primary mb-1">Appointment Confirmed!</h2>
        <p>Your session has been successfully booked with Dr. {selectedDoctor?.user?.name}.</p>
        <p className="text-sm text-text-muted mt-2.5">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-7.5">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Book an Appointment</h1>
        <p className="text-text-secondary text-[16px] mt-1">Schedule a consultation with our experienced clinical specialists</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-danger-bg text-danger p-3.5 px-5 rounded-lg mb-6 font-medium">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[30px] mb-10">
        {/* Left Column: Doctor Selection */}
        <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-[18px] font-bold text-text-primary mb-5 border-b border-border-color pb-3">1. Select a Specialist</h2>
          
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Specialty Filter</label>
            <select
              className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] cursor-pointer"
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setSelectedDoctor(null);
                setAppointmentDate('');
                setSelectedSlot('');
                setAvailableSlots([]);
              }}
            >
              <option value="">All Specialties</option>
              {specialties.map((spec, idx) => (
                <option value={spec} key={idx}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  className={`flex items-center gap-4 p-4 border border-border-color rounded-lg bg-bg-surface cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary-light hover:translate-x-1 ${selectedDoctor?._id === doc._id ? 'border-primary bg-primary-light shadow-sm' : ''}`}
                  onClick={() => handleSelectDoctor(doc)}
                >
                  <div className={`w-11 h-11 rounded-full bg-bg-main text-text-muted flex items-center justify-center transition-all duration-300 ${selectedDoctor?._id === doc._id ? 'bg-primary text-white' : ''}`}>
                    <UserIcon size={24} />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="text-[15px] font-semibold text-text-primary">Dr. {doc.user?.name}</h4>
                    <span className="text-xs font-semibold text-primary">{doc.specialty}</span>
                    <span className="text-xs text-text-muted">{doc.qualification}</span>
                  </div>
                  <div className="text-right flex flex-col text-xs">
                    <span>Fee</span>
                    <strong className="text-base font-bold text-text-primary">${doc.fees}</strong>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-text-muted p-7.5">No doctors matching search criteria</p>
            )}
          </div>
        </div>

        {/* Right Column: Time Slot & Booking Form */}
        <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-[18px] font-bold text-text-primary mb-5 border-b border-border-color pb-3">2. Appointment Scheduling</h2>
          
          {selectedDoctor ? (
            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
              <div className="bg-bg-main p-4 rounded-lg border border-border-color mb-2 flex flex-col items-start gap-1">
                <p className="text-xs text-text-muted">Booking session with:</p>
                <h3 className="text-base font-bold text-text-primary">Dr. {selectedDoctor.user?.name}</h3>
                <span className="inline-flex items-center p-1 px-2.5 text-xs font-semibold rounded-full capitalize bg-success-bg text-success">{selectedDoctor.specialty}</span>
              </div>

              {/* Date Input */}
              <div className="flex flex-col">
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Select Date</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-4 text-text-muted pointer-events-none" size={18} />
                  <input
                    type="date"
                    className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                    min={getTodayDateString()}
                    value={appointmentDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>
              </div>

              {/* Time Slots Selector */}
              {appointmentDate && (
                <div className="flex flex-col">
                  <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Available Time Slots</label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-2">
                      {availableSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          className={`flex items-center justify-center gap-1.5 p-2.5 text-xs font-semibold bg-bg-surface border border-border-color text-text-secondary rounded-lg cursor-pointer transition-all duration-300 hover:border-primary hover:text-primary hover:bg-primary-light ${selectedSlot === slot ? 'bg-primary border-primary text-white shadow-sm hover:bg-primary hover:text-white' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock size={14} />
                          <span>{slot}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-warning-bg text-warning p-2.5 px-3.5 rounded-lg text-xs font-medium mt-2">
                      <AlertCircle size={16} />
                      <span>Doctor has no consultation slots listed for this day.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reason Input */}
              <div className="flex flex-col">
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Reason for Booking</label>
                <div className="relative flex items-center">
                  <MessageSquare className="absolute left-4 top-4 text-text-muted pointer-events-none" size={18} />
                  <textarea
                    rows="3"
                    className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                    placeholder="Briefly describe your medical concerns..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2.5 text-[15px] font-heading font-semibold py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || !selectedSlot}
              >
                {submitting ? 'Reserving slot...' : 'Confirm Appointment Booking'}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-5 text-center text-text-muted">
              <Calendar size={48} className="text-text-muted mb-3" />
              <p>Please select a specialist on the left to activate scheduling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
