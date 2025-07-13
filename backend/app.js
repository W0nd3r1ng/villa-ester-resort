const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const bookingRoutes = require('./routes/bookingRoutes');
const cottageRoutes = require('./routes/cottages');
const recommendationRoutes = require('./routes/recommendations');
const reviewRoutes = require('./routes/reviews');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Add root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Villa Ester Resort API is running! (Updated with CORS fixes)',
    endpoints: {
      cottages: '/api/cottages',
      bookings: '/api/bookings',
      recommendations: '/api/recommendations',
      reviews: '/api/reviews'
    }
  });
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/bookings', bookingRoutes);
app.use('/api/cottages', cottageRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/uploads', express.static('uploads'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join booking room for real-time updates
  socket.on('join-booking-room', (bookingId) => {
    socket.join(`booking-${bookingId}`);
    console.log(`Client ${socket.id} joined booking room: ${bookingId}`);
  });
  
  // Handle booking updates
  socket.on('booking-update', (data) => {
    io.to(`booking-${data.bookingId}`).emit('booking-updated', data);
  });
  
  // Handle new bookings
  socket.on('new-booking', (data) => {
    io.emit('booking-created', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 