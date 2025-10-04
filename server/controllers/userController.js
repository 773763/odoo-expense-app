// server/controllers/userController.js
const User = require('../models/userModel');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// NOTE: Humne .env wali problem ko solve karne ke liye secret key yahan direct likh di hai
const JWT_SECRET_KEY = 'mySuperSecretKeyForOdooHackathon12345';

// === SIGNUP ADMIN FUNCTION ===
const signupAdmin = async (req, res) => {
  const { name, email, password, country } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const response = await axios.get(`https://restcountries.com/v3.1/name/${country}?fields=currencies`);
    const currencyData = response.data[0].currencies;
    const currencyCode = Object.keys(currencyData)[0];
    user = new User({
      name, email, password, role: 'Admin',
      company: { name: `${name}'s Company`, baseCurrency: currencyCode, },
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.status(201).json({
      message: "Admin registered successfully!",
      userId: user._id
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// === LOGIN USER FUNCTION ===
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };
    jwt.sign(
      payload,
      JWT_SECRET_KEY,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// === CREATE USER FUNCTION (ADMIN ONLY) ===
const createUser = async (req, res) => {
  if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Not authorized. Only Admins can create users.' });
  }
  const { name, email, password, role, managerId } = req.body;
  try {
      let user = await User.findOne({ email });
      if (user) {
          return res.status(400).json({ msg: 'User with this email already exists' });
      }
      user = new User({
          name,
          email,
          password,
          role,
          company: req.user.company,
          manager: managerId
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      res.status(201).json({ message: `${role} created successfully!`, userId: user._id });
  } catch (error) {
      console.error("Create User Error:", error.message);
      res.status(500).send('Server Error');
  }
};

// === ASSIGN MANAGER FUNCTION ===
const assignManager = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Not authorized. Only Admins can assign managers.' });
  }
  const { employeeId, managerId } = req.body;
  try {
    const employee = await User.findById(employeeId);
    const manager = await User.findById(managerId);
    if (!employee || employee.role !== 'Employee') {
      return res.status(404).json({ msg: 'Employee not found.' });
    }
    if (!manager || manager.role !== 'Manager') {
      return res.status(404).json({ msg: 'Manager not found.' });
    }
    employee.manager = managerId;
    await employee.save();
    res.json({ msg: `Successfully assigned ${manager.name} to ${employee.name}` });
  } catch (error) {
    console.error("Assign Manager Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// === GET ALL USERS FUNCTION ===
const getAllUsers = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Not authorized. Only Admins can view all users.' });
  }
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error("Get All Users Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// === NEW DELETE USER FUNCTION (ADMIN ONLY) ===
const deleteUser = async (req, res) => {
  // Check if the logged-in user is an Admin
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Not authorized. Only Admins can delete users.' });
  }

  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Admins cannot be deleted to protect the system
    if (userToDelete.role === 'Admin') {
      return res.status(400).json({ msg: 'Cannot delete an Admin user.' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: 'User deleted successfully' });

  } catch (error) {
    console.error("Delete User Error:", error.message);
    res.status(500).send('Server Error');
  }
};

// module.exports ko update karo
module.exports = {
  signupAdmin,
  loginUser,
  createUser,
  assignManager,
  getAllUsers,
  deleteUser // <-- YAHAN ADD KARO
};