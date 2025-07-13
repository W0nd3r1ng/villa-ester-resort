const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  comment: { type: String, required: true },
  image: { type: String, default: 'reviewer1.jpg' }, // default reviewer image
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema); 