const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const bookingRoutes = require('./routes/bookings');
const cottageRoutes = require('./routes/cottages');
const recommendationRoutes = require('./routes/recommendations');
const reviewRoutes = require('./routes/reviews');

const app = express();
app.use(cors());
app.use(express.json());

// Add root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Villa Ester Resort API is running!',
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 