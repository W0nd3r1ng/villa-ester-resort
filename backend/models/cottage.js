const mongoose = require('mongoose');

const cottageSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  capacity: Number,
  amenities: [String],
  image: String,
  available: Boolean,
  type: String
});

module.exports = mongoose.model('Cottage', cottageSchema); 