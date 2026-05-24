import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient/Staff/Admin)
export const bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot, reason } = req.body;

  try {
    // 1. Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId).populate('user', 'name');
    if (!doctor || doctor.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Doctor profile not found or inactive' });
    }

    // 2. Check if the slot is already booked for that date
    // Normalize date to search by day
    const appointmentDate = new Date(date);
    appointmentDate.setUTCHours(0, 0, 0, 0);

    const nextDay = new Date(appointmentDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: {
        $gte: appointmentDate,
        $lt: nextDay,
      },
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for the selected date',
      });
    }

    // 3. Create appointment
    // If the booking user is patient, patient is req.user._id. If staff/admin booking, patient is passed in body
    let patientId = req.user._id;
    if ((req.user.role === 'admin' || req.user.role === 'staff') && req.body.patientId) {
      patientId = req.body.patientId;
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date: appointmentDate,
      timeSlot,
      reason,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appointments based on role
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    let query = {};

    // Filter by role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Find doctor profile for this user
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }
      query.doctor = doctorProfile._id;
    }
    // Admin and Staff see all appointments by default

    // Fetch and populate details
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone gender dob')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name specialty avatar' },
      })
      .sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone gender dob')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization checks
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'doctor' && appointment.doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor/Staff/Admin)
export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctor');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Doctor can only update their own appointments
    if (req.user.role === 'doctor' && appointment.doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update prescription (Doctor only)
// @route   PUT /api/appointments/:id/prescription
// @access  Private (Doctor only)
export const addPrescription = async (req, res) => {
  const { symptoms, diagnosis, medicines, advice } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctor');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify requesting user is the doctor assigned to the appointment
    if (appointment.doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to write a prescription for this appointment',
      });
    }

    appointment.prescription = {
      symptoms,
      diagnosis,
      medicines,
      advice,
    };
    appointment.status = 'completed'; // Auto mark as completed on prescription writing

    const updatedAppointment = await appointment.save();

    res.json({ success: true, data: updatedAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
