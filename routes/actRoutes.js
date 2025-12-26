const express = require('express')
const router = express.Router()
const actController = require('../controllers/actController')

router.get('/act/getAllActs', actController.getAllActes)
router.post('/act/create', actController.createActe)
router.put('/act/update/:acteId', actController.updateActe)
router.delete('/act/delete/:acteId', actController.deleteActe)

module.exports = router

