
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/reports", reportRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Sweety Blood Glucose Tracker API is running!");
});

// Database health check
app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            message: "Server and PostgreSQL are connected successfully!"
        });
    } catch (error) {
        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sweety server running on port ${PORT}`);
});
