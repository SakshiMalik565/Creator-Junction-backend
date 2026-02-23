import mongoose from 'mongoose';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import User from '../models/User.js';

const getRecipientId = async ({ recipientId, recipientEmail }) => {
  if (recipientId) {
    if (mongoose.Types.ObjectId.isValid(recipientId)) {
      return recipientId;
    }

    const userByEmail = await User.findOne({ email: recipientId });
    if (userByEmail?._id) return userByEmail._id;
  }

  if (!recipientEmail) return null;

  const user = await User.findOne({ email: recipientEmail });
  return user?._id || null;
};

const getOrCreateConversation = async (user1, user2) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [user1, user2] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [user1, user2]
    });
  }

  return conversation;
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    }).populate('participants', 'name email').populate('lastMessage');
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p) => !p._id.equals(req.user._id)
        );
        return {
          _id: conv._id,
          participant: otherParticipant,
          lastMessage: conv.lastMessage,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const createConversation = async (req, res) => {
  try {
    const recipientId = await getRecipientId(req.body || {});

    if (!recipientId) {
      return res.status(400).json({ message: "Recipient not found" });
    }

    const conversation = await getOrCreateConversation(
      req.user._id,
      recipientId
    );

    res.json(conversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, receiverId } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim()
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      $addToSet: { message: message._id }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};