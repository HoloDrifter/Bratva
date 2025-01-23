const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {calculateTotalDeposits, addDeposit} = require("../controllers/walletController");

const router = express.Router();

// API to calculate total deposits
router.get("/total-deposits", authenticateToken, calculateTotalDeposits);


router.post("/deposit", authenticateToken, addDeposit);


module.exports = router;
