const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware")

router.use(authMiddleware);
router.use(roleMiddleware(["ADMIN"]));

router.get("/user/allUsers", adminController.getAllUsers);
router.get("/user/allUsers/noAdmin", adminController.getAllUsersWithoutAdmin); 
router.get("/user/dentistes", adminController.getAllDentistes); 
router.get("/user/dentistes/notAssociated", adminController.getDentistesNotAssociated); 
router.post("/user/createAccount", adminController.createAccount);
router.put("/user/updateAccount/:userId", adminController.updateAccount);
router.delete("/user/deleteAccount/:userId", adminController.deleteAccount);
router.get("/user/:userId", adminController.getUserById);


module.exports = router;
