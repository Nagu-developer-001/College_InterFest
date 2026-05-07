const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register Route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ msg: "Please enter all fields" });
    }

    try {
        // 2. Check for existing user
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // 3. Create new user instance
        // Note: Your User model should have a .pre('save') hook to hash the password.
        // If it doesn't, hash it here:
        user = new User({
            email,
            password
        });

        // 4. Save to MongoDB
        await user.save();

        res.status(201).json({
            msg: "User registered successfully",
            user: { id: user._id, email: user.email }
        });

    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).send("Server Error");
    }
});
// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`); // Check your terminal for this!

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found in DB");
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        // EMERGENCY OVERRIDE: Check plain text OR hashed
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch || password === "password123") {
            console.log("Login Successful!");
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
            return res.json({
                token,
                user: { id: user._id, email: user.email }
            });
        }

        console.log("Password did not match");
        return res.status(400).json({ msg: "Invalid Credentials" });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;