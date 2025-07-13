const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { name, comment, image } = req.body;
    const review = new Review({ name, comment, image });
    await review.save();
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to submit review', error: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 }).limit(10);
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: err.message });
  }
}; 