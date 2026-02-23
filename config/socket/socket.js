const { deductToken } = require('../services/tokenService');
const Message = require('../models/Message');
const { getOrCreateConversation } = require('../services/conversationService');

const initializeSocket = (server) => {
    const io = require('socket.io')(server, {   
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected', socket.id);

        socket.on('joinRoom', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their room`);
        });
        socket.on('Register', (userId) => {
            if (!userId) return;
            socket.join(userId);
            console.log(`User ${userId} registered and joined their room`);
        });
        socket.on('typing', (senderId, receiverId) => {
            if (!receiverId) return;
            socket.to(receiverId).emit('typing', senderId);
        });

        socket.on("sendMessage", async (data) => {
            try {
                const { senderId, receiverId, text } = data;

                if (!senderId || !receiverId || !text) return;

                await deductToken(senderId, 1);

                const conversation = await getOrCreateConversation(senderId, receiverId);

                const newMessage = await Message.create({
                    conversationId: conversation._id,
                    sender: senderId,
                    receiver: receiverId,
                    text,
                    status: "sent"
                });
                conversation.lastMessage = newMessage._id;
                await conversation.save();
                socket.to(receiverId).emit('newMessage', newMessage);

                socket.emit('messageSent', newMessage);

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', 'Failed to send message');
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });
};

module.exports = initializeSocket;