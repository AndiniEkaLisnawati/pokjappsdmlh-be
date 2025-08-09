const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { verifyAdmin, verifyToken } = require('../middleware/authMiddleware');

router.get('/',verifyAdmin,verifyToken, userController.getAllUsers);

router.post('/', userController.createUser);

module.exports = router;