import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'staff'), createInvoice)
  .get(protect, getInvoices);

router.route('/:id')
  .get(protect, getInvoiceById);

router.route('/:id/status')
  .put(protect, authorize('admin', 'staff'), updateInvoiceStatus);

export default router;
