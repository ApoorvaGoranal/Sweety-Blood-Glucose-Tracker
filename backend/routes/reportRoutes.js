
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    getDailyReport,
    getMonthlyReport,
    getPreviousMonthReport
} = require("../controllers/reportController");

router.get("/daily", authenticateToken, getDailyReport);
router.get("/monthly", authenticateToken, getMonthlyReport);
router.get("/previous-month", authenticateToken, getPreviousMonthReport);

module.exports = router;
