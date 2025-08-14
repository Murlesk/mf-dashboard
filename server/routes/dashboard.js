const express = require('express');
const router = express.Router();
const { getTestData } = require('../controllers/userDataController');

// Защищенный маршрут для получения тестовых данных
router.get('/test-data', getTestData);

module.exports = router;