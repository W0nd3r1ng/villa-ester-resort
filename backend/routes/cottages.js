const express = require('express');
const router = express.Router();
const cottageController = require('../controllers/cottageController');

router.get('/', cottageController.getAllCottages);
// Add more endpoints as needed

module.exports = router; 