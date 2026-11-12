
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    addReading,
    getReadings,
    updateReading,
    deleteReading
} = require("../controllers/readingController");

// Add a reading
router.post("/", authenticateToken, addReading);

// Get all my readings
router.get("/", authenticateToken, getReadings);

// Update a reading
router.put("/:id", authenticateToken, updateReading);

// Delete a reading
router.delete("/:id", authenticateToken, deleteReading);

module.exports = router;
