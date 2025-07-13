const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');
const recommendationRoutes = require('./routes/recommendations');

const app = express();
app.use(cors());
app.use(express.json());

// Add root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Villa Ester Resort API is running!',
    endpoints: {
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      recommendations: '/api/recommendations'
    }
  });
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/recommendations', recommendationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 