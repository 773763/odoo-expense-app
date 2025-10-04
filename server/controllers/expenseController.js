const axios = require('axios');
const User = require('../models/userModel');
const Expense = require('../models/expenseModel');

// === SUBMIT EXPENSE (Employee) ===
const submitExpense = async (req, res) => {
  const { amount, currency, category, description } = req.body;
  if (!amount || !currency || !category) {
    return res.status(400).json({ msg: 'Amount, currency, and category are required.' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.company || !user.company.baseCurrency) {
      return res.status(400).json({ msg: 'User does not have company base currency configured.' });
    }
    const companyBaseCurrency = user.company.baseCurrency;
    const upperCaseCurrency = currency.toUpperCase();
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${upperCaseCurrency}`);
    const conversionRate = response.data.rates[companyBaseCurrency];
    if (!conversionRate) {
      return res.status(400).json({ msg: `Conversion for '${upperCaseCurrency}' to '${companyBaseCurrency}' not available.` });
    }
    const convertedAmount = amount * conversionRate;
    const expense = new Expense({
      user: req.user.id, amount, currency: upperCaseCurrency, category, description,
      companyBaseCurrency: companyBaseCurrency, amountInCompanyCurrency: convertedAmount, status: 'Pending'
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error("SUBMIT EXPENSE FAILED:", error.message);
    res.status(500).json({ msg: 'Server error while submitting expense.' });
  }
};

// === GET MY EXPENSES (Employee) ===
const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error("Get My Expenses Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// === GET PENDING APPROVALS (Manager) ===
const getPendingApprovals = async (req, res) => {
  try {
    const teamMembers = await User.find({ manager: req.user.id });
    const teamMemberIds = teamMembers.map(member => member._id);
    const pendingExpenses = await Expense.find({
      user: { $in: teamMemberIds },
      status: 'Pending'
    }).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(pendingExpenses);
  } catch (error) {
    console.error("Get Approvals Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// === APPROVE EXPENSE (Manager) ===
const approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('user');
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    if (!expense.user) {
      return res.status(404).json({ msg: 'Original user for this expense not found.' });
    }
    if (!expense.user.manager || expense.user.manager.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to approve this expense' });
    }
    expense.status = 'Approved';
    expense.comments = req.body.comments || 'Approved';
    await expense.save();
    res.json(expense);
  } catch (error) {
    console.error("Approve Expense Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// === REJECT EXPENSE (Manager) ===
const rejectExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('user');
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    if (!expense.user) {
      return res.status(404).json({ msg: 'Original user for this expense not found.' });
    }
    if (!expense.user.manager || expense.user.manager.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to reject this expense' });
    }
    if (!req.body.comments) {
      return res.status(400).json({ msg: 'Comments are required for rejection.' });
    }
    expense.status = 'Rejected';
    expense.comments = req.body.comments;
    await expense.save();
    res.json(expense);
  } catch (error) {
    console.error("Reject Expense Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// === GET ALL EXPENSES (Admin) ===
const getAllExpenses = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Not authorized.' });
  }
  try {
    const expenses = await Expense.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error("Get All Expenses Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// === UPDATE EXPENSE STATUS (Admin) ===
const updateExpenseStatusByAdmin = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Not authorized.' });
  }
  try {
    const { status, comments } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status.' });
    }
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found.' });
    }
    expense.status = status;
    expense.comments = comments || `Overridden by Admin`;
    await expense.save();
    res.json(expense);
  } catch (error) {
    console.error("Admin Override Error:", error.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { 
    submitExpense, 
    getMyExpenses, 
    approveExpense, 
    rejectExpense, 
    getPendingApprovals,
    getAllExpenses,
    updateExpenseStatusByAdmin
};