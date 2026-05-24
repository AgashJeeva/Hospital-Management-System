import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Get all doctors (with filters)
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const { specialty, status } = req.query;
    const filter = {};

    if (specialty) {
      filter.specialty = { $regex: specialty, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = 'active'; // Default show active doctors
    }

    // Populate Doctor's corresponding User details (name, email, phone, avatar, gender)
    const doctors = await Doctor.find(filter).populate(
      'user',
      'name email phone avatar gender'
    );

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      'user',
      'name email phone avatar gender dob'
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor profile (by Doctor themselves or Admin)
// @route   PUT /api/doctors/:id
// @access  Private (Doctor or Admin)
export const updateDoctorProfile = async (req, res) => {
  try {
    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Check if the user is the doctor themselves or an admin
    if (
      req.user.role !== 'admin' &&
      doctor.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this profile',
      });
    }

    // Update Doctor properties
    const { specialty, qualification, experienceYears, biography, fees, availability, status } = req.body;

    if (specialty) doctor.specialty = specialty;
    if (qualification) doctor.qualification = qualification;
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (biography) doctor.biography = biography;
    if (fees !== undefined) doctor.fees = fees;
    if (availability) doctor.availability = availability;
    if (status && req.user.role === 'admin') doctor.status = status; // Only Admin can change status

    const updatedDoctor = await doctor.save();

    res.json({ success: true, data: updatedDoctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
