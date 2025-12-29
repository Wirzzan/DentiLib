const express = require('express');
const router = express.Router();
const dentistController = require('../controllers/dentistController');
const authMiddleware = require('../middlewares/authMiddleware');

const dentistOnly = (req, res, next) => {
  if (req.user.role !== 'DENTISTE') {
    return res.status(403).json({ message: "Accès réservé aux dentistes" });
  }
  next();
};

router.get('/worksheets', authMiddleware, dentistOnly, dentistController.getAllWorkSheets);
router.get('/worksheets/:id', authMiddleware, dentistOnly, dentistController.getWorkSheetById);
router.post('/worksheets/create', authMiddleware, dentistOnly, dentistController.createWorkSheet);
router.put('/worksheets/update/:id', authMiddleware, dentistOnly, dentistController.updateWorkSheet);
router.put('/worksheets/send/:id', authMiddleware, dentistOnly, dentistController.sendWorkSheet);
router.delete('/worksheets/delete/:id', authMiddleware, dentistOnly, dentistController.deleteWorkSheet);

module.exports = router;
