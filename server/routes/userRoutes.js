// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  signupAdmin, 
  loginUser, 
  createUser, 
  assignManager, 
  getAllUsers, 
  deleteUser // <-- YAHAN IMPORT KARO
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.post('/signup/admin', signupAdmin);
router.post('/login', loginUser);

// Protected Admin Routes
router.post('/create', protect, createUser);
router.put('/assign-manager', protect, assignManager);
router.get('/', protect, getAllUsers);
router.delete('/:id', protect, deleteUser); // <-- YEH NAYI ROUTE ADD KARO

module.exports = router;