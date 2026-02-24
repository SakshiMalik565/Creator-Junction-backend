
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import "dotenv/config"
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import assetRoutes from "./routes/assetRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentRoutes from "./routes/paymentRoute.js";
import Conversation from "./models/conversation.js";
import Message from "./models/message.js";
import User from "./models/User.js";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);


connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/payments", paymentRoutes);

const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

const resolveUserId = async (value) => {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) return value;
  const user = await User.findOne({ email: value });
  return user?._id?.toString() || null;
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

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    if (!userId) return;
    socket.userId = userId.toString();
    socket.join(socket.userId);
  });

  socket.on("fetch_conversations", async (payload) => {
    try {
      const rawUserId = payload?.userId || socket.userId;
      const userId = await resolveUserId(rawUserId);
      if (!userId) {
        socket.emit("conversations", []);
        return;
      }

      const conversations = await Conversation.find({
        participants: userId
      }).populate("participants", "name email");

      const enriched = await Promise.all(
        conversations.map(async (conversation) => {
          const lastMessage = await Message.findOne({
            conversation: conversation._id
          }).sort({ createdAt: -1 });

          return {
            ...conversation.toObject(),
            lastMessage: lastMessage ? lastMessage.text : null,
            updatedAt: lastMessage?.createdAt || conversation.updatedAt || new Date()
          };
        })
      );

      socket.emit("conversations", enriched);
    } catch (error) {
      socket.emit("conversations", []);
    }
  });

  socket.on("fetch_messages", async (payload) => {
    try {
      const conversationId = payload?.conversationId;
      if (!conversationId) {
        socket.emit("messages", []);
        return;
      }
      const messages = await Message.find({ conversation: conversationId })
        .sort({ createdAt: 1 });
      socket.emit("messages", messages);
    } catch {
      socket.emit("messages", []);
    }
  });

  socket.on("create_conversation", async (payload) => {
    try {
      const senderRawId = payload?.senderId || socket.userId;
      const senderId = await resolveUserId(senderRawId);
      const recipientRawId = payload?.recipientId || payload?.recipientEmail;
      const recipientId = await resolveUserId(recipientRawId);

      if (!senderId || !recipientId) {
        socket.emit("conversation_error", { message: "Recipient not found" });
        return;
      }

      const conversation = await getOrCreateConversation(senderId, recipientId);
      const populated = await Conversation.findById(conversation._id)
        .populate("participants", "name email");

      const payloadData = {
        ...populated.toObject(),
        lastMessage: null,
        updatedAt: new Date()
      };

      io.to(senderId.toString()).emit("conversation_created", payloadData);
      io.to(recipientId.toString()).emit("conversation_created", payloadData);
    } catch (error) {
      socket.emit("conversation_error", { message: error.message });
    }
  });

  socket.on("send_message", async (payload) => {
    try {
      const conversationId = payload?.conversationId;
      const senderId = await resolveUserId(payload?.senderId || socket.userId);
      const receiverId = await resolveUserId(payload?.receiverId);
      const text = payload?.text || payload?.content;
      const clientId = payload?.clientId;

      if (!conversationId || !senderId || !receiverId || !text?.trim()) {
        return;
      }

      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        receiver: receiverId,
        text: text.trim(),
        status: "sent"
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        $addToSet: { message: message._id }
      });

      const messagePayload = {
        ...message.toObject(),
        clientId
      };

      io.to(senderId.toString()).emit("message_sent", messagePayload);
      io.to(receiverId.toString()).emit("message_received", messagePayload);
    } catch {
      // ignore
    }
  });

  socket.on("typing", (payload) => {
    const receiverId = payload?.receiverId;
    const senderId = payload?.senderId || socket.userId;
    if (!receiverId || !senderId) return;
    io.to(receiverId.toString()).emit("typing", { senderId });
  });
});

server.listen(port, () => {
  console.log("Server running on port", port);
});