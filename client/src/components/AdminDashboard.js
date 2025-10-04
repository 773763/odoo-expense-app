import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Box, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, Container, Stack, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]); // <-- Naya state
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [assignment, setAssignment] = useState({ employeeId: '', managerId: '' });
  const { enqueueSnackbar } = useSnackbar();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    }
  };

  const fetchAllExpenses = async () => { // <-- Naya function
    try {
      const res = await api.get('/expenses/all');
      setAllExpenses(res.data);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to fetch all expenses', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllExpenses(); // Dono ko fetch karo
  }, []);

  const handleNewUserChange = e => setNewUser({ ...newUser, [e.target.name]: e.target.value });
  const handleAssignmentChange = e => setAssignment({ ...assignment, [e.target.name]: e.target.value });

  const handleCreateUser = async e => {
    e.preventDefault();
    try {
      await api.post('/users/create', newUser);
      enqueueSnackbar('User created successfully!', { variant: 'success' });
      fetchUsers();
      fetchAllExpenses(); // Expense list bhi refresh karo
      setNewUser({ name: '', email: '', password: '', role: 'Employee' });
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message;
      enqueueSnackbar('Failed to create user: ' + errorMsg, { variant: 'error' });
      console.error(err);
    }
  };

  const handleAssignManager = async e => {
    e.preventDefault();
    try {
      await api.put('/users/assign-manager', assignment);
      enqueueSnackbar('Manager assigned successfully!', { variant: 'success' });
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message;
      enqueueSnackbar('Failed to assign manager: ' + errorMsg, { variant: 'error' });
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await api.delete(`/users/${userId}`);
        enqueueSnackbar('User deleted successfully!', { variant: 'success' });
        fetchUsers();
        fetchAllExpenses(); // Expense list bhi refresh karo
      } catch (err) {
        const errorMsg = err.response?.data?.msg || err.message;
        enqueueSnackbar('Failed to delete user: ' + errorMsg, { variant: 'error' });
        console.error(err);
      }
    }
  };

  // === NEW: ADMIN OVERRIDE HANDLER ===
  const handleOverride = async (expenseId, newStatus) => {
    try {
      await api.put(`/expenses/${expenseId}/status`, { status: newStatus });
      enqueueSnackbar(`Expense status updated to ${newStatus}`, { variant: 'success' });
      fetchAllExpenses(); // List ko refresh karo
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message;
      enqueueSnackbar('Failed to override status: ' + errorMsg, { variant: 'error' });
    }
  };
  
  const employees = users.filter(u => u.role === 'Employee');
  const managers = users.filter(u => u.role === 'Manager');

  return (
    <Container maxWidth="xl"> 
      <Stack spacing={4}>
        
        <Paper component="form" onSubmit={handleCreateUser} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Create New User</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
            <TextField label="Name" name="name" value={newUser.name} onChange={handleNewUserChange} required />
            <TextField label="Email" name="email" type="email" value={newUser.email} onChange={handleNewUserChange} required />
            <TextField label="Password" name="password" type="password" value={newUser.password} onChange={handleNewUserChange} required />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={newUser.role} onChange={handleNewUserChange} label="Role">
                <MenuItem value="Employee">Employee</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </Select>
            </FormControl>
            {/* === BUTTON STYLING FIX === */}
            <Button type="submit" variant="contained" sx={{ whiteSpace: 'nowrap', minWidth: '140px' }}>Create User</Button>
          </Stack>
        </Paper>

        <Paper component="form" onSubmit={handleAssignManager} sx={{ p: 3 }}>
           <Typography variant="h5" gutterBottom>Assign Manager</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <FormControl fullWidth>
                <InputLabel>Select Employee</InputLabel>
                <Select name="employeeId" value={assignment.employeeId} onChange={handleAssignmentChange} label="Select Employee">
                    {employees.map(e => <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Select Manager</InputLabel>
                <Select name="managerId" value={assignment.managerId} onChange={handleAssignmentChange} label="Select Manager">
                    {managers.map(m => <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>)}
                </Select>
              </FormControl>
            {/* === BUTTON STYLING FIX === */}
            <Button type="submit" variant="contained" sx={{ minWidth: '130px' }}>Assign</Button>
          </Stack>
        </Paper>

        {/* === NEW: ALL EXPENSES TABLE FOR ADMIN === */}
        <Paper sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography variant="h5" gutterBottom sx={{ p: 1 }}>All Company Expenses</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Override Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allExpenses.map(expense => (
                  <TableRow key={expense._id}>
                    <TableCell>{expense.user?.name || 'Deleted User'}</TableCell>
                    <TableCell>{expense.amountInCompanyCurrency?.toFixed(2)} {expense.companyBaseCurrency}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.status} 
                        color={expense.status === 'Approved' ? 'success' : expense.status === 'Rejected' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {expense.status === 'Pending' && (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button size="small" variant="contained" color="success" onClick={() => handleOverride(expense._id, 'Approved')}>Approve</Button>
                          <Button size="small" variant="contained" color="error" onClick={() => handleOverride(expense._id, 'Rejected')}>Reject</Button>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        <Paper sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography variant="h5" gutterBottom sx={{ p: 1 }}>All Users</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell align="center">
                      {user.role !== 'Admin' && (
                        <Button variant="contained" color="error" onClick={() => handleDeleteUser(user._id)}>
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      </Stack>
    </Container>
  );
};

export default AdminDashboard;