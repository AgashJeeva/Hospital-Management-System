import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;

  try {
    // 1. Verify receiver exists
    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    // 2. Create message
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    // Populate sender details for immediate display
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chat thread with another user
// @route   GET /api/messages/thread/:otherUserId
// @access  Private
export const getMessages = async (req, res) => {
  const { otherUserId } = req.params;

  try {
    // Find all messages between the logged-in user and the other user
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 }); // Sort by time ascending (older first)

    // Mark all received messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get users that have chatted with current user
// @route   GET /api/messages/partners
// @access  Private
export const getChatPartners = async (req, res) => {
  try {
    // Find unique user IDs that the current user has sent messages to or received messages from
    const sentTo = await Message.distinct('receiver', { sender: req.user._id });
    const receivedFrom = await Message.distinct('sender', { receiver: req.user._id });

    // Combine and deduplicate
    const partnerIds = [...new Set([...sentTo, ...receivedFrom])];

    // Fetch user details for those IDs
    const partners = await User.find({ _id: { $in: partnerIds } }).select(
      'name email role avatar'
    );

    res.json({ success: true, data: partners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
