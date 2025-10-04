const express = require('express');
const router = express.Router();
const { 
  submitExpense, 
  getMyExpenses, 
  getPendingApprovals,
  approveExpense, 
  rejectExpense, 
  getAllExpenses,
  updateExpenseStatusByAdmin
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// === ADMIN ROUTES ===
router.route('/all').get(protect, getAllExpenses);
router.route('/:id/status').put(protect, updateExpenseStatusByAdmin);

// === MANAGER ROUTES ===
router.route('/pending-approvals').get(protect, getPendingApprovals);
router.route('/:id/approve').put(protect, approveExpense);
router.route('/:id/reject').put(protect, rejectExpense);

// === EMPLOYEE ROUTES ===
router.route('/').post(protect, submitExpense);
router.route('/my-expenses').get(protect, getMyExpenses);

module.exports = router;