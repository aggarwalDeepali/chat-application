require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }
});

global.io = io;

io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('sendMessage', () => {
    io.emit('receiveMessage');
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Create Uploads directory if it doesn't exist
const uploadDir = './Uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages'); 
const userRoutes = require('./routes/user');
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes); 
app.use('/api/users', userRoutes); 

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });
  res.status(500).json({ msg: 'Server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
  console.log('Backend is operational');
});
