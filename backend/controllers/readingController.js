
const pool = require("../config/database");

const validSlots = [
    "Morning fasting",
    "After breakfast",
    "After lunch",
    "After dinner"
];

// ADD READING
const addReading = async (req, res) => {
    try {
        const { reading_date, slot, value } = req.body;

        if (!reading_date || !slot || value === undefined || value === null || value === "") {
            return res.status(400).json({
                message: "Date, slot and glucose value are required"
            });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }

        const date = new Date(reading_date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (Number.isNaN(date.getTime()) ||
            date.getFullYear() !== Number(reading_date.slice(0, 4)) ||
            date.getMonth() + 1 !== Number(reading_date.slice(5, 7)) ||
            date.getDate() !== Number(reading_date.slice(8, 10))) {
            return res.status(400).json({
                message: "Invalid reading date"
            });
        }

        if (date > today) {
            return res.status(400).json({
                message: "Future dates are not allowed"
            });
        }

        if (!validSlots.includes(slot)) {
            return res.status(400).json({
                message: "Invalid reading slot"
            });
        }

        if (!Number.isInteger(Number(value)) ||
            Number(value) < 40 || Number(value) > 600) {
            return res.status(400).json({
                message: "Glucose value must be a whole number between 40 and 600"
            });
        }

        const result = await pool.query(
            `INSERT INTO readings (user_id, reading_date, slot, value)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id, reading_date, slot, Number(value)]
        );

        res.status(201).json({
            message: "Reading added successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A reading already exists for this date and slot"
            });
        }

        res.status(500).json({
            message: "Could not add reading",
            error: error.message
        });
    }
};

// VIEW MY READINGS
const getReadings = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, reading_date, slot, value, created_at
             FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, id DESC`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: "Could not fetch readings",
            error: error.message
        });
    }
};

// UPDATE READING
const updateReading = async (req, res) => {
    try {
        const { id } = req.params;
        const { reading_date, slot, value } = req.body;

        if (!reading_date || !slot || value === undefined || value === null || value === "") {
            return res.status(400).json({
                message: "Date, slot and glucose value are required"
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }

        const date = new Date(reading_date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (Number.isNaN(date.getTime()) ||
            date.getFullYear() !== Number(reading_date.slice(0, 4)) ||
            date.getMonth() + 1 !== Number(reading_date.slice(5, 7)) ||
            date.getDate() !== Number(reading_date.slice(8, 10))) {
            return res.status(400).json({
                message: "Invalid reading date"
            });
        }

        if (date > today) {
            return res.status(400).json({
                message: "Future dates are not allowed"
            });
        }

        if (!validSlots.includes(slot)) {
            return res.status(400).json({
                message: "Invalid reading slot"
            });
        }

        if (!Number.isInteger(Number(value)) ||
            Number(value) < 40 || Number(value) > 600) {
            return res.status(400).json({
                message: "Glucose value must be a whole number between 40 and 600"
            });
        }

        const result = await pool.query(
            `UPDATE readings
             SET reading_date = $1, slot = $2, value = $3
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [reading_date, slot, Number(value), id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found"
            });
        }

        res.json({
            message: "Reading updated successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A reading already exists for this date and slot"
            });
        }

        res.status(500).json({
            message: "Could not update reading",
            error: error.message
        });
    }
};

// DELETE READING
const deleteReading = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found"
            });
        }

        res.json({
            message: "Reading deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not delete reading",
            error: error.message
        });
    }
};

module.exports = {
    addReading,
    getReadings,
    updateReading,
    deleteReading
};
