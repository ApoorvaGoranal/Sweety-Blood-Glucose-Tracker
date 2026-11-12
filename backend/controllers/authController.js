
const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// USER SIGNUP
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name.trim(), email.toLowerCase().trim(), hashedPassword]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "Registration successful",
            user,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

// USER LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

module.exports = { register, login };
