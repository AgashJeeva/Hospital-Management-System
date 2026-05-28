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

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data (optional but highly recommended for seed script)
    console.log('Wiping existing database collections...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Invoice.deleteMany({});
    await Message.deleteMany({});
    console.log('Collections cleared.');

    // 1. Create Patient User (Agash)
    console.log('Creating Patient User (Agash)...');
    const patientUser = await User.create({
      name: 'Agash',
      email: 'agash@gmail.com',
      password: '00000000',
      role: 'patient',
      phone: '+1234567890',
      gender: 'male',
      dob: new Date('1995-05-15'),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    });

    // Create Patient Profile
    console.log('Creating Patient Profile for Agash...');
    const patientProfile = await Patient.create({
      user: patientUser._id,
      bloodGroup: 'O+',
      emergencyContact: {
        name: 'Vijay',
        relation: 'Brother',
        phone: '+1987654321'
      },
      medicalHistory: [
        {
          condition: 'Asthma',
          diagnosedDate: new Date('2018-04-10'),
          notes: 'Controlled with inhaler as needed'
        },
        {
          condition: 'Seasonal Allergies',
          diagnosedDate: new Date('2020-09-01'),
          notes: 'Allergic to pollen and dust'
        },
        {
          condition: 'Hypertension',
          diagnosedDate: new Date('2023-01-15'),
          notes: 'Mild hypertension, managed with low-sodium diet and exercise'
        }
      ]
    });

    // 2. Create Doctor User (John)
    console.log('Creating Doctor User (John)...');
    const doctorUser = await User.create({
      name: 'John',
      email: 'john@gmail.com',
      password: '00000000',
      role: 'doctor',
      phone: '+1555666777',
      gender: 'male',
      dob: new Date('1982-08-20'),
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'
    });

    // Create Doctor Profile
    console.log('Creating Doctor Profile for John...');
    const doctorProfile = await Doctor.create({
      user: doctorUser._id,
      specialty: 'Cardiology',
      qualification: 'MD, DM (Cardiology)',
      experienceYears: 12,
      biography: 'Dr. John is a senior cardiologist with over a decade of experience treating complex heart conditions and managing patient recovery.',
      fees: 150,
      availability: [
        { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
        { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
        { day: 'Friday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
      ],
      status: 'active'
    });

    // 3. Create Additional Doctors & Patients to make data look rich
    console.log('Creating extra doctors and patients...');
    const docSarahUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@gmail.com',
      password: '00000000',
      role: 'doctor',
      phone: '+1555111222',
      gender: 'female',
      dob: new Date('1988-11-12'),
      avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150'
    });

    const docSarahProfile = await Doctor.create({
      user: docSarahUser._id,
      specialty: 'Pediatrics',
      qualification: 'MD, DCH',
      experienceYears: 8,
      biography: 'Dr. Sarah Jenkins is passionate about child healthcare and pediatric developmental milestones.',
      fees: 100,
      availability: [
        { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '13:00', '14:00'] },
        { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '13:00', '14:00'] }
      ],
      status: 'active'
    });

    const docDavidUser = await User.create({
      name: 'David Miller',
      email: 'david@gmail.com',
      password: '00000000',
      role: 'doctor',
      phone: '+1555333444',
      gender: 'male',
      dob: new Date('1985-03-25'),
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150'
    });

    const docDavidProfile = await Doctor.create({
      user: docDavidUser._id,
      specialty: 'Dermatology',
      qualification: 'MD, DNB (Dermatology)',
      experienceYears: 10,
      biography: 'Dr. David Miller specializes in skin cancer screenings, acne treatments, and pediatric dermatology.',
      fees: 120,
      availability: [
        { day: 'Monday', slots: ['10:00', '11:00', '12:00', '15:00', '16:00'] },
        { day: 'Wednesday', slots: ['10:00', '11:00', '12:00', '15:00', '16:00'] }
      ],
      status: 'active'
    });

    const patientEmilyUser = await User.create({
      name: 'Emily Rose',
      email: 'emily@gmail.com',
      password: '00000000',
      role: 'patient',
      phone: '+1222333444',
      gender: 'female',
      dob: new Date('1998-02-14'),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
    });

    await Patient.create({
      user: patientEmilyUser._id,
      bloodGroup: 'A-',
      emergencyContact: {
        name: 'Jane Rose',
        relation: 'Mother',
        phone: '+1222333555'
      },
      medicalHistory: []
    });

    const patientMichaelUser = await User.create({
      name: 'Michael Chen',
      email: 'michael@gmail.com',
      password: '00000000',
      role: 'patient',
      phone: '+1777888999',
      gender: 'male',
      dob: new Date('1990-07-30'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
    });

    await Patient.create({
      user: patientMichaelUser._id,
      bloodGroup: 'B+',
      emergencyContact: {
        name: 'Linda Chen',
        relation: 'Wife',
        phone: '+1777888111'
      },
      medicalHistory: [
        {
          condition: 'Type 2 Diabetes',
          diagnosedDate: new Date('2021-11-20'),
          notes: 'Managed with Metformin and low-carb diet'
        }
      ]
    });

    // Create an Admin User
    console.log('Creating Admin User...');
    await User.create({
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: '00000000',
      role: 'admin',
      phone: '+1888999000',
      gender: 'other',
      dob: new Date('1980-01-01')
    });

    // 4. Create Appointments
    console.log('Creating Dummy Appointments...');
    const now = new Date();

    // Helper functions to get dynamic offset dates
    const getPastDate = (daysAgo) => {
      const d = new Date();
      d.setDate(now.getDate() - daysAgo);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const getFutureDate = (daysAhead) => {
      const d = new Date();
      d.setDate(now.getDate() + daysAhead);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    // Completed Appointment 1 (Agash & Dr. John - Cardiology)
    const app1 = await Appointment.create({
      patient: patientUser._id,
      doctor: doctorProfile._id,
      date: getPastDate(10),
      timeSlot: '09:00',
      status: 'completed',
      reason: 'Routine cardiovascular checkup and occasional heart palpitations',
      prescription: {
        symptoms: 'Slight shortness of breath, mild chest tightness',
        diagnosis: 'Mild hypertension and stress-induced palpitations',
        medicines: [
          {
            name: 'Amlodipine 5mg',
            dosage: '0-0-1',
            duration: '30 days',
            notes: 'Take before going to bed'
          },
          {
            name: 'Metoprolol 25mg',
            dosage: '1-0-0',
            duration: '14 days',
            notes: 'Take after breakfast'
          }
        ],
        advice: 'Reduce daily sodium intake, avoid high stress activities, walk 30 minutes daily, and return if palpitations persist.'
      }
    });

    // Completed Appointment 2 (Agash & Dr. Sarah - Pediatrics/Allergies)
    const app2 = await Appointment.create({
      patient: patientUser._id,
      doctor: docSarahProfile._id,
      date: getPastDate(30),
      timeSlot: '11:00',
      status: 'completed',
      reason: 'Severe allergic reaction to dust and pollen during spring',
      prescription: {
        symptoms: 'Runny nose, persistent sneezing, red watery eyes',
        diagnosis: 'Acute Seasonal Allergic Rhinitis',
        medicines: [
          {
            name: 'Cetirizine 10mg',
            dosage: '0-0-1',
            duration: '7 days',
            notes: 'Take at night, may cause drowsiness'
          },
          {
            name: 'Fluticasone Nasal Spray',
            dosage: '1 spray each nostril',
            duration: '10 days',
            notes: 'Use once daily in the morning'
          }
        ],
        advice: 'Avoid outdoors during peak pollen hours, keep windows closed, use air purifier, wash clothes immediately after coming from outside.'
      }
    });

    // Completed Appointment 3 (Michael Chen & Dr. John - Cardiology)
    const app3 = await Appointment.create({
      patient: patientMichaelUser._id,
      doctor: doctorProfile._id,
      date: getPastDate(15),
      timeSlot: '14:00',
      status: 'completed',
      reason: 'Chest discomfort during exercise',
      prescription: {
        symptoms: 'Mild substernal chest discomfort resolving with rest',
        diagnosis: 'Stable Angina - Rule out ischemia',
        medicines: [
          {
            name: 'Aspirin 81mg',
            dosage: '1-0-0',
            duration: 'Continuous',
            notes: 'Take with meal'
          },
          {
            name: 'Atorvastatin 20mg',
            dosage: '0-0-1',
            duration: 'Continuous',
            notes: 'Take at night'
          }
        ],
        advice: 'Scheduled stress test. Avoid heavy lifting. Seek immediate care for severe pain.'
      }
    });

    // Confirmed/Upcoming Appointment 1 (Agash & Dr. John - Cardiology)
    const app4 = await Appointment.create({
      patient: patientUser._id,
      doctor: doctorProfile._id,
      date: getFutureDate(3),
      timeSlot: '10:00',
      status: 'confirmed',
      reason: 'Follow-up visit to review cardiovascular progress and check blood pressure'
    });

    // Pending Appointment 2 (Agash & Dr. David - Dermatology)
    const app5 = await Appointment.create({
      patient: patientUser._id,
      doctor: docDavidProfile._id,
      date: getFutureDate(5),
      timeSlot: '14:00',
      status: 'pending',
      reason: 'Consultation for itchy red skin rashes on forearm'
    });

    // Cancelled Appointment (Agash & Dr. John - Cardiology)
    const app6 = await Appointment.create({
      patient: patientUser._id,
      doctor: doctorProfile._id,
      date: getPastDate(5),
      timeSlot: '15:00',
      status: 'cancelled',
      reason: 'Urgent work meeting scheduled, requested to cancel'
    });

    // Confirmed Appointment (Emily Rose & Dr. Sarah - Pediatrics)
    const app7 = await Appointment.create({
      patient: patientEmilyUser._id,
      doctor: docSarahProfile._id,
      date: getFutureDate(2),
      timeSlot: '09:00',
      status: 'confirmed',
      reason: 'Regular developmental checkup for infant'
    });

    // 5. Create Invoices
    console.log('Creating Invoices...');
    
    // Invoice 1 (Paid - App 1)
    await Invoice.create({
      patient: patientUser._id,
      appointment: app1._id,
      services: [
        { name: 'Cardiology Consultation', cost: 150 },
        { name: 'Electrocardiogram (ECG)', cost: 50 }
      ],
      tax: 5,
      discount: 20,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      issuedDate: getPastDate(10),
      paidDate: getPastDate(10)
    });

    // Invoice 2 (Paid - App 2)
    await Invoice.create({
      patient: patientUser._id,
      appointment: app2._id,
      services: [
        { name: 'Pediatric Allergy Consultation', cost: 100 }
      ],
      tax: 5,
      discount: 0,
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      issuedDate: getPastDate(30),
      paidDate: getPastDate(30)
    });

    // Invoice 3 (Unpaid - Upcoming App 4)
    await Invoice.create({
      patient: patientUser._id,
      appointment: app4._id,
      services: [
        { name: 'Follow-up Cardiology Visit', cost: 150 }
      ],
      tax: 5,
      discount: 0,
      paymentStatus: 'unpaid',
      paymentMethod: 'none',
      issuedDate: getFutureDate(3)
    });

    // Invoice 4 (Paid - App 3)
    await Invoice.create({
      patient: patientMichaelUser._id,
      appointment: app3._id,
      services: [
        { name: 'Cardiology Consultation', cost: 150 },
        { name: 'Echocardiogram', cost: 120 }
      ],
      tax: 5,
      discount: 50, // Insurance discount
      paymentStatus: 'paid',
      paymentMethod: 'insurance',
      issuedDate: getPastDate(15),
      paidDate: getPastDate(15)
    });

    // 6. Create Messages
    console.log('Creating Chat Messages...');
    
    const messages = [
      {
        sender: patientUser._id,
        receiver: doctorUser._id,
        content: 'Hello Dr. John, I wanted to ask if I should continue taking Amlodipine if my blood pressure remains stable?',
        createdAt: getPastDate(3)
      },
      {
        sender: doctorUser._id,
        receiver: patientUser._id,
        content: 'Hi Agash. Yes, you should continue the medication. Do not stop it abruptly. We will review your progress in our follow-up meeting in a few days.',
        createdAt: getPastDate(3),
        isRead: true
      },
      {
        sender: patientUser._id,
        receiver: doctorUser._id,
        content: 'Okay, I understand. I will see you on Monday for the checkup. Thank you!',
        createdAt: getPastDate(2),
        isRead: true
      },
      {
        sender: patientUser._id,
        receiver: docDavidUser._id,
        content: 'Dr. David, do I need to prepare anything before my skin consultation?',
        createdAt: getPastDate(1)
      },
      {
        sender: docDavidUser._id,
        receiver: patientUser._id,
        content: 'Hello, please try not to apply any creams or cosmetic lotions on the forearm rash on the day of the appointment. It will make examination easier.',
        createdAt: getPastDate(1),
        isRead: true
      }
    ];

    for (const msg of messages) {
      const createdMsg = await Message.create(msg);
      // Manually set createdAt for seeding historical timings
      createdMsg.createdAt = msg.createdAt;
      await createdMsg.save();
    }

    console.log('Database successfully seeded with realistic dummy data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
