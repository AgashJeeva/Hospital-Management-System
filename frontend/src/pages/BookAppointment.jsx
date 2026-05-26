import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User as UserIcon, Clock, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import './BookAppointment.css';

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
      <div className="booking-loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-card success-booking-box animate-fadeIn">
        <CheckCircle className="success-icon" size={60} />
        <h2>Appointment Confirmed!</h2>
        <p>Your session has been successfully booked with Dr. {selectedDoctor?.user?.name}.</p>
        <p className="redirect-note">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="book-appointment-page">
      <div className="page-header-panel">
        <h1>Book an Appointment</h1>
        <p className="welcome-tag">Schedule a consultation with our experienced clinical specialists</p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="booking-grid">
        {/* Left Column: Doctor Selection */}
        <div className="glass-card doctor-selector-panel">
          <h2 className="panel-title">1. Select a Specialist</h2>
          
          <div className="filter-row">
            <label className="form-label">Specialty Filter</label>
            <select
              className="register-select-field"
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

          <div className="doctors-card-list">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  className={`doctor-profile-card ${selectedDoctor?._id === doc._id ? 'selected' : ''}`}
                  onClick={() => handleSelectDoctor(doc)}
                >
                  <div className="doctor-card-icon">
                    <UserIcon size={24} />
                  </div>
                  <div className="doctor-card-meta">
                    <h4>Dr. {doc.user?.name}</h4>
                    <span className="doc-specialty">{doc.specialty}</span>
                    <span className="doc-qualification">{doc.qualification}</span>
                  </div>
                  <div className="doctor-card-fees">
                    <span>Fee</span>
                    <strong>${doc.fees}</strong>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-doctors-text">No doctors matching search criteria</p>
            )}
          </div>
        </div>

        {/* Right Column: Time Slot & Booking Form */}
        <div className="glass-card booking-details-panel">
          <h2 className="panel-title">2. Appointment Scheduling</h2>
          
          {selectedDoctor ? (
            <form onSubmit={handleBookingSubmit} className="booking-details-form">
              <div className="selected-doctor-summary">
                <p>Booking session with:</p>
                <h3>Dr. {selectedDoctor.user?.name}</h3>
                <span className="badge badge-success">{selectedDoctor.specialty}</span>
              </div>

              {/* Date Input */}
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <div className="register-input-wrapper">
                  <Calendar className="register-input-icon" size={18} />
                  <input
                    type="date"
                    className="register-input-field plain"
                    min={getTodayDateString()}
                    value={appointmentDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>
              </div>

              {/* Time Slots Selector */}
              {appointmentDate && (
                <div className="form-group">
                  <label className="form-label">Available Time Slots</label>
                  {availableSlots.length > 0 ? (
                    <div className="slots-toggle-grid">
                      {availableSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          className={`slot-toggle-button ${selectedSlot === slot ? 'active' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock size={14} />
                          <span>{slot}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="no-slots-alert">
                      <AlertCircle size={16} />
                      <span>Doctor has no consultation slots listed for this day.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reason Input */}
              <div className="form-group">
                <label className="form-label">Reason for Booking</label>
                <div className="register-input-wrapper">
                  <MessageSquare className="register-input-icon" style={{ top: '15px' }} size={18} />
                  <textarea
                    rows="3"
                    className="input-control"
                    style={{ paddingLeft: '46px' }}
                    placeholder="Briefly describe your medical concerns..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary booking-submit-button"
                disabled={submitting || !selectedSlot}
              >
                {submitting ? 'Reserving slot...' : 'Confirm Appointment Booking'}
              </button>
            </form>
          ) : (
            <div className="booking-form-placeholder">
              <Calendar size={48} className="placeholder-icon" />
              <p>Please select a specialist on the left to activate scheduling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
