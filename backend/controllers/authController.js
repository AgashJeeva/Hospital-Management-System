import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, phone, gender, dob, specialty, qualification, experienceYears, fees } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
      gender,
      dob,
    });

    if (user) {
      // If patient, auto-create Patient profile
      if (user.role === 'patient') {
        await Patient.create({
          user: user._id,
        });
      }

      // If doctor, auto-create Doctor profile
      if (user.role === 'doctor') {
        await Doctor.create({
          user: user._id,
          specialty: specialty || 'General Medicine',
          qualification: qualification || 'MBBS',
          experienceYears: experienceYears || 0,
          fees: fees || 0,
          availability: [
            { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Friday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
          ]
        });
      }

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // We explicitly select the password because by default it is deselected in Schema
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let extraData = {};
      if (user.role === 'patient') {
        extraData = await Patient.findOne({ user: user._id });
      } else if (user.role === 'doctor') {
        extraData = await Doctor.findOne({ user: user._id });
      }

      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        avatar: user.avatar,
        extraData,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.gender = req.body.gender || user.gender;
      user.dob = req.body.dob || user.dob;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // Handle role-specific extra profile updates
      if (user.role === 'patient' && req.body.extraData) {
        const patientProfile = await Patient.findOne({ user: user._id });
        if (patientProfile) {
          patientProfile.bloodGroup = req.body.extraData.bloodGroup || patientProfile.bloodGroup;
          patientProfile.emergencyContact = req.body.extraData.emergencyContact || patientProfile.emergencyContact;
          patientProfile.medicalHistory = req.body.extraData.medicalHistory || patientProfile.medicalHistory;
          await patientProfile.save();
        }
      }

      res.json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
