const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {calculateTotalDeposits} = require("../controllers/walletController");

const router = express.Router();

// API to calculate total deposits
router.get("/total-deposits", authenticateToken, calculateTotalDeposits);




module.exports = router;
