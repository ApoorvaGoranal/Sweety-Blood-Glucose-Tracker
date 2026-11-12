
const pool = require("../config/database");

// DAILY REPORT
const getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: "Please provide a valid date in YYYY-MM-DD format"
            });
        }

        const readings = await pool.query(
            `SELECT id, reading_date, slot, value
             FROM readings
             WHERE user_id = $1 AND reading_date = $2
             ORDER BY
                CASE slot
                    WHEN 'Morning fasting' THEN 1
                    WHEN 'After breakfast' THEN 2
                    WHEN 'After lunch' THEN 3
                    WHEN 'After dinner' THEN 4
                END`,
            [req.user.id, date]
        );

        const stats = await pool.query(
            `SELECT
                MAX(value) AS highest,
                MIN(value) AS lowest,
                ROUND(AVG(value), 1) AS average,
                COUNT(*) AS count
             FROM readings
             WHERE user_id = $1 AND reading_date = $2`,
            [req.user.id, date]
        );

        res.json({
            reportType: "Daily",
            date,
            readings: readings.rows,
            statistics: stats.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Daily report failed",
            error: error.message
        });
    }
};

// CURRENT MONTH REPORT
const getMonthlyReport = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                MAX(value) AS highest,
                MIN(value) AS lowest,
                ROUND(AVG(value), 1) AS average,
                COUNT(*) AS count
             FROM readings
             WHERE user_id = $1
             AND reading_date >= date_trunc('month', CURRENT_DATE)::date
             AND reading_date <= CURRENT_DATE`,
            [req.user.id]
        );

        res.json({
            reportType: "Month-to-date",
            statistics: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Monthly report failed",
            error: error.message
        });
    }
};

// PREVIOUS FULL MONTH REPORT
const getPreviousMonthReport = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                MAX(value) AS highest,
                MIN(value) AS lowest,
                ROUND(AVG(value), 1) AS average,
                COUNT(*) AS count
             FROM readings
             WHERE user_id = $1
             AND reading_date >=
                (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month')::date
             AND reading_date <
                date_trunc('month', CURRENT_DATE)::date`,
            [req.user.id]
        );

        res.json({
            reportType: "Previous month",
            statistics: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Previous month report failed",
            error: error.message
        });
    }
};

module.exports = {
    getDailyReport,
    getMonthlyReport,
    getPreviousMonthReport
};
