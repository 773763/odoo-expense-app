// server/models/expenseModel.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Linking to the User who submitted it
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true, // e.g., "USD", "EUR"
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  expenseDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  comments: {
    type: String,
  },
  // --- Fields for Currency Conversion ---
  companyBaseCurrency: {
    type: String,
    required: true, // e.g., "INR"
  },
  amountInCompanyCurrency: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;