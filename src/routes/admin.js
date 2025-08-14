const express = require('express');
const {verifyAdmin, verifyToken} = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/admin/dashboard', verifyToken, verifyAdmin, (req, res) => {
    res.json({message : "welcome Admin!"})
}) 

module.exports = router;