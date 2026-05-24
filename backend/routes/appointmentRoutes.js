import express from 'express';
import {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  addPrescription,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, bookAppointment)
  .get(protect, getAppointments);

router.route('/:id')
  .get(protect, getAppointmentById);

router.route('/:id/status')
  .put(protect, updateAppointmentStatus);

router.route('/:id/prescription')
  .put(protect, authorize('doctor'), addPrescription);

export default router;
