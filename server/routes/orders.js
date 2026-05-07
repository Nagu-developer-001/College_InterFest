const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Ensure this path is correct
const authMiddleware = require('../middleware/auth'); 

// 1. GET isolated orders for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        // req.user.id is populated by your authMiddleware
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// 2. POST and store isolated orders
router.post('/chat', authMiddleware, async (req, res) => {
    const { message } = req.body;
    const msg = message.toLowerCase();
    
    // FIX: Use the actual ID from the token, no dummy fallbacks
    const userId = req.user.id; 

    try {
        // --- 1. INTENT: QUALITY LOG ---
        if (msg.includes('quality') || msg.includes('inspection')) {
            const idMatch = message.match(/#?(\d+)/); 
            if (idMatch) {
                const updatedOrder = await Order.findOneAndUpdate(
                    { id: parseInt(idMatch[1]), user: userId }, // Ensure user owns the order
                    { $push: { qualityNotes: { text: message, timestamp: new Date() } } },
                    { new: true }
                );
                if (updatedOrder) return res.json({ msg: "Quality log added", order: updatedOrder });
            }
        }

        // --- 2. INTENT: UPDATE STATUS ---
        if (msg.includes('mark') || msg.includes('status')) {
            const idMatch = message.match(/#?(\d+)/);
            const newStatus = msg.includes('accepted') ? 'Accepted' : 
                              msg.includes('completed') ? 'Completed' : 'Processing';
            if (idMatch) {
                const updatedOrder = await Order.findOneAndUpdate(
                    { id: parseInt(idMatch[1]), user: userId }, // Ensure user owns the order
                    { status: newStatus },
                    { new: true }
                );
                if (updatedOrder) return res.json({ msg: "Status updated", order: updatedOrder });
            }
        }

        // --- 3. INTENT: CREATE ORDER ---
        const quantityMatch = message.match(/\d+/);
        const quantity = quantityMatch ? parseInt(quantityMatch[0]) : 100;

        let deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        const dateRegex = /(?:by\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i;
        const dateMatch = message.match(dateRegex);

        if (dateMatch) {
            const month = monthNames.indexOf(dateMatch[1].toLowerCase());
            const day = parseInt(dateMatch[2]);
            deadline = new Date(new Date().getFullYear(), month, day);
            if (deadline < new Date()) deadline.setFullYear(deadline.getFullYear() + 1);
        }

        let material = msg.includes("titanium") ? "Titanium" : msg.includes("aluminum") ? "Aluminum" : "Steel";
        const partName = message.split(/need|order for/i)[1]?.split(/by|delivered/i)[0].replace(/\d+/g, '').trim() || "New Component";

        const newOrder = new Order({
            id: Math.floor(Math.random() * 9000) + 1000,
            partName,
            material,
            quantity,
            status: "Received",
            deadline,
            user: userId // SAVING THE ACTUAL LOGGED IN USER ID
        });

        await newOrder.save();
        return res.json({ msg: "Order created", order: newOrder });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;