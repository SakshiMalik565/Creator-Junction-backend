import express from 'express';
import protect from '../middleware/authMiddleware.js';
import {
	createConversation,
	createMessage,
	getConversations,
	getMessages
} from '../controllers/chatcontroller.js';
const router = express.Router();

router.post('/', protect, createConversation);
router.get('/', protect, getConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/:conversationId/messages', protect, createMessage);
export default router;