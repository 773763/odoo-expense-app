import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Container, Box } from '@mui/material';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdminDashboard from './AdminDashboard'; // Import the new component

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let user = null;

  if (token) {
    user = jwtDecode(token).user;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Logged out successfully');
    navigate('/login');
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Typography variant="h4">Welcome to your Dashboard</Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Typography variant="h6">Your Role: {user?.role}</Typography>
      
      {/* Conditionally render dashboards based on user role */}
      {user?.role === 'Employee' && <EmployeeDashboard />}
      {user?.role === 'Manager' && <ManagerDashboard />}
      {user?.role === 'Admin' && <AdminDashboard />} {/* Add this line */}
    </Container>
  );
};

export default Dashboard;