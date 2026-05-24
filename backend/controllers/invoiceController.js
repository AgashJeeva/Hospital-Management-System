import Invoice from '../models/Invoice.js';
import Appointment from '../models/Appointment.js';

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private (Staff/Admin)
export const createInvoice = async (req, res) => {
  const { patient, appointment, services, tax, discount } = req.body;

  try {
    const invoice = new Invoice({
      patient,
      appointment,
      services,
      tax,
      discount,
    });

    const savedInvoice = await invoice.save();

    // If an appointment was linked, let's update it in some way or log
    res.status(201).json({ success: true, data: savedInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get invoices based on role
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }
    // Admin & Staff see all invoices

    const invoices = await Invoice.find(query)
      .populate('patient', 'name email phone')
      .populate({
        path: 'appointment',
        select: 'date timeSlot reason status',
        populate: {
          path: 'doctor',
          populate: { path: 'user', select: 'name' }
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'name email phone gender dob')
      .populate({
        path: 'appointment',
        select: 'date timeSlot reason status',
        populate: {
          path: 'doctor',
          populate: { path: 'user', select: 'name' }
        }
      });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Access check: Patients can only view their own invoices
    if (req.user.role === 'patient' && invoice.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update invoice payment status
// @route   PUT /api/invoices/:id/status
// @access  Private (Staff/Admin)
export const updateInvoiceStatus = async (req, res) => {
  const { paymentStatus, paymentMethod } = req.body;

  if (!['unpaid', 'paid', 'partially-paid'].includes(paymentStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid payment status' });
  }

  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.paymentStatus = paymentStatus;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;

    if (paymentStatus === 'paid') {
      invoice.paidDate = Date.now();
    } else {
      invoice.paidDate = undefined;
    }

    const updatedInvoice = await invoice.save();

    res.json({ success: true, data: updatedInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
