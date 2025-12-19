const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/actes", adminController.getAllActes); 
router.post("/createActe", adminController.createActe); 


router.get("/user/allUsers", adminController.getAllUsers);
router.get("/user/allUsers/noAdmin", adminController.getAllUsersWithoutAdmin); 
router.get("/user/dentistes", adminController.getAllDentistes); 
router.post("/user/createAccount", adminController.createAccount);
router.post("/user/deleteAccount/:userId", adminController.deleteAccount);
router.get("/user/:userId", adminController.getUserById);


module.exports = router;
