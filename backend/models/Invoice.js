import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    services: [
      {
        name: {
          type: String,
          required: [true, 'Please add a service name'],
          trim: true,
        },
        cost: {
          type: Number,
          required: [true, 'Please add the service cost'],
          min: [0, 'Cost cannot be negative'],
        },
      },
    ],
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'partially-paid'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'insurance', 'none'],
      default: 'none',
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    paidDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save validation: compute totalAmount if not explicitly set
invoiceSchema.pre('validate', function (next) {
  if (this.services && this.services.length > 0) {
    const subtotal = this.services.reduce((acc, item) => acc + item.cost, 0);
    const taxAmount = subtotal * (this.tax / 100);
    this.totalAmount = subtotal + taxAmount - this.discount;
    if (this.totalAmount < 0) this.totalAmount = 0;
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
