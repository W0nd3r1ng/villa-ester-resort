const Cottage = require('../models/cottage');

exports.getAllCottages = async (req, res) => {
  try {
    const cottages = await Cottage.find();
    res.json(cottages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cottages' });
  }
}; 