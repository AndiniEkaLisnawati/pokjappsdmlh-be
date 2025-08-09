const express = require('express')
const router = express.Router();
const path = require('path')
const authController = require('../controllers/auth')

router.post('/login', authController.login);
module.exports = router;