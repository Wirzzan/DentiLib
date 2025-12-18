const express = require('express')
const router = express.Router()
const userController = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')
 
 

router.post('/user/registerAdmin', userController.registerAdmin)
router.post('/user/login', userController.login)
router.delete('/user/delete',authMiddleware, userController.deleteUser)
 
module.exports = router
