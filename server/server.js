// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Load env vars FIRST
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware to accept JSON data
app.use(cors());
app.use(express.json());

// A simple route to check if the API is up
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Define Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running successfully on port ${PORT}`);
});