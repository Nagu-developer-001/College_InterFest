require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // Use a clean email
        const email = "naga@test.com";
        
        await User.deleteMany({ email });

        // Let the MODEL handle the hashing
        const newUser = new User({
            email: email,
            password: "password123" 
        });

        await newUser.save();
        console.log("SUCCESS: User 'admin@test.com' created with 'password123'");
        process.exit();
    } catch (err) {
        console.error("Seed failed:", err);
        process.exit(1);
    }
};

seedUser();
seedUser();