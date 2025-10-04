import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Box, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Stack, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { PhotoCamera } from '@mui/icons-material';

const EmployeeDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ amount: '', currency: '', category: '', description: '' });
  const { enqueueSnackbar } = useSnackbar();

  const fetchMyExpenses = async () => {
    try {
      const res = await api.get('/expenses/my-expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Could not fetch your expense history', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchMyExpenses();
  }, []);

  const handleChange = e => {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/expenses', newExpense);
      enqueueSnackbar('Expense submitted successfully!', { variant: 'success' });
      fetchMyExpenses();
      setNewExpense({ amount: '', currency: '', category: '', description: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message;
      enqueueSnackbar('Failed to submit expense: ' + errorMsg, { variant: 'error' });
      console.error(err);
    }
  };

  const handleOcrSimulation = () => {
    setNewExpense({
      amount: '1500',
      currency: 'INR',
      category: 'Team Lunch',
      description: 'Auto-filled from receipt scan'
    });
    enqueueSnackbar('Expense data extracted from receipt!', { variant: 'info' });
  };

  return (
    <Container maxWidth="lg">
      <Stack spacing={4}>
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5">Submit a New Expense</Typography>
            <Button 
              variant="outlined" 
              startIcon={<PhotoCamera />}
              onClick={handleOcrSimulation}
            >
              Scan Receipt (Demo)
            </Button>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField label="Amount *" name="amount" type="number" value={newExpense.amount} onChange={handleChange} required />
            <TextField label="Currency *" name="currency" placeholder="e.g., USD" value={newExpense.currency} onChange={handleChange} required />
            <TextField label="Category *" name="category" value={newExpense.category} onChange={handleChange} required />
            <TextField label="Description" name="description" value={newExpense.description} onChange={handleChange} />
            <Button type="submit" variant="contained">Submit</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography variant="h5" gutterBottom sx={{p: 1}}>Your Expense History</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Manager's Comments</TableCell> {/* <-- NAYA COLUMN */}
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map(exp => (
                  <TableRow key={exp._id}>
                    <TableCell>{new Date(exp.expenseDate).toLocaleDateString()}</TableCell>
                    <TableCell>{exp.category}</TableCell>
                    <TableCell>{exp.amount} {exp.currency}</TableCell>
                    <TableCell>
                      {/* Status ko behtar dikhane ke liye Chip component */}
                      <Chip 
                        label={exp.status} 
                        color={exp.status === 'Approved' ? 'success' : exp.status === 'Rejected' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {/* Comment sirf tabhi dikhega jab status 'Rejected' ho */}
                      {exp.status === 'Rejected' && exp.comments}
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

export default EmployeeDashboard;