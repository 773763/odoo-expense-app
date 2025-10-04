import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Stack, TextField, Container } from '@mui/material';
import { useSnackbar } from 'notistack';

const ManagerDashboard = () => {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [comments, setComments] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  const fetchPendingExpenses = async () => {
    try {
      const res = await api.get('/expenses/pending-approvals');
      setPendingExpenses(res.data);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to fetch pending approvals', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const handleCommentChange = (expenseId, value) => {
    setComments({ ...comments, [expenseId]: value });
  };

  const handleApprove = async (expenseId) => {
    try {
      await api.put(`/expenses/${expenseId}/approve`, { comments: comments[expenseId] || 'Approved' });
      enqueueSnackbar('Expense Approved!', { variant: 'success' });
      fetchPendingExpenses(); // List refresh karo
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message;
      enqueueSnackbar('Failed to approve: ' + errorMsg, { variant: 'error' });
    }
  };

  const handleReject = async (expenseId) => {
    const reason = comments[expenseId];
    if (!reason) {
      return enqueueSnackbar('Please provide a reason in comments for rejection.', { variant: 'warning' });
    }
    try {
      await api.put(`/expenses/${expenseId}/reject`, { comments: reason });
      enqueueSnackbar('Expense Rejected!', { variant: 'info' });
      fetchPendingExpenses(); // List refresh karo
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message;
      enqueueSnackbar('Failed to reject: ' + errorMsg, { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" gutterBottom sx={{ p: 1 }}>Pending Approvals</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Comments</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingExpenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>{expense.user?.name || 'Deleted User'}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>
                    {expense.amountInCompanyCurrency ? (
                      <>
                        <Typography variant="body1">{expense.amountInCompanyCurrency.toFixed(2)} {expense.companyBaseCurrency}</Typography>
                        <Typography variant="caption" display="block">({expense.amount} {expense.currency})</Typography>
                      </>
                    ) : ( `${expense.amount} ${expense.currency}` )}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <TextField 
                      label="Reason (for reject)"
                      variant="outlined"
                      onChange={(e) => handleCommentChange(expense._id, e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
                      <Button variant="contained" color="success" onClick={() => handleApprove(expense._id)}>Approve</Button>
                      <Button variant="contained" color="error" onClick={() => handleReject(expense._id)}>Reject</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ManagerDashboard;