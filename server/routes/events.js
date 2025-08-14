const express = require('express');
const router = express.Router();
const { getEventsList } = require('../controllers/eventsController');
const auth = require('../middleware/auth');

// Защищённый маршрут для получения списка мероприятий
router.get('/list', auth, getEventsList);

module.exports = router;