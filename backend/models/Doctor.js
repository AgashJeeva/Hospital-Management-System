import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: [true, 'Please add a specialty'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Please add qualifications'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Please add years of experience'],
      min: [0, 'Experience cannot be negative'],
    },
    biography: {
      type: String,
      trim: true,
    },
    fees: {
      type: Number,
      required: [true, 'Please add consultation fees'],
      min: [0, 'Fees cannot be negative'],
      default: 0,
    },
    availability: [
      {
        day: {
          type: String,
          required: true,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
        },
        slots: {
          type: [String], // Array of active slots e.g. ["09:00", "09:30", "10:00"]
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
