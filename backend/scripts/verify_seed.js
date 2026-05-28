import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Invoice from '../models/Invoice.js';
import Message from '../models/Message.js';

// Resolve directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for verification.\n');

    const usersCount = await User.countDocuments();
    const patientsCount = await Patient.countDocuments();
    const doctorsCount = await Doctor.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();
    const invoicesCount = await Invoice.countDocuments();
    const messagesCount = await Message.countDocuments();

    console.log(`--- Collection Counts ---`);
    console.log(`Users: ${usersCount}`);
    console.log(`Patients: ${patientsCount}`);
    console.log(`Doctors: ${doctorsCount}`);
    console.log(`Appointments: ${appointmentsCount}`);
    console.log(`Invoices: ${invoicesCount}`);
    console.log(`Messages: ${messagesCount}\n`);

    // Verify Specific Accounts
    const agashUser = await User.findOne({ email: 'agash@gmail.com' });
    if (agashUser) {
      console.log(`Patient user 'Agash' found! ID: ${agashUser._id}`);
      const agashProfile = await Patient.findOne({ user: agashUser._id });
      if (agashProfile) {
        console.log(`Patient profile for 'Agash' found with ${agashProfile.medicalHistory.length} medical history entries.`);
      } else {
        console.error(`ERROR: Patient profile for 'Agash' not found.`);
      }
    } else {
      console.error(`ERROR: Patient user 'Agash' not found.`);
    }

    const johnUser = await User.findOne({ email: 'john@gmail.com' });
    if (johnUser) {
      console.log(`Doctor user 'John' found! ID: ${johnUser._id}`);
      const johnProfile = await Doctor.findOne({ user: johnUser._id });
      if (johnProfile) {
        console.log(`Doctor profile for 'John' found with specialty: ${johnProfile.specialty}.`);
      } else {
        console.error(`ERROR: Doctor profile for 'John' not found.`);
      }
    } else {
      console.error(`ERROR: Doctor user 'John' not found.`);
    }

    console.log('\nVerification completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
};

verifyDB();
