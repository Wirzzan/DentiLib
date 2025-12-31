const express = require("express");
const router = express.Router();
const prothesistController = require("../controllers/prothesistController");
const authMiddleware = require("../middlewares/authMiddleware");

const prothesisteOnly = (req, res, next) => {
  if (req.user.role !== "PROTHESISTE") {
    return res.status(403).json({ message: "Accès réservé aux prothésistes" });
  }
  next();
};

//worsheets accueil
router.get('/worksheets', authMiddleware, prothesisteOnly, prothesistController.getAllProtoWorkSheets);
router.get('/worksheets/:id', authMiddleware, prothesisteOnly, prothesistController.getProtoWorkSheetById);
router.put('/worksheets/update/:id', authMiddleware, prothesisteOnly, prothesistController.updateProtoSection);


//actes
router.get("/acts/admin", authMiddleware, prothesisteOnly, prothesistController.getAllAdminActs);
router.get("/acts/my", authMiddleware, prothesisteOnly, prothesistController.getMyActs);
router.post("/acts/add", authMiddleware, prothesisteOnly, prothesistController.addActToProthesiste );
router.put("/acts/update/:actId", authMiddleware, prothesisteOnly, prothesistController.updateActPrice );
router.delete("/acts/delete/:actId", authMiddleware, prothesisteOnly, prothesistController.deleteAct);

module.exports = router;
