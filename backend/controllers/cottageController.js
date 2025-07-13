const Cottage = require('../models/cottage');

exports.getAllCottages = async (req, res) => {
  try {
    const cottages = await Cottage.find();
    res.json({
      success: true,
      data: cottages,
      message: 'Cottages fetched successfully'
    });
  } catch (err) {
    console.error('Error fetching cottages:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch cottages',
      error: err.message 
    });
  }
}; 