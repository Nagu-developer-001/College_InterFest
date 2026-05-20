require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());



// Connect to MongoDB for Authentication & Persistence
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected successfully!"))
  .catch(err => console.error("Database connection error:", err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.get('/', (req, res) => {
    res.send('Nova Nexus API is running...');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));