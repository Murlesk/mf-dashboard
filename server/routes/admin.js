const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Защищённый маршрут для создания пользователей
router.post('/create-user', auth, createUser);

module.exports = router;