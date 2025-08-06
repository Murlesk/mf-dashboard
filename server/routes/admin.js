const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/adminController');
const auth = require('../middlewares/auth');

// Защищённый маршрут для создания пользователей
router.post('/create-user', auth, createUser);

module.exports = router;