import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      relation: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    medicalHistory: [
      {
        condition: {
          type: String,
          required: true,
          trim: true,
        },
        diagnosedDate: {
          type: Date,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
