import express from 'express';
import {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
} from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getDoctors);
router.route('/:id').get(getDoctorById).put(protect, updateDoctorProfile);

export default router;
