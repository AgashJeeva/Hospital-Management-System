import express from 'express';
import {
  sendMessage,
  getMessages,
  getChatPartners,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, sendMessage);

router.route('/partners')
  .get(protect, getChatPartners);

router.route('/thread/:otherUserId')
  .get(protect, getMessages);

export default router;
