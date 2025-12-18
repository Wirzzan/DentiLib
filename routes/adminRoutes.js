const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.post('/user/createAccount', adminController.createAccount)
router.get("/user/allUsers", adminController.getAllUsers);
router.get("/user/:userId", adminController.getUserById);
router.post('/user/deleteAccount/:userId', adminController.deleteAccount)

module.exports = router