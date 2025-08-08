const express = require('express');
const router = express.Router();
const { getUserPermissions } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/permissions', auth, getUserPermissions);

module.exports = router;