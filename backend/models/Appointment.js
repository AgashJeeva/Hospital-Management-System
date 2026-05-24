import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please select an appointment date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a time slot'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the appointment'],
      trim: true,
    },
    prescription: {
      symptoms: {
        type: String,
        trim: true,
      },
      diagnosis: {
        type: String,
        trim: true,
      },
      medicines: [
        {
          name: { type: String, required: true },
          dosage: { type: String, required: true }, // e.g., "1-0-1" or "Once daily"
          duration: { type: String, required: true }, // e.g., "5 days" or "1 week"
          notes: { type: String }, // e.g., "Take after food"
        },
      ],
      advice: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
